import { getCountryName } from '../data/countries';
import { products } from '../data/products';
import type { Country, CountryId } from '../types';

const countryCatalogFrequency = new Map<CountryId, number>();

for (const product of products) {
  for (const countryId of product.countries ?? []) {
    countryCatalogFrequency.set(
      countryId,
      (countryCatalogFrequency.get(countryId) ?? 0) + 1,
    );
  }
}

export function getCountryCatalogFrequency(countryId: CountryId): number {
  return countryCatalogFrequency.get(countryId) ?? 0;
}

export function compareCountriesByCatalogFrequency(a: CountryId, b: CountryId): number {
  const byFrequency = getCountryCatalogFrequency(b) - getCountryCatalogFrequency(a);
  if (byFrequency !== 0) return byFrequency;
  return getCountryName(a).localeCompare(getCountryName(b));
}

export function sortCountryIdsByCatalogFrequency(countryIds: CountryId[]): CountryId[] {
  return [...countryIds].sort(compareCountriesByCatalogFrequency);
}

export function sortCountriesByCatalogFrequency(countries: Country[]): Country[] {
  return [...countries].sort((a, b) => compareCountriesByCatalogFrequency(a.id, b.id));
}
