import { getLocaleSettings } from '../data/localeConfig';
import type { CountryId } from '../types';

/**
 * Approximate USD value of one unit of each currency used in the catalog.
 *
 * These are static display estimates used only to show an approximate USD price
 * for products that are not sold in the shopper's own currency (e.g. a US
 * shopper viewing a product priced only in JPY). They are NOT billing-grade
 * rates and are intentionally rounded; live quotes are confirmed by sales.
 */
const USD_PER_CURRENCY: Record<string, number> = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
  CAD: 0.73,
  AUD: 0.66,
  BRL: 0.18,
  CLP: 0.0011,
  COP: 0.00025,
  MXN: 0.058,
  PEN: 0.27,
  CNY: 0.14,
  HKD: 0.128,
  INR: 0.012,
  IDR: 0.000063,
  JPY: 0.0067,
  MYR: 0.22,
  PHP: 0.017,
  SGD: 0.74,
  KRW: 0.00073,
  OMR: 2.6,
  PLN: 0.25,
  SEK: 0.096,
  CHF: 1.1,
  TRY: 0.029,
  AED: 0.27,
};

export function convertToUsd(amount: number, currency: string): number | null {
  const rate = USD_PER_CURRENCY[currency];
  if (rate == null) return null;
  return amount * rate;
}

/** Convert a price expressed in a country's local currency into USD. */
export function convertCountryPriceToUsd(amount: number, countryId: CountryId): number | null {
  const { currency } = getLocaleSettings(countryId);
  return convertToUsd(amount, currency);
}
