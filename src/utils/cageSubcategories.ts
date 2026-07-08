import type { Product } from '../types';
import type { CageSubCategoryId } from '../types/cageSubcategories';

export function getCageSubCategory(product: Product): CageSubCategoryId {
  const text = `${product.name} ${product.description}`.toLowerCase();

  if (/structured cabling/.test(text)) {
    if (/installation|site survey|testing/.test(text)) return 'structured-services';
    if (/fiber|mmf|mpo|strand/.test(text)) return 'structured-fiber';
    if (/\dru panel/.test(text)) return 'structured-panels';
    if (/copper|cat6|port copper/.test(text)) return 'structured-copper';
    return 'structured-cabling';
  }

  if (/basket tray/.test(text)) return 'basket-trays';
  if (/fiber tray/.test(text)) return 'fiber-trays';
  if (/copper tray/.test(text)) return 'copper-trays';

  return 'cage-all';
}

export function matchesCageSubCategory(
  product: Product,
  subCategoryId: CageSubCategoryId | null,
): boolean {
  if (product.categoryId !== 'cage-accessories') return false;
  if (!subCategoryId || subCategoryId === 'cage-all') return true;

  const leaf = getCageSubCategory(product);
  if (leaf === subCategoryId) return true;

  if (subCategoryId === 'structured-cabling') {
    return (
      leaf === 'structured-copper' ||
      leaf === 'structured-fiber' ||
      leaf === 'structured-panels' ||
      leaf === 'structured-services'
    );
  }

  return false;
}

export function getCageSubCategoryName(subCategoryId: CageSubCategoryId | null): string | null {
  if (!subCategoryId || subCategoryId === 'cage-all') return null;

  const labels: Record<CageSubCategoryId, string> = {
    'cage-all': 'All Cage Accessories',
    'basket-trays': 'Basket Trays',
    'fiber-trays': 'Fiber Trays',
    'copper-trays': 'Copper Trays',
    'structured-cabling': 'Structured Cabling',
    'structured-copper': 'Structured Cabling — Copper',
    'structured-fiber': 'Structured Cabling — Fiber',
    'structured-panels': 'Structured Cabling — Panels',
    'structured-services': 'Structured Cabling — Installation Services',
  };

  return labels[subCategoryId];
}

const CAGE_SUB_CATEGORY_IDS = new Set<CageSubCategoryId>([
  'cage-all',
  'basket-trays',
  'fiber-trays',
  'copper-trays',
  'structured-cabling',
  'structured-copper',
  'structured-fiber',
  'structured-panels',
  'structured-services',
]);

export function isCageSubCategoryId(value: string | null): value is CageSubCategoryId {
  return value != null && CAGE_SUB_CATEGORY_IDS.has(value as CageSubCategoryId);
}
