export type CageSubCategoryId =
  | 'cage-all'
  | 'basket-trays'
  | 'fiber-trays'
  | 'copper-trays'
  | 'structured-cabling'
  | 'structured-copper'
  | 'structured-fiber'
  | 'structured-panels'
  | 'structured-services';

export interface CageSubCategory {
  id: CageSubCategoryId;
  name: string;
  description?: string;
  children?: CageSubCategory[];
}
