import type { CabinetSubCategory, CabinetSubCategoryId } from '../types/cabinetSubcategories';

/** Cabinet accessories are grouped by the manufacturer that supplies them. */
export const cabinetSubCategories: CabinetSubCategory[] = [
  { id: 'cabinet-sra-solutions', name: 'SRA Solutions' },
  { id: 'cabinet-stengel', name: 'Stengel' },
  { id: 'cabinet-multiway-infra', name: 'Multiway Infra' },
  { id: 'cabinet-eaton', name: 'Eaton' },
  { id: 'cabinet-legrand', name: 'Legrand' },
  { id: 'cabinet-minkels', name: 'Minkels' },
  { id: 'cabinet-netrack', name: 'Netrack' },
];

/** Maps each cabinet sub-category to the exact product brand it represents. */
export const cabinetSubCategoryBrand: Record<
  Exclude<CabinetSubCategoryId, 'cabinet-all'>,
  string
> = {
  'cabinet-sra-solutions': 'SRA Solutions',
  'cabinet-stengel': 'Stengel',
  'cabinet-multiway-infra': 'Multiway Infra',
  'cabinet-eaton': 'Eaton',
  'cabinet-legrand': 'Legrand',
  'cabinet-minkels': 'Minkels',
  'cabinet-netrack': 'Netrack',
};

export const cabinetSubCategoryMap = Object.fromEntries(
  [{ id: 'cabinet-all', name: 'All Cabinet Accessories' }, ...cabinetSubCategories].map((item) => [
    item.id,
    item,
  ]),
) as Record<CabinetSubCategoryId, { id: string; name: string; description?: string }>;
