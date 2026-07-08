export type CrossConnectSubCategoryId =
  | 'cross-connect-all'
  | 'ethernet-media-converters'
  | 'ethernet-singlemode'
  | 'ethernet-multimode'
  | 'telecom-media-converters'
  | 'telecom-t1-e1'
  | 'telecom-ds3-e3';

export interface CrossConnectSubCategory {
  id: CrossConnectSubCategoryId;
  name: string;
  description?: string;
  children?: CrossConnectSubCategory[];
}
