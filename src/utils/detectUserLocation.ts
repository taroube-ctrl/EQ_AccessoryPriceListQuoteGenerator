import { allCountries, getCountryIdsForRegions } from '../data/countries';
import type { CountryId, Region } from '../types';

export type DetectionSource = 'stored' | 'browser' | 'default';

export interface DetectedLocation {
  countryId: CountryId;
  region: Region;
  source: DetectionSource;
}

const STORAGE_KEY = 'rw-user-country';

const languageToCountry: Record<string, CountryId> = {
  'en-us': 'united-states',
  'en-ca': 'canada',
  'en-gb': 'united-kingdom',
  'en-au': 'australia',
  'en-in': 'india',
  'en-sg': 'singapore',
  'en-ie': 'ireland',
  'pt-br': 'brazil',
  'pt-pt': 'portugal',
  'es-mx': 'mexico',
  'es-es': 'spain',
  'es-cl': 'chile',
  'es-co': 'colombia',
  'es-pe': 'peru',
  'fr-fr': 'france',
  'de-de': 'germany',
  'de-ch': 'switzerland',
  'it-it': 'italy',
  'nl-nl': 'netherlands',
  'pl-pl': 'poland',
  'sv-se': 'sweden',
  'fi-fi': 'finland',
  'bg-bg': 'bulgaria',
  'tr-tr': 'turkey',
  'zh-cn': 'china',
  'zh-hk': 'hong-kong',
  'id-id': 'indonesia',
  'ar-ae': 'united-arab-emirates',
  'ar-om': 'oman',
};

const timezoneToCountry: Record<string, CountryId> = {
  'America/New_York': 'united-states',
  'America/Chicago': 'united-states',
  'America/Denver': 'united-states',
  'America/Los_Angeles': 'united-states',
  'America/Toronto': 'canada',
  'America/Vancouver': 'canada',
  'America/Sao_Paulo': 'brazil',
  'America/Mexico_City': 'mexico',
  'America/Bogota': 'colombia',
  'America/Lima': 'peru',
  'America/Santiago': 'chile',
  'Europe/London': 'united-kingdom',
  'Europe/Dublin': 'ireland',
  'Europe/Paris': 'france',
  'Europe/Berlin': 'germany',
  'Europe/Amsterdam': 'netherlands',
  'Europe/Madrid': 'spain',
  'Europe/Rome': 'italy',
  'Europe/Stockholm': 'sweden',
  'Europe/Helsinki': 'finland',
  'Europe/Warsaw': 'poland',
  'Europe/Lisbon': 'portugal',
  'Europe/Zurich': 'switzerland',
  'Europe/Sofia': 'bulgaria',
  'Europe/Istanbul': 'turkey',
  'Asia/Dubai': 'united-arab-emirates',
  'Asia/Muscat': 'oman',
  'Asia/Singapore': 'singapore',
  'Asia/Kolkata': 'india',
  'Asia/Shanghai': 'china',
  'Asia/Hong_Kong': 'hong-kong',
  'Asia/Jakarta': 'indonesia',
  'Asia/Kuala_Lumpur': 'malaysia',
  'Asia/Manila': 'philippines',
  'Australia/Sydney': 'australia',
  'Australia/Melbourne': 'australia',
};

function getCountryMeta(countryId: CountryId): DetectedLocation {
  const country = allCountries.find((c) => c.id === countryId);
  return {
    countryId,
    region: country?.region ?? 'AMER',
    source: 'default',
  };
}

function detectFromBrowser(): CountryId | null {
  const languages = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];

  for (const lang of languages) {
    const normalized = lang.toLowerCase();
    if (languageToCountry[normalized]) return languageToCountry[normalized];

    const base = normalized.split('-')[0];
    const partialMatch = Object.entries(languageToCountry).find(([key]) =>
      key.startsWith(`${base}-`),
    );
    if (partialMatch) return partialMatch[1];
  }

  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezoneToCountry[timezone]) return timezoneToCountry[timezone];

    if (timezone.startsWith('America/')) return 'united-states';
    if (timezone.startsWith('Europe/')) return 'united-kingdom';
    if (timezone.startsWith('Asia/')) return 'singapore';
    if (timezone.startsWith('Australia/')) return 'australia';
  } catch {
    // ignore timezone detection errors
  }

  return null;
}

export function readStoredCountry(): CountryId | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && allCountries.some((c) => c.id === stored)) {
      return stored as CountryId;
    }
  } catch {
    // ignore storage errors
  }
  return null;
}

export function storeCountry(countryId: CountryId): void {
  try {
    localStorage.setItem(STORAGE_KEY, countryId);
  } catch {
    // ignore storage errors
  }
}

export function detectUserLocation(): DetectedLocation {
  const stored = readStoredCountry();
  if (stored) {
    return { ...getCountryMeta(stored), source: 'stored' };
  }

  const detected = detectFromBrowser();
  if (detected) {
    return { ...getCountryMeta(detected), source: 'browser' };
  }

  return { countryId: 'united-states', region: 'AMER', source: 'default' };
}

export function buildFiltersForLocation(countryId: CountryId, region: Region) {
  if (region === 'APAC' || region === 'EMEA') {
    return {
      regions: [region] as Region[],
      countries: getCountryIdsForRegions([region]),
    };
  }

  return {
    regions: [region] as Region[],
    countries: [countryId] as CountryId[],
  };
}
