import type { Product } from '../types';
import type { CrossConnectSubCategoryId } from '../types/crossConnectSubcategories';

export function getCrossConnectSubCategory(product: Product): CrossConnectSubCategoryId {
  const text = `${product.name} ${product.description}`.toLowerCase();

  if (/t1\/e1/.test(text)) return 'telecom-t1-e1';
  if (/ds3|e3/.test(text)) return 'telecom-ds3-e3';
  if (/\(mm\)|multimode|1000b-sx|1000base-sx/.test(text)) return 'ethernet-multimode';
  if (/\(sm\)|singlemode|1000base lx|1310/.test(text)) return 'ethernet-singlemode';
  if (/ethernet|10\/100\/1000/.test(text)) return 'ethernet-singlemode';

  return 'cross-connect-all';
}

export function matchesCrossConnectSubCategory(
  product: Product,
  subCategoryId: CrossConnectSubCategoryId | null,
): boolean {
  if (product.categoryId !== 'cross-connect-accessories') return false;
  if (!subCategoryId || subCategoryId === 'cross-connect-all') return true;

  const leaf = getCrossConnectSubCategory(product);
  if (leaf === subCategoryId) return true;

  if (subCategoryId === 'ethernet-media-converters') {
    return leaf === 'ethernet-singlemode' || leaf === 'ethernet-multimode';
  }

  if (subCategoryId === 'telecom-media-converters') {
    return leaf === 'telecom-t1-e1' || leaf === 'telecom-ds3-e3';
  }

  return false;
}

export function getCrossConnectSubCategoryName(
  subCategoryId: CrossConnectSubCategoryId | null,
): string | null {
  if (!subCategoryId || subCategoryId === 'cross-connect-all') return null;

  const labels: Record<CrossConnectSubCategoryId, string> = {
    'cross-connect-all': 'All Cross Connect Accessories',
    'ethernet-media-converters': 'Ethernet Media Converters',
    'ethernet-singlemode': 'Ethernet — Singlemode',
    'ethernet-multimode': 'Ethernet — Multimode',
    'telecom-media-converters': 'Telecom Media Converters',
    'telecom-t1-e1': 'Telecom — T1/E1',
    'telecom-ds3-e3': 'Telecom — DS3/E3',
  };

  return labels[subCategoryId];
}

const CROSS_CONNECT_SUB_CATEGORY_IDS = new Set<CrossConnectSubCategoryId>([
  'cross-connect-all',
  'ethernet-media-converters',
  'ethernet-singlemode',
  'ethernet-multimode',
  'telecom-media-converters',
  'telecom-t1-e1',
  'telecom-ds3-e3',
]);

export function isCrossConnectSubCategoryId(
  value: string | null,
): value is CrossConnectSubCategoryId {
  return value != null && CROSS_CONNECT_SUB_CATEGORY_IDS.has(value as CrossConnectSubCategoryId);
}
