import type { Country, Region } from '../types';

export const countriesByRegion: Record<Region, Country[]> = {
  AMER: [
    { id: 'brazil', name: 'Brazil', region: 'AMER' },
    { id: 'canada', name: 'Canada', region: 'AMER' },
    { id: 'chile', name: 'Chile', region: 'AMER' },
    { id: 'colombia', name: 'Colombia', region: 'AMER' },
    { id: 'mexico', name: 'Mexico', region: 'AMER' },
    { id: 'peru', name: 'Peru', region: 'AMER' },
    { id: 'united-states', name: 'United States', region: 'AMER' },
  ],
  APAC: [
    { id: 'australia', name: 'Australia', region: 'APAC' },
    { id: 'china', name: 'China', region: 'APAC' },
    { id: 'hong-kong', name: 'Hong Kong', region: 'APAC' },
    { id: 'india', name: 'India', region: 'APAC' },
    { id: 'indonesia', name: 'Indonesia', region: 'APAC' },
    { id: 'japan', name: 'Japan', region: 'APAC' },
    { id: 'malaysia', name: 'Malaysia', region: 'APAC' },
    { id: 'philippines', name: 'Philippines', region: 'APAC' },
    { id: 'singapore', name: 'Singapore', region: 'APAC' },
    { id: 'south-korea', name: 'South Korea', region: 'APAC' },
  ],
  EMEA: [
    { id: 'bulgaria', name: 'Bulgaria', region: 'EMEA' },
    { id: 'finland', name: 'Finland', region: 'EMEA' },
    { id: 'france', name: 'France', region: 'EMEA' },
    { id: 'germany', name: 'Germany', region: 'EMEA' },
    { id: 'ireland', name: 'Ireland', region: 'EMEA' },
    { id: 'italy', name: 'Italy', region: 'EMEA' },
    { id: 'netherlands', name: 'Netherlands', region: 'EMEA' },
    { id: 'oman', name: 'Oman', region: 'EMEA' },
    { id: 'poland', name: 'Poland', region: 'EMEA' },
    { id: 'portugal', name: 'Portugal', region: 'EMEA' },
    { id: 'spain', name: 'Spain', region: 'EMEA' },
    { id: 'sweden', name: 'Sweden', region: 'EMEA' },
    { id: 'switzerland', name: 'Switzerland', region: 'EMEA' },
    { id: 'turkey', name: 'Turkey', region: 'EMEA' },
    { id: 'united-arab-emirates', name: 'United Arab Emirates', region: 'EMEA' },
    { id: 'united-kingdom', name: 'United Kingdom', region: 'EMEA' },
  ],
};

export const allCountries: Country[] = Object.values(countriesByRegion).flat();

export const allCountryIds = allCountries.map((c) => c.id);

export function getCountriesForRegions(regions: Region[]): Country[] {
  return regions.flatMap((region) => countriesByRegion[region]);
}

export function getCountryIdsForRegions(regions: Region[]): Country['id'][] {
  return getCountriesForRegions(regions).map((c) => c.id);
}

export function getCountryName(id: Country['id']): string {
  return allCountries.find((c) => c.id === id)?.name ?? id;
}
