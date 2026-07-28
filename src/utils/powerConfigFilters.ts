import type { Product } from '../types';
import {
  EMPTY_POWER_CONFIG_FILTERS,
  type PowerConfigFilters,
  type ProductPowerConfig,
} from '../types/powerConfig';

const VOLTAGE_SEGMENT = /^(\d+)(?:\/(\d+))?V$/i;
const AMPS_SEGMENT = /^(\d+)A$/i;
const PHASE_SEGMENT = /^(?:(\d+(?:\+\d+)?)P(?:H)?|(\d+)\s*-?\s*phase)$/i;

export function createDefaultPowerConfigFilters(): PowerConfigFilters {
  return { ...EMPTY_POWER_CONFIG_FILTERS };
}

export function isPowerConfigFilterActive(filters: PowerConfigFilters): boolean {
  return filters.volts != null || filters.amps != null || filters.phases != null;
}

/** Normalize user/phase text to a comparable label ("1", "3", "1+2", …). */
export function normalizePhaseLabel(raw: string): string | null {
  const trimmed = raw.trim().toUpperCase().replace(/\s+/g, '');
  if (!trimmed) return null;

  const plusMatch = trimmed.match(/^(\d+(?:\+\d+)+)(?:P|PH)?$/);
  if (plusMatch) return plusMatch[1];

  const phaseWord = trimmed.match(/^(\d+)(?:-?PHASE|P|PH)?$/);
  if (phaseWord) return phaseWord[1];

  return null;
}

function parsePhaseSegment(segment: string): string | null {
  const match = segment.trim().match(PHASE_SEGMENT);
  if (!match) return null;
  if (match[1]) return match[1].toUpperCase();
  if (match[2]) return match[2];
  return null;
}

/**
 * Extract volts / amps / phases from pipe-delimited power accessory descriptions.
 * Examples: "Rpdu | 208V | 30A | 1P | …", "Updu Input Cable | L6-30P | 24A | 208V | 10ft"
 */
export function parseProductPowerConfig(product: Product): ProductPowerConfig {
  const segments = `${product.name} | ${product.description}`
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean);

  const volts = new Set<number>();
  let amps: number | null = null;
  let phases: string | null = null;

  for (const segment of segments) {
    const voltageMatch = segment.match(VOLTAGE_SEGMENT);
    if (voltageMatch) {
      volts.add(Number(voltageMatch[1]));
      if (voltageMatch[2]) volts.add(Number(voltageMatch[2]));
      continue;
    }

    const ampsMatch = segment.match(AMPS_SEGMENT);
    if (ampsMatch) {
      amps = Number(ampsMatch[1]);
      continue;
    }

    const phase = parsePhaseSegment(segment);
    if (phase) {
      phases = phase;
    }
  }

  return {
    volts: [...volts].sort((a, b) => a - b),
    amps,
    phases,
  };
}

export function productMatchesPowerConfig(
  product: Product,
  filters: PowerConfigFilters,
): boolean {
  if (!isPowerConfigFilterActive(filters)) return true;

  const config = parseProductPowerConfig(product);

  if (filters.volts != null) {
    if (!config.volts.includes(filters.volts)) return false;
  }

  if (filters.amps != null) {
    if (config.amps == null || config.amps !== filters.amps) return false;
  }

  if (filters.phases != null) {
    if (!config.phases || config.phases !== filters.phases) return false;
  }

  return true;
}

export function getPowerConfigOptions(products: Product[]) {
  const volts = new Set<number>();
  const amps = new Set<number>();
  const phases = new Set<string>();

  for (const product of products) {
    if (product.categoryId !== 'power-accessories') continue;
    const config = parseProductPowerConfig(product);
    config.volts.forEach((v) => volts.add(v));
    if (config.amps != null) amps.add(config.amps);
    if (config.phases) phases.add(config.phases);
  }

  return {
    volts: [...volts].sort((a, b) => a - b),
    amps: [...amps].sort((a, b) => a - b),
    phases: [...phases].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
  };
}
