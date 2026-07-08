import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  allCountryIds,
  countriesByRegion,
  getCountriesForRegions,
  getCountryIdsForRegions,
} from '../data/countries';
import { products, priceRange } from '../data/products';
import { buildFiltersForLocation } from '../utils/detectUserLocation';
import {
  compareDimensionDistance,
  createDefaultDimensionFilters,
  getDimensionOptions,
  isDimensionFilterActive,
} from '../utils/dimensionFilters';
import { getProductRelevanceScore } from '../utils/productRelevance';
import { getProductDisplayPrice, getProductPrice } from '../utils/productPricing';
import { matchesProductSubCategory } from '../utils/productSubcategories';
import { loadStoredDisplayUnit, saveDisplayUnit } from '../utils/dimensions';
import { DEFAULT_DISPLAY_UNIT, type DisplayUnit } from '../types/dimensions';
import type {
  CatalogFilters,
  CategoryId,
  CountryId,
  Product,
  Region,
  SortOption,
} from '../types';
import type { ProductSubCategoryId } from '../types/productSubcategories';

const ALL_REGIONS: Region[] = ['AMER', 'APAC', 'EMEA'];

const dimensionOptions = getDimensionOptions(products);

function createDefaultFilters(
  regions: Region[] = [...ALL_REGIONS],
  countries: CountryId[] = [...allCountryIds],
): CatalogFilters {
  return {
    search: '',
    regions,
    countries,
    categoryId: null,
    subCategoryId: null,
    priceMin: priceRange.min,
    priceMax: priceRange.max,
    sort: 'featured',
    dimensions: createDefaultDimensionFilters(),
  };
}

function getComparablePrice(
  product: Product,
  userCountry: CountryId,
  selectedCountries: CountryId[],
): number | null {
  return getProductDisplayPrice(product, userCountry, selectedCountries)?.price ?? null;
}

function compareProducts(
  a: Product,
  b: Product,
  sort: SortOption,
  userCountry?: CountryId,
  selectedCountries: CountryId[] = [],
  search = '',
): number {
  if (sort === 'relevance') {
    const query = search.trim();
    if (!query) {
      return compareProducts(a, b, 'featured', userCountry, selectedCountries, search);
    }

    const scoreDiff = getProductRelevanceScore(b, query) - getProductRelevanceScore(a, query);
    if (scoreDiff !== 0) return scoreDiff;
    return a.name.localeCompare(b.name);
  }

  if (sort === 'featured' && userCountry) {
    const aLocal = getProductCountries(a).includes(userCountry) ? 0 : 1;
    const bLocal = getProductCountries(b).includes(userCountry) ? 0 : 1;
    return aLocal - bLocal;
  }

  switch (sort) {
    case 'price-asc': {
      const aPrice = userCountry
        ? getComparablePrice(a, userCountry, selectedCountries)
        : a.price;
      const bPrice = userCountry
        ? getComparablePrice(b, userCountry, selectedCountries)
        : b.price;
      return (aPrice ?? Number.POSITIVE_INFINITY) - (bPrice ?? Number.POSITIVE_INFINITY);
    }
    case 'price-desc': {
      const aPrice = userCountry
        ? getComparablePrice(a, userCountry, selectedCountries)
        : a.price;
      const bPrice = userCountry
        ? getComparablePrice(b, userCountry, selectedCountries)
        : b.price;
      return (bPrice ?? 0) - (aPrice ?? 0);
    }
    case 'name-asc':
      return a.name.localeCompare(b.name);
    default:
      return 0;
  }
}

function sortProducts(
  items: Product[],
  sort: SortOption,
  userCountry?: CountryId,
  selectedCountries: CountryId[] = [],
  search = '',
): Product[] {
  return [...items].sort((a, b) =>
    compareProducts(a, b, sort, userCountry, selectedCountries, search),
  );
}

export function getProductCountries(product: Product): CountryId[] {
  if (product.countries?.length) return product.countries;
  return getCountryIdsForRegions(product.regions);
}

function matchesCountryFilter(product: Product, filters: CatalogFilters): boolean {
  if (!product.regions.some((r) => filters.regions.includes(r))) return false;

  const activeCountryIds = getCountryIdsForRegions(filters.regions);
  const selectedInScope = filters.countries.filter((c) => activeCountryIds.includes(c));

  if (selectedInScope.length === activeCountryIds.length) return true;

  const productCountries = getProductCountries(product);
  return productCountries.some((c) => selectedInScope.includes(c));
}

interface UseCatalogFiltersOptions {
  userCountry: CountryId;
  userRegion: Region;
  locationReady: boolean;
}

export function useCatalogFilters({
  userCountry,
  userRegion,
  locationReady,
}: UseCatalogFiltersOptions) {
  const initializedRef = useRef(false);
  const [filters, setFilters] = useState<CatalogFilters>(() => createDefaultFilters());
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [displayUnit, setDisplayUnitState] = useState<DisplayUnit>(() =>
    loadStoredDisplayUnit(DEFAULT_DISPLAY_UNIT),
  );

  const setDisplayUnit = useCallback((unit: DisplayUnit) => {
    setDisplayUnitState(unit);
    saveDisplayUnit(unit);
  }, []);

  const dimensionFilterActive = isDimensionFilterActive(filters.dimensions);

  const showDimensionFilters =
    !filters.categoryId || filters.categoryId === 'cabinet-accessories';

  const applyUserLocation = useCallback(
    (countryId: CountryId, region: Region) => {
      const scoped = buildFiltersForLocation(countryId, region);
      setFilters((f) => ({ ...f, ...scoped }));
    },
    [],
  );

  useEffect(() => {
    if (!locationReady || initializedRef.current) return;
    applyUserLocation(userCountry, userRegion);
    initializedRef.current = true;
  }, [locationReady, userCountry, userRegion, applyUserLocation]);

  const filteredProducts = useMemo(() => {
    const activeCountryIds = getCountryIdsForRegions(filters.regions);
    const selectedCountries = filters.countries.filter((country) =>
      activeCountryIds.includes(country),
    );

    const result = products.filter((product) => {
      const matchesSearch =
        !filters.search ||
        product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.partNumber?.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.brand?.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.brandCode?.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.description.toLowerCase().includes(filters.search.toLowerCase());

      const matchesCategory =
        !filters.categoryId || product.categoryId === filters.categoryId;

      const isCategoryBrowse =
        filters.categoryId != null && filters.categoryId !== 'installation-costs';

      const matchesCountry =
        isCategoryBrowse && product.categoryId === filters.categoryId
          ? product.regions.some((region) => filters.regions.includes(region))
          : matchesCountryFilter(product, filters);

      const matchesSubCategory = matchesProductSubCategory(
        product,
        filters.categoryId,
        filters.subCategoryId,
      );

      const comparablePrice = getComparablePrice(product, userCountry, selectedCountries);
      const priceForFilter = comparablePrice ?? product.price;
      const matchesPrice =
        isCategoryBrowse && product.categoryId === filters.categoryId
          ? priceForFilter >= filters.priceMin && priceForFilter <= filters.priceMax
          : comparablePrice != null &&
            comparablePrice >= filters.priceMin &&
            comparablePrice <= filters.priceMax;

      return (
        matchesSearch &&
        matchesCountry &&
        matchesCategory &&
        matchesSubCategory &&
        matchesPrice
      );
    });

    if (dimensionFilterActive && showDimensionFilters) {
      return [...result].sort((a, b) => {
        const byDistance = compareDimensionDistance(a, b, filters.dimensions);
        if (byDistance !== 0) return byDistance;
        return compareProducts(a, b, filters.sort, userCountry, selectedCountries, filters.search);
      });
    }

    return sortProducts(result, filters.sort, userCountry, selectedCountries, filters.search);
  }, [filters, userCountry, dimensionFilterActive, showDimensionFilters]);

  const setSearch = (search: string) => setFilters((f) => ({ ...f, search }));

  const toggleRegion = (region: Region) => {
    setFilters((f) => {
      const has = f.regions.includes(region);
      if (has && f.regions.length === 1) return f;

      const regionCountryIds = countriesByRegion[region].map((c) => c.id);
      const regions = has
        ? f.regions.filter((r) => r !== region)
        : [...f.regions, region];
      const countries = has
        ? f.countries.filter((c) => !regionCountryIds.includes(c))
        : [...new Set([...f.countries, ...regionCountryIds])];

      return { ...f, regions, countries };
    });
  };

  const toggleCountry = (countryId: CountryId) => {
    setFilters((f) => {
      const activeCountryIds = getCountryIdsForRegions(f.regions);
      const selectedInScope = f.countries.filter((c) => activeCountryIds.includes(c));
      const has = f.countries.includes(countryId);

      if (has && selectedInScope.length === 1) return f;

      const countries = has
        ? f.countries.filter((c) => c !== countryId)
        : [...f.countries, countryId];

      return { ...f, countries };
    });
  };

  const setCategory = (
    categoryId: CategoryId | null,
    subCategoryId: ProductSubCategoryId | null = null,
  ) => {
    setFilters((f) => ({
      ...f,
      categoryId,
      subCategoryId:
        categoryId === 'cross-connect-accessories' ||
        categoryId === 'cage-accessories' ||
        categoryId === 'power-accessories' ||
        categoryId === 'cabinet-accessories'
          ? subCategoryId
          : null,
    }));
  };

  const clearSubCategory = () => {
    setFilters((f) => ({ ...f, subCategoryId: null }));
  };

  const setPriceRange = (priceMin: number, priceMax: number) => {
    setFilters((f) => ({ ...f, priceMin, priceMax }));
  };

  const setSort = (sort: SortOption) => setFilters((f) => ({ ...f, sort }));

  const setDimensionRackUnits = (value: number | null) => {
    setFilters((f) => ({
      ...f,
      dimensions: { ...f.dimensions, rackUnits: value },
    }));
  };

  const setDimensionWidth = (value: number | null) => {
    setFilters((f) => ({
      ...f,
      dimensions: { ...f.dimensions, widthMm: value },
    }));
  };

  const setDimensionDepth = (value: number | null) => {
    setFilters((f) => ({
      ...f,
      dimensions: { ...f.dimensions, depthMm: value },
    }));
  };

  const clearDimensionFilters = () => {
    setFilters((f) => ({
      ...f,
      dimensions: createDefaultDimensionFilters(),
    }));
  };

  const clearFilters = () => {
    const scoped = buildFiltersForLocation(userCountry, userRegion);
    setFilters(createDefaultFilters(scoped.regions, scoped.countries));
  };

  const removeRegion = (region: Region) => {
    setFilters((f) => {
      if (f.regions.length <= 1) return f;
      const regionCountryIds = countriesByRegion[region].map((c) => c.id);
      return {
        ...f,
        regions: f.regions.filter((r) => r !== region),
        countries: f.countries.filter((c) => !regionCountryIds.includes(c)),
      };
    });
  };

  const removeCountry = (countryId: CountryId) => {
    setFilters((f) => {
      const activeCountryIds = getCountryIdsForRegions(f.regions);
      const selectedInScope = f.countries.filter((c) => activeCountryIds.includes(c));
      if (selectedInScope.length <= 1) return f;
      return { ...f, countries: f.countries.filter((c) => c !== countryId) };
    });
  };

  const narrowedCountries = useMemo(() => {
    const activeCountryIds = getCountryIdsForRegions(filters.regions);
    const allSelected = activeCountryIds.every((id) => filters.countries.includes(id));
    if (allSelected) return [];
    return filters.countries.filter((id) => activeCountryIds.includes(id));
  }, [filters.regions, filters.countries]);

  const isUsingUserLocation =
    filters.regions.length === 1 &&
    filters.regions[0] === userRegion &&
    (userRegion === 'APAC' || userRegion === 'EMEA'
      ? getCountryIdsForRegions([userRegion]).every((id) => filters.countries.includes(id))
      : filters.countries.length === 1 && filters.countries[0] === userCountry);

  return {
    filters,
    filteredProducts,
    filtersVisible,
    setFiltersVisible,
    setSearch,
    toggleRegion,
    toggleCountry,
    setCategory,
    clearSubCategory,
    setPriceRange,
    setSort,
    clearFilters,
    removeRegion,
    removeCountry,
    applyUserLocation,
    narrowedCountries,
    isUsingUserLocation,
    displayUnit,
    setDisplayUnit,
    dimensionOptions,
    dimensionFilterActive,
    showDimensionFilters,
    setDimensionRackUnits,
    setDimensionWidth,
    setDimensionDepth,
    clearDimensionFilters,
    allRegions: ALL_REGIONS,
    countriesByRegion,
    allCountries: getCountriesForRegions(ALL_REGIONS),
  };
}
