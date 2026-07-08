import type { SortOption } from '../../types';
import type { DisplayUnit } from '../../types/dimensions';
import { DisplayUnitSelector } from './DisplayUnitSelector';

interface SortControlProps {
  value: SortOption;
  onChange: (sort: SortOption) => void;
  resultCount: number;
  id?: string;
  displayUnit?: DisplayUnit;
  onDisplayUnitChange?: (unit: DisplayUnit) => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
];

export function SortControl({
  value,
  onChange,
  resultCount,
  id = 'sort',
  displayUnit,
  onDisplayUnitChange,
}: SortControlProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
      <p className="text-sm text-text-muted m-0">
        <span className="font-mono font-medium text-text">{resultCount}</span> results
      </p>
      <div className="flex flex-wrap items-center gap-3">
        {displayUnit && onDisplayUnitChange ? (
          <DisplayUnitSelector
            id={`${id}-display-unit`}
            value={displayUnit}
            onChange={onDisplayUnitChange}
            compact
          />
        ) : null}
        <div className="flex items-center gap-2">
        <label htmlFor={id} className="text-sm text-text-muted">
          Sort by:
        </label>
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value as SortOption)}
          className="border border-border rounded-sm px-3 py-1.5 text-sm bg-surface text-text focus:outline-none focus:border-brand-red"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        </div>
      </div>
    </div>
  );
}
