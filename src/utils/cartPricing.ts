import type { CountryId, Product } from '../types';
import type { CartPriceSnapshot } from '../types/cart';
import { getProductDisplayPrice, getProductPrice } from './productPricing';

/** Resolve the best available price snapshot for cart adds, even without a scoped display price. */
export function getCartPriceSnapshot(
  product: Product,
  preferredCountry: CountryId,
  scopedCountries: CountryId[],
): CartPriceSnapshot {
  const displayPrice = getProductDisplayPrice(product, preferredCountry, scopedCountries);
  if (displayPrice) {
    return { unitPrice: displayPrice.price, priceCountryId: displayPrice.countryId };
  }

  const preferredPrice = getProductPrice(product, preferredCountry);
  if (preferredPrice != null) {
    return { unitPrice: preferredPrice, priceCountryId: preferredCountry };
  }

  for (const countryId of product.countries ?? []) {
    const price = getProductPrice(product, countryId);
    if (price != null) {
      return { unitPrice: price, priceCountryId: countryId };
    }
  }

  if (product.pricing) {
    for (const [countryId, entry] of Object.entries(product.pricing)) {
      if (entry.customerPrice != null) {
        return { unitPrice: entry.customerPrice, priceCountryId: countryId as CountryId };
      }
    }
  }

  if (product.price > 0) {
    return { unitPrice: product.price, priceCountryId: null };
  }

  return { unitPrice: null, priceCountryId: null };
}
