import { useEffect, useState } from 'react';
import {
  displayHeightToRackUnits,
  displayToMm,
  formatDisplayInputValue,
  getDimensionPlaceholder,
  mmToDisplay,
  rackUnitsToDisplayHeight,
} from '../../utils/dimensions';
import type { DimensionFilters, DisplayUnit } from '../../types/dimensions';

interface DimensionFilterSectionProps {
  dimensionFilters: DimensionFilters;
  displayUnit: DisplayUnit;
  onSetRackUnits: (value: number | null) => void;
  onSetWidth: (valueMm: number | null) => void;
  onSetDepth: (valueMm: number | null) => void;
}

export function DimensionFilterSection({
  dimensionFilters,
  displayUnit,
  onSetRackUnits,
  onSetWidth,
  onSetDepth,
}: DimensionFilterSectionProps) {
  return (
    <div className="p-4 border-t border-border">
      <h3 className="text-sm font-bold mb-3 m-0">Cabinet Dimensions</h3>

      <div className="space-y-3">
        <RackHeightInputs
          rackUnits={dimensionFilters.rackUnits}
          displayUnit={displayUnit}
          onSetRackUnits={onSetRackUnits}
        />

        <DimensionInput
          id="filter-width"
          label="Width"
          suffix={displayUnit}
          storedValue={dimensionFilters.widthMm}
          displayUnit={displayUnit}
          isLinear
          placeholder={getDimensionPlaceholder(600, displayUnit)}
          onChange={onSetWidth}
        />

        <DimensionInput
          id="filter-depth"
          label="Depth"
          suffix={displayUnit}
          storedValue={dimensionFilters.depthMm}
          displayUnit={displayUnit}
          isLinear
          placeholder={getDimensionPlaceholder(1200, displayUnit)}
          onChange={onSetDepth}
        />

      </div>
    </div>
  );
}

interface RackHeightInputsProps {
  rackUnits: number | null;
  displayUnit: DisplayUnit;
  onSetRackUnits: (value: number | null) => void;
}

function RackHeightInputs({ rackUnits, displayUnit, onSetRackUnits }: RackHeightInputsProps) {
  const equivalentPlaceholder = formatDisplayInputValue(
    rackUnitsToDisplayHeight(45, displayUnit),
    displayUnit,
  );

  return (
    <div className="space-y-2">
      <DimensionInput
        id="filter-rack-height"
        label="Rack Height"
        suffix="U"
        storedValue={rackUnits}
        displayUnit={displayUnit}
        isLinear={false}
        placeholder="45"
        onChange={onSetRackUnits}
      />

      <DimensionInput
        id="filter-rack-height-equivalent"
        label="Equivalent Height"
        suffix={displayUnit}
        storedValue={rackUnits}
        displayUnit={displayUnit}
        isLinear={false}
        isRackHeightEquivalent
        placeholder={equivalentPlaceholder}
        onChange={onSetRackUnits}
      />
    </div>
  );
}

interface DimensionInputProps {
  id: string;
  label: string;
  suffix: string;
  storedValue: number | null;
  displayUnit: DisplayUnit;
  isLinear: boolean;
  isRackHeightEquivalent?: boolean;
  placeholder: string;
  onChange: (value: number | null) => void;
}

function DimensionInput({
  id,
  label,
  suffix,
  storedValue,
  displayUnit,
  isLinear,
  isRackHeightEquivalent = false,
  placeholder,
  onChange,
}: DimensionInputProps) {
  const toDisplayText = (value: number | null) => {
    if (value == null) return '';
    if (isRackHeightEquivalent) {
      return formatDisplayInputValue(rackUnitsToDisplayHeight(value, displayUnit), displayUnit);
    }
    if (!isLinear) return String(value);
    return formatDisplayInputValue(mmToDisplay(value, displayUnit), displayUnit);
  };

  const [text, setText] = useState(() => toDisplayText(storedValue));

  useEffect(() => {
    setText(toDisplayText(storedValue));
  }, [storedValue, displayUnit, isLinear, isRackHeightEquivalent]);

  const commit = (raw: string) => {
    const trimmed = raw.trim();
    if (trimmed === '') {
      onChange(null);
      return;
    }

    const num = Number(trimmed);
    if (Number.isNaN(num)) return;

    if (isRackHeightEquivalent) {
      onChange(displayHeightToRackUnits(num, displayUnit));
      return;
    }

    if (isLinear) {
      onChange(Math.round(displayToMm(num, displayUnit)));
    } else {
      onChange(Math.round(num));
    }
  };

  return (
    <div>
      <label htmlFor={id} className="text-xs font-semibold text-text-muted block mb-1.5">
        {label}
      </label>
      <div className="flex items-center border border-border rounded-sm overflow-hidden focus-within:border-brand-red bg-surface">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={text}
          placeholder={placeholder}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => commit(text)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              commit(text);
              (e.target as HTMLInputElement).blur();
            }
          }}
          className="flex-1 min-w-0 px-3 py-2 text-sm border-none outline-none bg-transparent font-mono"
        />
        <span className="px-3 py-2 text-xs font-semibold text-text-muted bg-surface-muted border-l border-border shrink-0">
          {suffix}
        </span>
      </div>
    </div>
  );
}
