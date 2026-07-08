/** Stored internally in mm for width/depth; rack height in U. */
export interface ProductDimensions {
  rackUnits: number;
  widthMm?: number;
  depthMm?: number;
}

export type DisplayUnit = 'mm' | 'cm' | 'in' | 'ft' | 'yd';

export const DEFAULT_DISPLAY_UNIT: DisplayUnit = 'in';

/** Typed filter values — null means no filter for that dimension. */
export interface DimensionFilters {
  rackUnits: number | null;
  widthMm: number | null;
  depthMm: number | null;
}

export const EMPTY_DIMENSION_FILTERS: DimensionFilters = {
  rackUnits: null,
  widthMm: null,
  depthMm: null,
};
