export type PowerSubCategoryId =
  | 'power-all'
  | 'rack-pdus'
  | 'rpdu-basic'
  | 'rpdu-monitored'
  | 'rpdu-metered'
  | 'rpdu-switched'
  | 'updu'
  | 'updu-input-cables';

export interface PowerSubCategory {
  id: PowerSubCategoryId;
  name: string;
  description?: string;
  children?: PowerSubCategory[];
}
