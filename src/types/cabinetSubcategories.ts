export type CabinetSubCategoryId =
  | 'cabinet-all'
  | 'cabinet-sra-solutions'
  | 'cabinet-stengel'
  | 'cabinet-multiway-infra'
  | 'cabinet-eaton'
  | 'cabinet-legrand'
  | 'cabinet-minkels'
  | 'cabinet-netrack';

export interface CabinetSubCategory {
  id: CabinetSubCategoryId;
  name: string;
  description?: string;
  children?: CabinetSubCategory[];
}
