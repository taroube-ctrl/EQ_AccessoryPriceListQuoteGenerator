import type { Product } from '../types';

/** Higher scores indicate a stronger match to the search query. */
export function getProductRelevanceScore(product: Product, search: string): number {
  const query = search.trim().toLowerCase();
  if (!query) return 0;

  const name = product.name.toLowerCase();
  const partNumber = (product.partNumber ?? '').toLowerCase();
  const brand = (product.brand ?? '').toLowerCase();
  const brandCode = (product.brandCode ?? '').toLowerCase();
  const description = product.description.toLowerCase();

  if (partNumber === query) return 1000;
  if (name === query) return 900;

  if (partNumber.startsWith(query)) return 800;
  if (name.startsWith(query)) return 700;

  if (partNumber.includes(query)) return 600;
  if (name.includes(query)) return 500;
  if (brand.includes(query) || brandCode.includes(query)) return 400;
  if (description.includes(query)) return 300;

  return 0;
}
