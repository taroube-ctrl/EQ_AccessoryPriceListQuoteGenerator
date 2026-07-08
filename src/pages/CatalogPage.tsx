import { useCatalog } from '../context/CatalogContext';
import { FilterChips } from '../components/catalog/FilterChips';
import { FilterSidebar } from '../components/catalog/FilterSidebar';
import { RegionBanner } from '../components/catalog/RegionBanner';
import { SortControl } from '../components/catalog/SortControl';
import { ProductGrid } from '../components/catalog/ProductGrid';
import { EditorialBlock } from '../components/catalog/EditorialBlock';
import { RelatedCategories } from '../components/catalog/RelatedCategories';
import { InstallationCostsView } from '../components/installation/InstallationCostsView';

export function CatalogPage() {
  const {
    filters,
    filteredProducts,
    filtersVisible,
    setFiltersVisible,
    toggleRegion,
    toggleCountry,
    setCategory,
    setPriceRange,
    setSort,
    clearFilters,
    removeRegion,
    removeCountry,
    narrowedCountries,
    allRegions,
    showDimensionFilters,
    displayUnit,
    setDisplayUnit,
    setDimensionRackUnits,
    setDimensionWidth,
    setDimensionDepth,
    dimensionFilterActive,
  } = useCatalog();

  const showFilterChips =
    filters.regions.length < allRegions.length ||
    narrowedCountries.length > 0 ||
    dimensionFilterActive;

  const isInstallationCosts = filters.categoryId === 'installation-costs';

  return (
    <main className="max-w-[1440px] mx-auto px-6 py-6">
      {isInstallationCosts ? (
        <InstallationCostsView />
      ) : (
        <div className="flex gap-8">
          <FilterSidebar
            visible={filtersVisible}
            onToggle={() => setFiltersVisible(!filtersVisible)}
            regions={filters.regions}
            countries={filters.countries}
            allRegions={allRegions}
            categoryId={filters.categoryId}
            subCategoryId={filters.subCategoryId}
            priceMin={filters.priceMin}
            priceMax={filters.priceMax}
            onToggleRegion={toggleRegion}
            onToggleCountry={toggleCountry}
            onSetCategory={setCategory}
            onSetPriceRange={setPriceRange}
            showDimensionFilters={showDimensionFilters}
            dimensionFilters={filters.dimensions}
            displayUnit={displayUnit}
            onSetRackUnits={setDimensionRackUnits}
            onSetWidth={setDimensionWidth}
            onSetDepth={setDimensionDepth}
            onDisplayUnitChange={setDisplayUnit}
            onClearAll={clearFilters}
          />

          <div className="flex-1 min-w-0">
            <RegionBanner />

            <SortControl
              value={filters.sort}
              onChange={setSort}
              resultCount={filteredProducts.length}
              displayUnit={displayUnit}
              onDisplayUnitChange={setDisplayUnit}
            />

            {showFilterChips && (
              <FilterChips
                selectedRegions={filters.regions}
                allRegions={allRegions}
                narrowedCountries={narrowedCountries}
                dimensionFilters={filters.dimensions}
                dimensionFilterActive={dimensionFilterActive}
                displayUnit={displayUnit}
                onRemoveRegion={removeRegion}
                onRemoveCountry={removeCountry}
                onSetRackUnits={setDimensionRackUnits}
                onSetWidth={setDimensionWidth}
                onSetDepth={setDimensionDepth}
              />
            )}

            <ProductGrid products={filteredProducts} />

            <div className="mt-6">
              <SortControl
                id="sort-bottom"
                value={filters.sort}
                onChange={setSort}
                resultCount={filteredProducts.length}
              />
            </div>

            <EditorialBlock categoryId={filters.categoryId} />
            <RelatedCategories
              activeCategory={filters.categoryId}
              onSelect={setCategory}
            />
          </div>
        </div>
      )}
    </main>
  );
}
