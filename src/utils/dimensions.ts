import type { DisplayUnit } from '../types/dimensions';

const MM_PER_IN = 25.4;
/** EIA-310 standard rack unit height. */
export const RACK_UNIT_HEIGHT_MM = 44.45;

export const DISPLAY_UNITS: { value: DisplayUnit; label: string; system: 'metric' | 'imperial' }[] = [
  { value: 'mm', label: 'mm', system: 'metric' },
  { value: 'cm', label: 'cm', system: 'metric' },
  { value: 'in', label: 'in', system: 'imperial' },
  { value: 'ft', label: 'ft', system: 'imperial' },
  { value: 'yd', label: 'yd', system: 'imperial' },
];

export function mmToDisplay(mm: number, unit: DisplayUnit): number {
  switch (unit) {
    case 'mm':
      return mm;
    case 'cm':
      return mm / 10;
    case 'in':
      return mm / MM_PER_IN;
    case 'ft':
      return mm / MM_PER_IN / 12;
    case 'yd':
      return mm / MM_PER_IN / 36;
  }
}

export function displayToMm(value: number, unit: DisplayUnit): number {
  switch (unit) {
    case 'mm':
      return value;
    case 'cm':
      return value * 10;
    case 'in':
      return value * MM_PER_IN;
    case 'ft':
      return value * MM_PER_IN * 12;
    case 'yd':
      return value * MM_PER_IN * 36;
  }
}

export function formatDisplayInputValue(value: number, unit: DisplayUnit): string {
  if (unit === 'mm') return String(Math.round(value));
  return Number(value.toFixed(2)).toString();
}

export function formatMm(mm: number | undefined, unit: DisplayUnit): string {
  if (mm == null) return '—';
  const value = mmToDisplay(mm, unit);
  const decimals = unit === 'mm' ? 0 : 2;
  return `${value.toFixed(decimals)} ${unit}`;
}

export function formatRackUnits(rackUnits: number): string {
  return `${rackUnits}U`;
}

export function rackUnitsToHeightMm(rackUnits: number): number {
  return rackUnits * RACK_UNIT_HEIGHT_MM;
}

export function rackUnitsToDisplayHeight(rackUnits: number, unit: DisplayUnit): number {
  return mmToDisplay(rackUnitsToHeightMm(rackUnits), unit);
}

export function displayHeightToRackUnits(value: number, unit: DisplayUnit): number {
  return Math.round(displayToMm(value, unit) / RACK_UNIT_HEIGHT_MM);
}

export function formatRackHeightEquivalent(
  rackUnits: number | null | undefined,
  unit: DisplayUnit,
): string {
  if (rackUnits == null) return '';
  return formatDisplayInputValue(rackUnitsToDisplayHeight(rackUnits, unit), unit);
}

export function formatCompactDimensions(
  rackUnits: number,
  widthMm: number,
  depthMm: number,
  unit: DisplayUnit,
): string {
  const w = formatMm(widthMm, unit);
  const d = formatMm(depthMm, unit);
  return `${rackUnits}U × ${w}W × ${d}D`;
}

export function getDisplayUnitSystem(unit: DisplayUnit): 'metric' | 'imperial' {
  return DISPLAY_UNITS.find((u) => u.value === unit)?.system ?? 'metric';
}

export function getDimensionPlaceholder(mmValue: number, unit: DisplayUnit): string {
  return formatDisplayInputValue(mmToDisplay(mmValue, unit), unit);
}

const DISPLAY_UNIT_STORAGE_KEY = 'accessory-catalog-display-unit';

export function loadStoredDisplayUnit(fallback: DisplayUnit): DisplayUnit {
  if (typeof window === 'undefined') return fallback;

  try {
    const stored = window.localStorage.getItem(DISPLAY_UNIT_STORAGE_KEY);
    if (stored && DISPLAY_UNITS.some((unit) => unit.value === stored)) {
      return stored as DisplayUnit;
    }
  } catch {
    // Ignore storage errors and use the fallback unit.
  }

  return fallback;
}

export function saveDisplayUnit(unit: DisplayUnit): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(DISPLAY_UNIT_STORAGE_KEY, unit);
  } catch {
    // Ignore storage errors.
  }
}

type SourceLengthUnit = DisplayUnit | 'm';

export function sourceLengthToMm(value: number, unit: SourceLengthUnit): number {
  if (unit === 'm') return value * 1000;
  return displayToMm(value, unit);
}

function normalizeSourceLengthUnit(unit: string): SourceLengthUnit | null {
  const normalized = unit.toLowerCase();
  if (normalized === 'm') return 'm';
  if (DISPLAY_UNITS.some((entry) => entry.value === normalized)) {
    return normalized as DisplayUnit;
  }
  return null;
}

const EXPLICIT_LENGTH_PATTERN = /(\d+(?:\.\d+)?)\s*(mm|cm|m|in|ft|yd)\b/gi;
const COMPACT_LENGTH_PATTERN = /(\d+(?:\.\d+)?)(mm|cm|in|ft|yd)\b/gi;

function replaceExplicitLengthTokens(text: string, displayUnit: DisplayUnit): string {
  const replaceToken = (value: string, unit: string) => {
    const sourceUnit = normalizeSourceLengthUnit(unit);
    if (!sourceUnit) return `${value}${unit}`;
    const mm = sourceLengthToMm(Number(value), sourceUnit);
    return formatMm(mm, displayUnit);
  };

  return text
    .replace(EXPLICIT_LENGTH_PATTERN, (match, value, unit) => replaceToken(value, unit))
    .replace(COMPACT_LENGTH_PATTERN, (match, value, unit) => replaceToken(value, unit));
}

/** Converts embedded length measurements in catalog labels to the active display unit. */
export function formatTextWithDisplayUnits(text: string, displayUnit: DisplayUnit): string {
  if (!text) return text;
  return replaceExplicitLengthTokens(text, displayUnit);
}
