import type { CountryId, Product } from '../types';

export function getProductPrice(product: Product, countryId: CountryId): number | null {
  const countryPrice = product.pricing?.[countryId]?.customerPrice;
  if (countryPrice != null) return countryPrice;
  if (product.countries?.includes(countryId)) return product.price;
  return null;
}

export interface ProductDisplayPrice {
  price: number;
  countryId: CountryId;
}

/** Prefer the shopper's country, then any in-scope country where the product is priced. */
export function getProductDisplayPrice(
  product: Product,
  preferredCountry: CountryId,
  scopedCountries: CountryId[],
): ProductDisplayPrice | null {
  if (scopedCountries.includes(preferredCountry)) {
    const preferredPrice = getProductPrice(product, preferredCountry);
    if (preferredPrice != null) {
      return { price: preferredPrice, countryId: preferredCountry };
    }
  }

  for (const countryId of product.countries ?? []) {
    if (!scopedCountries.includes(countryId)) continue;
    const price = getProductPrice(product, countryId);
    if (price != null) return { price, countryId };
  }

  return null;
}

export function getProductEquinixPrice(product: Product, countryId: CountryId): number | null {
  const entry = product.pricing?.[countryId];
  if (!entry) return null;
  return entry.equinixPrice ?? null;
}

export function isProductAvailableInCountry(product: Product, countryId: CountryId): boolean {
  return getProductPrice(product, countryId) != null;
}
