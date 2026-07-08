import type { Product } from '../types';
import type { DimensionFilters } from '../types/dimensions';
import { EMPTY_DIMENSION_FILTERS } from '../types/dimensions';

export function getDimensionalProducts(products: Product[]): Product[] {
  return products.filter((p) => p.dimensions);
}

export function getDimensionOptions(products: Product[]) {
  const dimensional = getDimensionalProducts(products);
  const rackUnits = [...new Set(dimensional.map((p) => p.dimensions!.rackUnits))].sort(
    (a, b) => a - b,
  );
  const widthMm = [
    ...new Set(
      dimensional
        .map((p) => p.dimensions!.widthMm)
        .filter((value): value is number => value != null),
    ),
  ].sort((a, b) => a - b);
  const depthMm = [
    ...new Set(
      dimensional
        .map((p) => p.dimensions!.depthMm)
        .filter((value): value is number => value != null),
    ),
  ].sort((a, b) => a - b);
  return { rackUnits, widthMm, depthMm };
}

export function createDefaultDimensionFilters(): DimensionFilters {
  return { ...EMPTY_DIMENSION_FILTERS };
}

function normalizedDistance(actual: number, target: number): number {
  return Math.abs(actual - target) / Math.max(Math.abs(target), 1);
}

/** Lower score = closer match. Null = product has no dimensions. */
export function getDimensionDistanceScore(
  product: Product,
  filters: DimensionFilters,
): number | null {
  if (!product.dimensions) return null;

  const { rackUnits, widthMm, depthMm } = product.dimensions;
  let score = 0;
  let activeCount = 0;

  if (filters.rackUnits != null) {
    score += normalizedDistance(rackUnits, filters.rackUnits);
    activeCount++;
  }
  if (filters.widthMm != null && widthMm != null) {
    score += normalizedDistance(widthMm, filters.widthMm);
    activeCount++;
  }
  if (filters.depthMm != null && depthMm != null) {
    score += normalizedDistance(depthMm, filters.depthMm);
    activeCount++;
  }

  return activeCount > 0 ? score : null;
}

export function compareDimensionDistance(
  a: Product,
  b: Product,
  filters: DimensionFilters,
): number {
  const scoreA = getDimensionDistanceScore(a, filters);
  const scoreB = getDimensionDistanceScore(b, filters);

  if (scoreA === null && scoreB === null) return 0;
  if (scoreA === null) return 1;
  if (scoreB === null) return -1;
  return scoreA - scoreB;
}

export function isDimensionFilterActive(filters: DimensionFilters): boolean {
  return (
    filters.rackUnits != null || filters.widthMm != null || filters.depthMm != null
  );
}
