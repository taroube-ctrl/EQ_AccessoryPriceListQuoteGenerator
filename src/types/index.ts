export type Region = 'AMER' | 'APAC' | 'EMEA';

export type CountryId =
  | 'brazil'
  | 'canada'
  | 'chile'
  | 'colombia'
  | 'mexico'
  | 'peru'
  | 'united-states'
  | 'australia'
  | 'china'
  | 'hong-kong'
  | 'india'
  | 'indonesia'
  | 'japan'
  | 'malaysia'
  | 'philippines'
  | 'singapore'
  | 'south-korea'
  | 'bulgaria'
  | 'finland'
  | 'france'
  | 'germany'
  | 'ireland'
  | 'italy'
  | 'netherlands'
  | 'oman'
  | 'poland'
  | 'portugal'
  | 'spain'
  | 'sweden'
  | 'switzerland'
  | 'turkey'
  | 'united-arab-emirates'
  | 'united-kingdom';

export interface Country {
  id: CountryId;
  name: string;
  region: Region;
}

export type CategoryId =
  | 'cabinet-accessories'
  | 'power-accessories'
  | 'cross-connect-accessories'
  | 'cage-accessories'
  | 'installation-costs';

export type SortOption = 'relevance' | 'featured' | 'price-asc' | 'price-desc' | 'name-asc';

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  itemCount: number;
}

export type { ProductDimensions, DimensionFilters, DisplayUnit } from './dimensions';
export { EMPTY_DIMENSION_FILTERS } from './dimensions';

export interface Product {
  id: string;
  sku: string;
  brand?: string;
  brandCode?: string;
  partNumber?: string;
  name: string;
  description: string;
  purpose?: string;
  price: number;
  categoryId: CategoryId;
  regions: Region[];
  countries?: CountryId[];
  pricing?: Partial<Record<CountryId, CountryProductPrice>>;
  dimensions?: import('./dimensions').ProductDimensions;
  imagePlaceholder?: string;
}

export interface CountryProductPrice {
  customerPrice: number;
  equinixPrice?: number;
}

export interface CatalogFilters {
  search: string;
  regions: Region[];
  countries: CountryId[];
  categoryId: CategoryId | null;
  subCategoryId: import('./productSubcategories').ProductSubCategoryId | null;
  priceMin: number;
  priceMax: number;
  sort: SortOption;
  dimensions: import('./dimensions').DimensionFilters;
}
