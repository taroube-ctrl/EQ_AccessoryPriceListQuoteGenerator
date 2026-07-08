import type { CategoryId, Product } from '../types';
import type { ProductSubCategoryId } from '../types/productSubcategories';
import {
  getCabinetSubCategory,
  getCabinetSubCategoryName,
  isCabinetSubCategoryId,
  matchesCabinetSubCategory,
} from './cabinetSubcategories';
import {
  getCageSubCategory,
  getCageSubCategoryName,
  isCageSubCategoryId,
  matchesCageSubCategory,
} from './cageSubcategories';
import {
  getCrossConnectSubCategory,
  getCrossConnectSubCategoryName,
  isCrossConnectSubCategoryId,
  matchesCrossConnectSubCategory,
} from './crossConnectSubcategories';
import {
  getPowerSubCategory,
  getPowerSubCategoryName,
  isPowerSubCategoryId,
  matchesPowerSubCategory,
} from './powerSubcategories';
import type { CabinetSubCategoryId } from '../types/cabinetSubcategories';
import type { CageSubCategoryId } from '../types/cageSubcategories';
import type { CrossConnectSubCategoryId } from '../types/crossConnectSubcategories';
import type { PowerSubCategoryId } from '../types/powerSubcategories';

export function getProductSubCategory(product: Product): ProductSubCategoryId | null {
  if (product.categoryId === 'cross-connect-accessories') {
    return getCrossConnectSubCategory(product);
  }
  if (product.categoryId === 'cage-accessories') {
    return getCageSubCategory(product);
  }
  if (product.categoryId === 'power-accessories') {
    return getPowerSubCategory(product);
  }
  if (product.categoryId === 'cabinet-accessories') {
    return getCabinetSubCategory(product);
  }
  return null;
}

export function matchesProductSubCategory(
  product: Product,
  categoryId: CategoryId | null,
  subCategoryId: ProductSubCategoryId | null,
): boolean {
  if (!subCategoryId || !categoryId) return true;

  if (categoryId === 'cross-connect-accessories') {
    return matchesCrossConnectSubCategory(
      product,
      subCategoryId as CrossConnectSubCategoryId,
    );
  }

  if (categoryId === 'cage-accessories') {
    return matchesCageSubCategory(product, subCategoryId as CageSubCategoryId);
  }

  if (categoryId === 'power-accessories') {
    return matchesPowerSubCategory(product, subCategoryId as PowerSubCategoryId);
  }

  if (categoryId === 'cabinet-accessories') {
    return matchesCabinetSubCategory(product, subCategoryId as CabinetSubCategoryId);
  }

  return true;
}

export function getProductSubCategoryName(
  categoryId: CategoryId | null,
  subCategoryId: ProductSubCategoryId | null,
): string | null {
  if (!subCategoryId || !categoryId) return null;

  if (categoryId === 'cabinet-accessories' || isCabinetSubCategoryId(subCategoryId)) {
    return getCabinetSubCategoryName(subCategoryId as CabinetSubCategoryId);
  }

  if (categoryId === 'cage-accessories' || isCageSubCategoryId(subCategoryId)) {
    return getCageSubCategoryName(subCategoryId as CageSubCategoryId);
  }

  if (categoryId === 'power-accessories' || isPowerSubCategoryId(subCategoryId)) {
    return getPowerSubCategoryName(subCategoryId as PowerSubCategoryId);
  }

  return getCrossConnectSubCategoryName(subCategoryId as CrossConnectSubCategoryId);
}
