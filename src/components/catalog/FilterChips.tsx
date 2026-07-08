import { getCountryName } from '../../data/countries';
import { formatMm, formatRackUnits } from '../../utils/dimensions';
import type { DimensionFilters, DisplayUnit } from '../../types/dimensions';
import type { CountryId, Region } from '../../types';

interface FilterChipsProps {
  selectedRegions: Region[];
  allRegions: Region[];
  narrowedCountries: CountryId[];
  dimensionFilters: DimensionFilters;
  dimensionFilterActive: boolean;
  displayUnit: DisplayUnit;
  onRemoveRegion: (region: Region) => void;
  onRemoveCountry: (countryId: CountryId) => void;
  onSetRackUnits: (value: number | null) => void;
  onSetWidth: (value: number | null) => void;
  onSetDepth: (value: number | null) => void;
}

export function FilterChips({
  selectedRegions,
  allRegions,
  narrowedCountries,
  dimensionFilters,
  dimensionFilterActive,
  displayUnit,
  onRemoveRegion,
  onRemoveCountry,
  onSetRackUnits,
  onSetWidth,
  onSetDepth,
}: FilterChipsProps) {
  const showRegionChips = selectedRegions.length < allRegions.length;
  const showCountryChips = narrowedCountries.length > 0;

  if (!showRegionChips && !showCountryChips && !dimensionFilterActive) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-sm text-text-muted">Active filters:</span>

      {showRegionChips &&
        selectedRegions.map((region) => (
          <Chip
            key={region}
            label={`Region: ${region}`}
            onRemove={() => onRemoveRegion(region)}
          />
        ))}

      {showCountryChips &&
        narrowedCountries.map((countryId) => (
          <Chip
            key={countryId}
            label={getCountryName(countryId)}
            onRemove={() => onRemoveCountry(countryId)}
          />
        ))}

      {dimensionFilters.rackUnits != null && (
        <Chip
          label={formatRackUnits(dimensionFilters.rackUnits)}
          onRemove={() => onSetRackUnits(null)}
        />
      )}

      {dimensionFilters.widthMm != null && (
        <Chip
          label={`W ${formatMm(dimensionFilters.widthMm, displayUnit)}`}
          onRemove={() => onSetWidth(null)}
        />
      )}

      {dimensionFilters.depthMm != null && (
        <Chip
          label={`D ${formatMm(dimensionFilters.depthMm, displayUnit)}`}
          onRemove={() => onSetDepth(null)}
        />
      )}
    </div>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-subtle border border-accent-border rounded-full text-xs font-medium text-brand-red">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className="bg-transparent border-none cursor-pointer text-brand-red p-0 leading-none text-sm hover:text-brand-red-dark"
      >
        &times;
      </button>
    </span>
  );
}
