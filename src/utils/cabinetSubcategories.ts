import type { Product } from '../types';
import type { CabinetSubCategoryId } from '../types/cabinetSubcategories';
import { cabinetSubCategories, cabinetSubCategoryBrand } from '../data/cabinetSubcategories';

export function getCabinetSubCategory(product: Product): CabinetSubCategoryId {
  const brand = product.brand ?? '';
  const match = (
    Object.entries(cabinetSubCategoryBrand) as Array<[CabinetSubCategoryId, string]>
  ).find(([, brandName]) => brandName === brand);
  return match ? match[0] : 'cabinet-all';
}

export function matchesCabinetSubCategory(
  product: Product,
  subCategoryId: CabinetSubCategoryId | null,
): boolean {
  if (product.categoryId !== 'cabinet-accessories') return false;
  if (!subCategoryId || subCategoryId === 'cabinet-all') return true;
  return getCabinetSubCategory(product) === subCategoryId;
}

export function getCabinetSubCategoryName(
  subCategoryId: CabinetSubCategoryId | null,
): string | null {
  if (!subCategoryId || subCategoryId === 'cabinet-all') return null;
  return cabinetSubCategories.find((group) => group.id === subCategoryId)?.name ?? null;
}

const CABINET_SUB_CATEGORY_IDS = new Set<CabinetSubCategoryId>([
  'cabinet-all',
  ...cabinetSubCategories.map((group) => group.id),
]);

export function isCabinetSubCategoryId(value: string | null): value is CabinetSubCategoryId {
  return value != null && CABINET_SUB_CATEGORY_IDS.has(value as CabinetSubCategoryId);
}
