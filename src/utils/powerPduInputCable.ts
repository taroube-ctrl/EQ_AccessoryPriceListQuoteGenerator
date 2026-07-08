import type { Product } from '../types';

export type PduInputCableStatus = 'included' | 'not-included';

function isPowerPdu(product: Product): boolean {
  if (product.categoryId !== 'power-accessories') return false;

  const text = `${product.name} ${product.description}`.toLowerCase();
  if (/updu input cable/.test(text)) return false;
  return /rpdu|r pdu|updu|u pdu/.test(text);
}

function lastDescriptionSegment(description: string): string {
  const parts = description.split('|').map((part) => part.trim());
  return parts[parts.length - 1]?.toLowerCase() ?? '';
}

/** Whether a power PDU includes its own upstream input cable / wall plug. */
export function getPduInputCableStatus(product: Product): PduInputCableStatus | null {
  if (!isPowerPdu(product)) return null;

  const text = `${product.name} ${product.description}`;
  const lower = text.toLowerCase();

  if (/no plug/.test(lower)) return 'not-included';

  if (/\|\s*plug/i.test(text) && !/no plug/.test(lower)) return 'included';

  if (/iec\s*60309\s*input/i.test(text)) return 'included';
  if (/nema\s+l6-30p\s*input/i.test(text)) return 'included';

  const last = lastDescriptionSegment(product.description);
  if (/^iec-?309$/.test(last)) return 'included';
  if (/^nema.*p$/.test(last)) return 'included';

  if (/^iec-?320\s*c\d+/.test(last)) return 'not-included';
  if (/^nema.*r$/.test(last)) return 'not-included';

  if (/updu|u pdu/.test(lower)) return 'not-included';

  return 'not-included';
}

export function pduRequiresSeparateInputCable(product: Product): boolean {
  return getPduInputCableStatus(product) === 'not-included';
}

export const PDU_INPUT_CABLE_NOT_INCLUDED_LABEL = 'Input cable not included';
