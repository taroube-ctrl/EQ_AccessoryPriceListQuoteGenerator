import catalogData from './catalog-products.json';
import type { CategoryId, Product } from '../types';

export const products: Product[] = catalogData.products as Product[];

export const priceRange = products.reduce(
  (range, product) => {
    const prices = product.pricing
      ? Object.values(product.pricing).map((entry) => entry.customerPrice)
      : [product.price];

    for (const price of prices) {
      range.min = Math.min(range.min, price);
      range.max = Math.max(range.max, price);
    }

    return range;
  },
  { min: Number.POSITIVE_INFINITY, max: 0 },
);

if (!Number.isFinite(priceRange.min)) {
  priceRange.min = 0;
}

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return products
    .filter((item) => item.categoryId === product.categoryId && item.id !== product.id)
    .slice(0, limit);
}

export function getCategoryProductCounts(): Record<CategoryId, number> {
  return products.reduce(
    (counts, product) => {
      counts[product.categoryId] = (counts[product.categoryId] ?? 0) + 1;
      return counts;
    },
    {} as Record<CategoryId, number>,
  );
}
