import { useState } from 'react';
import clsx from 'clsx';
import { categories } from '../../data/categories';
import { cabinetSubCategories } from '../../data/cabinetSubcategories';
import { cageSubCategories } from '../../data/cageSubcategories';
import { crossConnectSubCategories } from '../../data/crossConnectSubcategories';
import { powerSubCategories } from '../../data/powerSubcategories';
import { countriesByRegion } from '../../data/countries';
import { priceRange } from '../../data/products';
import { formatPrice } from '../../data/localeConfig';
import { useCatalog } from '../../context/CatalogContext';
import { DimensionFilterSection } from './DimensionFilterSection';
import { DisplayUnitSelector } from './DisplayUnitSelector';
import type { CategoryId, CountryId, Region } from '../../types';
import type { ProductSubCategoryId } from '../../types/productSubcategories';
import { isCabinetSubCategoryId } from '../../utils/cabinetSubcategories';
import { isCageSubCategoryId } from '../../utils/cageSubcategories';
import { isCrossConnectSubCategoryId } from '../../utils/crossConnectSubcategories';
import { sortCountriesByCatalogFrequency } from '../../utils/countryCatalogFrequency';
import { isPowerSubCategoryId } from '../../utils/powerSubcategories';
import type { DimensionFilters, DisplayUnit } from '../../types/dimensions';

interface FilterSidebarProps {
  visible: boolean;
  onToggle: () => void;
  regions: Region[];
  countries: CountryId[];
  allRegions: Region[];
  categoryId: CategoryId | null;
  subCategoryId: ProductSubCategoryId | null;
  priceMin: number;
  priceMax: number;
  showDimensionFilters: boolean;
  dimensionFilters: DimensionFilters;
  displayUnit: DisplayUnit;
  onToggleRegion: (region: Region) => void;
  onToggleCountry: (countryId: CountryId) => void;
  onSetCategory: (
    id: CategoryId | null,
    subCategoryId?: ProductSubCategoryId | null,
  ) => void;
  onSetPriceRange: (min: number, max: number) => void;
  onSetRackUnits: (value: number | null) => void;
  onSetWidth: (valueMm: number | null) => void;
  onSetDepth: (valueMm: number | null) => void;
  onDisplayUnitChange: (unit: DisplayUnit) => void;
  onClearAll: () => void;
}

export function FilterSidebar({
  visible,
  onToggle,
  regions,
  countries,
  allRegions,
  categoryId,
  subCategoryId,
  priceMin,
  priceMax,
  onToggleRegion,
  onToggleCountry,
  onSetCategory,
  onSetPriceRange,
  showDimensionFilters,
  dimensionFilters,
  displayUnit,
  onSetRackUnits,
  onSetWidth,
  onSetDepth,
  onDisplayUnitChange,
  onClearAll,
}: FilterSidebarProps) {
  const [openRegion, setOpenRegion] = useState<Region | null>(null);
  const { currencyCountryId } = useCatalog();

  if (!visible) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="text-brand-red text-sm font-semibold bg-transparent border-none cursor-pointer p-0 hover:underline mb-4"
      >
        Show Filters
      </button>
    );
  }

  const toggleDropdown = (region: Region) => {
    setOpenRegion((current) => (current === region ? null : region));
  };

  return (
    <aside className="w-72 shrink-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold m-0">Filters</h2>
        <button
          type="button"
          onClick={onToggle}
          className="text-brand-red text-xs font-semibold bg-transparent border-none cursor-pointer p-0 hover:underline"
        >
          Hide Filters
        </button>
      </div>

      <div className="border border-border rounded-sm divide-y divide-border">
        <FilterSection title="Category">
          <label className="flex items-center gap-2 py-1.5 cursor-pointer text-sm">
            <input
              type="radio"
              name="category"
              checked={!categoryId}
              onChange={() => onSetCategory(null)}
              className="accent-brand-red"
            />
            All Categories
          </label>
          {categories.map((cat) => (
            <div key={cat.id}>
              <label className="flex items-center gap-2 py-1.5 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="category"
                  checked={categoryId === cat.id}
                  onChange={() => onSetCategory(cat.id)}
                  className="accent-brand-red"
                />
                {cat.name}
              </label>

              {cat.id === 'cabinet-accessories' &&
                categoryId === 'cabinet-accessories' &&
                (!subCategoryId || isCabinetSubCategoryId(subCategoryId)) && (
                  <CategorySubCategoryFilters
                    name="cabinet-subcategory"
                    allLabel="All Cabinet Accessories"
                    allId="cabinet-all"
                    groups={cabinetSubCategories}
                    subCategoryId={subCategoryId}
                    onSelect={(id) => onSetCategory('cabinet-accessories', id)}
                  />
                )}

              {cat.id === 'cross-connect-accessories' &&
                categoryId === 'cross-connect-accessories' &&
                (!subCategoryId || isCrossConnectSubCategoryId(subCategoryId)) && (
                  <CategorySubCategoryFilters
                    name="cross-connect-subcategory"
                    allLabel="All Cross Connect Accessories"
                    allId="cross-connect-all"
                    groups={crossConnectSubCategories}
                    subCategoryId={subCategoryId}
                    onSelect={(id) => onSetCategory('cross-connect-accessories', id)}
                  />
                )}

              {cat.id === 'cage-accessories' &&
                categoryId === 'cage-accessories' &&
                (!subCategoryId || isCageSubCategoryId(subCategoryId)) && (
                  <CategorySubCategoryFilters
                    name="cage-subcategory"
                    allLabel="All Cage Accessories"
                    allId="cage-all"
                    groups={cageSubCategories}
                    subCategoryId={subCategoryId}
                    onSelect={(id) => onSetCategory('cage-accessories', id)}
                  />
                )}

              {cat.id === 'power-accessories' &&
                categoryId === 'power-accessories' &&
                (!subCategoryId || isPowerSubCategoryId(subCategoryId)) && (
                  <CategorySubCategoryFilters
                    name="power-subcategory"
                    allLabel="All Power Accessories"
                    allId="power-all"
                    groups={powerSubCategories}
                    subCategoryId={subCategoryId}
                    onSelect={(id) => onSetCategory('power-accessories', id)}
                  />
                )}
            </div>
          ))}
        </FilterSection>

        <FilterSection title="Display Units">
          <DisplayUnitSelector
            id="sidebar-display-unit"
            value={displayUnit}
            onChange={onDisplayUnitChange}
          />
        </FilterSection>

        {showDimensionFilters && (
          <DimensionFilterSection
            dimensionFilters={dimensionFilters}
            displayUnit={displayUnit}
            onSetRackUnits={onSetRackUnits}
            onSetWidth={onSetWidth}
            onSetDepth={onSetDepth}
          />
        )}

        <FilterSection title="Price Range">
          <div className="space-y-3">
            <input
              type="range"
              min={priceRange.min}
              max={priceRange.max}
              step={100}
              value={priceMax}
              onChange={(e) => onSetPriceRange(priceMin, Number(e.target.value))}
              className="w-full accent-brand-red"
            />
            <div className="flex justify-between text-xs font-mono text-text-muted">
              <span>{formatPrice(priceMin, currencyCountryId)}</span>
              <span>{formatPrice(priceMax, currencyCountryId)}</span>
            </div>
          </div>
        </FilterSection>

        <FilterSection title="Region">
          <div className="space-y-2">
            {allRegions.map((region) => (
              <RegionDropdown
                key={region}
                region={region}
                isOpen={openRegion === region}
                isActive={regions.includes(region)}
                selectedCountries={countries}
                onToggleOpen={() => toggleDropdown(region)}
                onToggleRegion={() => onToggleRegion(region)}
                onToggleCountry={onToggleCountry}
              />
            ))}
          </div>
        </FilterSection>
      </div>

      <button
        type="button"
        onClick={onClearAll}
        className="mt-4 text-brand-red text-sm font-semibold bg-transparent border-none cursor-pointer p-0 hover:underline"
      >
        Clear All
      </button>
    </aside>
  );
}

interface RegionDropdownProps {
  region: Region;
  isOpen: boolean;
  isActive: boolean;
  selectedCountries: CountryId[];
  onToggleOpen: () => void;
  onToggleRegion: () => void;
  onToggleCountry: (countryId: CountryId) => void;
}

function RegionDropdown({
  region,
  isOpen,
  isActive,
  selectedCountries,
  onToggleOpen,
  onToggleRegion,
  onToggleCountry,
}: RegionDropdownProps) {
  const regionCountries = sortCountriesByCatalogFrequency(countriesByRegion[region]);
  const selectedCount = regionCountries.filter((c) => selectedCountries.includes(c.id)).length;

  return (
    <div
      className={clsx(
        'border border-border rounded-sm overflow-hidden',
        !isActive && 'opacity-60',
      )}
    >
      <div className="flex items-center bg-surface-muted">
        <label className="flex items-center gap-2 pl-3 py-2.5 cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={isActive}
            onChange={onToggleRegion}
            className="accent-brand-red"
            aria-label={`Include ${region} region`}
          />
        </label>

        <button
          type="button"
          onClick={onToggleOpen}
          aria-expanded={isOpen}
          className="flex flex-1 items-center justify-between gap-2 py-2.5 pr-3 bg-transparent border-none cursor-pointer text-sm font-semibold text-left hover:text-brand-red transition-colors"
        >
          <span>{region}</span>
          <span className="flex items-center gap-2 text-xs font-normal text-text-muted">
            {isActive && (
              <span className="font-mono">
                {selectedCount}/{regionCountries.length}
              </span>
            )}
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              className={clsx('transition-transform shrink-0', isOpen && 'rotate-180')}
              aria-hidden
            >
              <path
                d="M2 4L6 8L10 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
      </div>

      {isOpen && (
        <div className="max-h-48 overflow-y-auto border-t border-border bg-surface py-1">
          {regionCountries.map((country) => (
            <label
              key={country.id}
              className={clsx(
                'flex items-center gap-2 px-3 py-1.5 cursor-pointer text-sm hover:bg-accent-subtle',
                !isActive && 'pointer-events-none',
              )}
            >
              <input
                type="checkbox"
                checked={selectedCountries.includes(country.id)}
                disabled={!isActive}
                onChange={() => onToggleCountry(country.id)}
                className="accent-brand-red"
              />
              {country.name}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function CategorySubCategoryFilters({
  name,
  allLabel,
  allId,
  groups,
  subCategoryId,
  onSelect,
}: {
  name: string;
  allLabel: string;
  allId: ProductSubCategoryId;
  groups: Array<{
    id: ProductSubCategoryId;
    name: string;
    description?: string;
    children?: Array<{ id: ProductSubCategoryId; name: string; description?: string }>;
  }>;
  subCategoryId: ProductSubCategoryId | null;
  onSelect: (id: ProductSubCategoryId) => void;
}) {
  const isAll = !subCategoryId || subCategoryId === allId;

  return (
    <div className="ml-6 mb-2 pl-3 border-l-2 border-red-100 space-y-1">
      <label className="flex items-center gap-2 py-1 cursor-pointer text-xs">
        <input
          type="radio"
          name={name}
          checked={isAll}
          onChange={() => onSelect(allId)}
          className="accent-brand-red"
        />
        {allLabel}
      </label>

      {groups.map((group) => (
        <div key={group.id}>
          <label className="flex items-center gap-2 py-1 cursor-pointer text-xs font-semibold">
            <input
              type="radio"
              name={name}
              checked={subCategoryId === group.id}
              onChange={() => onSelect(group.id)}
              className="accent-brand-red"
            />
            {group.name}
          </label>

          {group.children?.map((child) => (
            <label
              key={child.id}
              className="flex items-center gap-2 py-1 pl-5 cursor-pointer text-xs text-text-muted"
            >
              <input
                type="radio"
                name={name}
                checked={subCategoryId === child.id}
                onChange={() => onSelect(child.id)}
                className="accent-brand-red"
              />
              {child.name}
            </label>
          ))}
        </div>
      ))}
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-4">
      <h3 className="text-sm font-bold mb-3 m-0">{title}</h3>
      <div>{children}</div>
    </div>
  );
}
