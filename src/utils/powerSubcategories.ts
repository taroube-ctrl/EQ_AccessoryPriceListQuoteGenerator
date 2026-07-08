import type { Product } from '../types';
import type { PowerSubCategoryId } from '../types/powerSubcategories';

export function getPowerSubCategory(product: Product): PowerSubCategoryId {
  const text = `${product.name} ${product.description}`.toLowerCase();

  if (/updu input cable/.test(text)) return 'updu-input-cables';
  if (/updu|u pdu/.test(text)) return 'updu';

  if (/rpdu|r pdu/.test(text)) {
    if (/switched/.test(text)) return 'rpdu-switched';
    if (/metered/.test(text)) return 'rpdu-metered';
    if (/monitored/.test(text)) return 'rpdu-monitored';
    if (/basic/.test(text)) return 'rpdu-basic';
    return 'rack-pdus';
  }

  return 'power-all';
}

export function matchesPowerSubCategory(
  product: Product,
  subCategoryId: PowerSubCategoryId | null,
): boolean {
  if (product.categoryId !== 'power-accessories') return false;
  if (!subCategoryId || subCategoryId === 'power-all') return true;

  const leaf = getPowerSubCategory(product);
  if (leaf === subCategoryId) return true;

  if (subCategoryId === 'rack-pdus') {
    return (
      leaf === 'rpdu-basic' ||
      leaf === 'rpdu-monitored' ||
      leaf === 'rpdu-metered' ||
      leaf === 'rpdu-switched'
    );
  }

  return false;
}

export function getPowerSubCategoryName(subCategoryId: PowerSubCategoryId | null): string | null {
  if (!subCategoryId || subCategoryId === 'power-all') return null;

  const labels: Record<PowerSubCategoryId, string> = {
    'power-all': 'All Power Accessories',
    'rack-pdus': 'Rack PDUs (rPDU)',
    'rpdu-basic': 'Rack PDUs — Basic',
    'rpdu-monitored': 'Rack PDUs — Monitored',
    'rpdu-metered': 'Rack PDUs — Metered',
    'rpdu-switched': 'Rack PDUs — Switched',
    updu: 'Floor / Overhead PDUs (uPDU)',
    'updu-input-cables': 'uPDU Input Cables',
  };

  return labels[subCategoryId];
}

const POWER_SUB_CATEGORY_IDS = new Set<PowerSubCategoryId>([
  'power-all',
  'rack-pdus',
  'rpdu-basic',
  'rpdu-monitored',
  'rpdu-metered',
  'rpdu-switched',
  'updu',
  'updu-input-cables',
]);

export function isPowerSubCategoryId(value: string | null): value is PowerSubCategoryId {
  return value != null && POWER_SUB_CATEGORY_IDS.has(value as PowerSubCategoryId);
}
