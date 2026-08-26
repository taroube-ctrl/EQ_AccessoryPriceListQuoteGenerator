import type { Product } from '../types';
import { parseProductPowerConfig } from './powerConfigFilters';

export interface PduCharacteristics {
  voltage: string | null;
  current: string | null;
  phase: string | null;
  type: string | null;
  /** Human-readable outlet summary, e.g. "20×C13 + 4×C19". */
  outlets: string | null;
}

/** True for PDU units (rPDU / uPDU / generic PDU), excluding input cables. */
export function isPduProduct(product: Product): boolean {
  if (product.categoryId !== 'power-accessories') return false;
  const text = `${product.name} ${product.description}`.toLowerCase();
  if (/input cable/.test(text)) return false;
  return /rpdu|r pdu|updu|u pdu|\bpdu\b/.test(text);
}

/** Ordered from most-specific to most-general so compound types win. */
const TYPE_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /monitored\s*\+\s*switched/i, label: 'Monitored + Switched' },
  { pattern: /monitored switched/i, label: 'Monitored Switched' },
  { pattern: /monitored input/i, label: 'Monitored Input' },
  { pattern: /monitored/i, label: 'Monitored' },
  { pattern: /managed/i, label: 'Managed' },
  { pattern: /metered/i, label: 'Metered' },
  { pattern: /switched/i, label: 'Switched' },
  { pattern: /basic/i, label: 'Basic' },
];

function resolveType(product: Product): string | null {
  const text = `${product.name} ${product.description}`;
  for (const { pattern, label } of TYPE_PATTERNS) {
    if (pattern.test(text)) return label;
  }
  return null;
}

function resolveOutlets(description: string): string | null {
  // Matches outlet specs like "20xC13", "4xC19", "18xC39", "16xNBR32A",
  // "24xDIN", and NEMA-style "2x5-20R", even when joined without spaces
  // ("24xC13-12xC19").
  const regex = /(\d+)\s*x\s*((?:[A-Za-z]+[0-9]*[A-Za-z0-9]*)|(?:\d+-\d+[A-Za-z]+))/gi;

  const seen = new Set<string>();
  const cleaned: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(description)) != null) {
    const normalized = `${match[1]}×${match[2].toUpperCase()}`;
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    cleaned.push(normalized);
  }

  return cleaned.length ? cleaned.join(' + ') : null;
}

function formatPhase(phase: string): string {
  return `${phase}P`;
}

export function getPduCharacteristics(product: Product): PduCharacteristics | null {
  if (!isPduProduct(product)) return null;

  const config = parseProductPowerConfig(product);

  return {
    voltage: config.volts.length ? config.volts.map((v) => `${v}V`).join('/') : null,
    current: config.amps != null ? `${config.amps}A` : null,
    phase: config.phases ? formatPhase(config.phases) : null,
    type: resolveType(product),
    outlets: resolveOutlets(product.description),
  };
}
