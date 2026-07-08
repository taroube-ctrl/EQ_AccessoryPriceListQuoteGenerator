import type { CabinetSubCategoryId } from './cabinetSubcategories';
import type { CageSubCategoryId } from './cageSubcategories';
import type { CrossConnectSubCategoryId } from './crossConnectSubcategories';
import type { PowerSubCategoryId } from './powerSubcategories';

export type ProductSubCategoryId =
  | CrossConnectSubCategoryId
  | CageSubCategoryId
  | PowerSubCategoryId
  | CabinetSubCategoryId;
