import { useEffect, useState } from 'react';
import type { PowerConfigFilters } from '../../types/powerConfig';
import { normalizePhaseLabel } from '../../utils/powerConfigFilters';

interface PowerConfigFilterSectionProps {
  powerConfigFilters: PowerConfigFilters;
  onSetVolts: (value: number | null) => void;
  onSetAmps: (value: number | null) => void;
  onSetPhases: (value: string | null) => void;
}

export function PowerConfigFilterSection({
  powerConfigFilters,
  onSetVolts,
  onSetAmps,
  onSetPhases,
}: PowerConfigFilterSectionProps) {
  return (
    <div className="p-4 border-t border-border">
      <h3 className="text-sm font-bold mb-1 m-0">Power Configuration</h3>
      <p className="text-xs text-text-muted m-0 mb-3 leading-relaxed">
        Filter PDUs by volts, amps, and phases (e.g. 208V · 30A · 1PH).
      </p>

      <div className="space-y-3">
        <PowerNumberInput
          id="filter-power-volts"
          label="Volts"
          suffix="V"
          placeholder="208"
          storedValue={powerConfigFilters.volts}
          onChange={onSetVolts}
        />
        <PowerNumberInput
          id="filter-power-amps"
          label="Amps"
          suffix="A"
          placeholder="30"
          storedValue={powerConfigFilters.amps}
          onChange={onSetAmps}
        />
        <PhaseInput
          id="filter-power-phases"
          storedValue={powerConfigFilters.phases}
          onChange={onSetPhases}
        />
      </div>
    </div>
  );
}

interface PowerNumberInputProps {
  id: string;
  label: string;
  suffix: string;
  placeholder: string;
  storedValue: number | null;
  onChange: (value: number | null) => void;
}

function PowerNumberInput({
  id,
  label,
  suffix,
  placeholder,
  storedValue,
  onChange,
}: PowerNumberInputProps) {
  const [text, setText] = useState(() => (storedValue == null ? '' : String(storedValue)));

  useEffect(() => {
    setText(storedValue == null ? '' : String(storedValue));
  }, [storedValue]);

  const commit = (raw: string) => {
    const trimmed = raw.trim().replace(new RegExp(`${suffix}$`, 'i'), '').trim();
    if (trimmed === '') {
      onChange(null);
      return;
    }
    const num = Number(trimmed);
    if (Number.isNaN(num) || num <= 0) return;
    onChange(Math.round(num));
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
          inputMode="numeric"
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

interface PhaseInputProps {
  id: string;
  storedValue: string | null;
  onChange: (value: string | null) => void;
}

function PhaseInput({ id, storedValue, onChange }: PhaseInputProps) {
  const toDisplay = (value: string | null) => (value == null ? '' : value);
  const [text, setText] = useState(() => toDisplay(storedValue));

  useEffect(() => {
    setText(toDisplay(storedValue));
  }, [storedValue]);

  const commit = (raw: string) => {
    const trimmed = raw.trim();
    if (trimmed === '') {
      onChange(null);
      return;
    }
    const normalized = normalizePhaseLabel(trimmed);
    if (!normalized) return;
    onChange(normalized);
    setText(normalized);
  };

  return (
    <div>
      <label htmlFor={id} className="text-xs font-semibold text-text-muted block mb-1.5">
        Phases
      </label>
      <div className="flex items-center border border-border rounded-sm overflow-hidden focus-within:border-brand-red bg-surface">
        <input
          id={id}
          type="text"
          inputMode="text"
          value={text}
          placeholder="1"
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
          PH
        </span>
      </div>
    </div>
  );
}
