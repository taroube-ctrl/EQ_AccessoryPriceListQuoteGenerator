import { getCountryIdsForRegions } from '../../data/countries';
import { useCatalog } from '../../context/CatalogContext';

export function RegionBanner() {
  const {
    countryName,
    region,
    regionLabel,
    locale,
    source,
    isUsingUserLocation,
    applyUserLocation,
    countryId,
    filters,
  } = useCatalog();

  const detectionLabel =
    source === 'browser'
      ? 'Detected from your browser'
      : source === 'stored'
        ? 'Your saved location'
        : 'Default location';

  const isFullRegionScope =
    (region === 'APAC' || region === 'EMEA') &&
    filters.regions.length === 1 &&
    filters.regions[0] === region &&
    getCountryIdsForRegions([region]).every((id) => filters.countries.includes(id));

  const filtersMatchUser =
    isUsingUserLocation ||
    (filters.regions.length === 1 &&
      filters.regions[0] === region &&
      (isFullRegionScope ||
        (filters.countries.length === 1 && filters.countries[0] === countryId)));

  return (
    <div className="bg-accent-subtle border border-accent-border rounded-sm px-4 py-3 mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-sm font-semibold text-text m-0">
          {isFullRegionScope ? (
            <>
              Showing all {regionLabel} pricing{' '}
              <span className="text-brand-red font-mono text-xs">({region})</span>
            </>
          ) : (
            <>
              Shopping in {countryName}{' '}
              <span className="text-brand-red font-mono text-xs">({region})</span>
            </>
          )}
        </p>
        <p className="text-xs text-text-muted mt-1 m-0">
          {isFullRegionScope
            ? `Based in ${countryName} · ${detectionLabel} · Prices in ${locale.currency}`
            : `${regionLabel} · ${detectionLabel} · Prices in ${locale.currency}`}
        </p>
      </div>

      {!filtersMatchUser && (
        <button
          type="button"
          onClick={() => applyUserLocation(countryId, region)}
          className="text-sm font-semibold text-brand-red bg-surface border border-brand-red rounded-sm px-4 py-1.5 cursor-pointer hover:bg-accent-subtle shrink-0"
        >
          {isFullRegionScope ? `Show all ${region} products` : `Show ${countryName} products`}
        </button>
      )}
    </div>
  );
}
