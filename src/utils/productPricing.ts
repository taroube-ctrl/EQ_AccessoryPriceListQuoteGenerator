import { getLocaleSettings } from '../data/localeConfig';
import { convertCountryPriceToUsd } from './currencyConversion';
import type { CountryId, Product } from '../types';

const USD_COUNTRY: CountryId = 'united-states';

export function getProductPrice(product: Product, countryId: CountryId): number | null {
  const countryPrice = product.pricing?.[countryId]?.customerPrice;
  if (countryPrice != null) return countryPrice;
  if (product.countries?.includes(countryId)) return product.price;
  return null;
}

export interface ProductDisplayPrice {
  price: number;
  countryId: CountryId;
  /** True when `price` was converted into the shopper's currency (USD) for display. */
  converted?: boolean;
  /** The country whose local-currency price was converted (only set when `converted`). */
  sourceCountryId?: CountryId;
}

/**
 * Present a resolved price in the shopper's currency. Today the only supported
 * conversion target is USD (for shoppers in the United States); other locations
 * keep their in-scope local price unchanged.
 */
function toPreferredCurrency(
  price: number,
  countryId: CountryId,
  preferredCountry: CountryId,
): ProductDisplayPrice {
  if (preferredCountry !== USD_COUNTRY) {
    return { price, countryId };
  }

  if (getLocaleSettings(countryId).currency === 'USD') {
    return { price, countryId };
  }

  const usd = convertCountryPriceToUsd(price, countryId);
  if (usd == null) {
    return { price, countryId };
  }

  return {
    price: Math.round(usd),
    countryId: USD_COUNTRY,
    converted: true,
    sourceCountryId: countryId,
  };
}

/** Cheapest USD-converted price across every country where the product is priced. */
function getConvertedUsdPrice(product: Product): ProductDisplayPrice | null {
  let best: ProductDisplayPrice | null = null;

  for (const [countryId, entry] of Object.entries(product.pricing ?? {})) {
    if (entry?.customerPrice == null) continue;
    const usd = convertCountryPriceToUsd(entry.customerPrice, countryId as CountryId);
    if (usd == null) continue;

    const rounded = Math.round(usd);
    if (!best || rounded < best.price) {
      best = {
        price: rounded,
        countryId: USD_COUNTRY,
        converted: true,
        sourceCountryId: countryId as CountryId,
      };
    }
  }

  return best;
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
      return toPreferredCurrency(preferredPrice, preferredCountry, preferredCountry);
    }
  }

  for (const countryId of product.countries ?? []) {
    if (!scopedCountries.includes(countryId)) continue;
    const price = getProductPrice(product, countryId);
    if (price != null) return toPreferredCurrency(price, countryId, preferredCountry);
  }

  // US shoppers see an estimated USD price for products sold only abroad,
  // instead of "Pricing unavailable".
  if (preferredCountry === USD_COUNTRY) {
    return getConvertedUsdPrice(product);
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
