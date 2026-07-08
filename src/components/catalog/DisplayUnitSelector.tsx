import { DISPLAY_UNITS } from '../../utils/dimensions';
import type { DisplayUnit } from '../../types/dimensions';

interface DisplayUnitSelectorProps {
  value: DisplayUnit;
  onChange: (unit: DisplayUnit) => void;
  id?: string;
  compact?: boolean;
}

export function DisplayUnitSelector({
  value,
  onChange,
  id = 'display-unit',
  compact = false,
}: DisplayUnitSelectorProps) {
  return (
    <div className={compact ? 'flex items-center gap-2' : undefined}>
      <label
        htmlFor={id}
        className={
          compact
            ? 'text-sm text-text-muted whitespace-nowrap'
            : 'text-xs font-semibold text-text-muted block mb-2'
        }
      >
        Display Units
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as DisplayUnit)}
        className={
          compact
            ? 'border border-border rounded-sm px-3 py-1.5 text-sm bg-surface text-text focus:outline-none focus:border-brand-red'
            : 'w-full border border-border rounded-sm px-3 py-1.5 text-sm bg-surface text-text focus:outline-none focus:border-brand-red'
        }
      >
        {DISPLAY_UNITS.map((u) => (
          <option key={u.value} value={u.value}>
            {u.label} ({u.system === 'metric' ? 'Metric' : 'Imperial'})
          </option>
        ))}
      </select>
      {!compact ? (
        <p className="text-[10px] text-text-muted mt-1.5 m-0">
          Product dimensions and measurements update automatically when changed.
        </p>
      ) : null}
    </div>
  );
}
