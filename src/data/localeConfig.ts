import type { CountryId, Region } from '../types';

export interface LocaleSettings {
  language: string;
  languageLabel: string;
  currency: string;
  currencySymbol: string;
}

const localeByCountry: Record<CountryId, LocaleSettings> = {
  brazil: {
    language: 'pt-BR',
    languageLabel: 'PT',
    currency: 'BRL',
    currencySymbol: 'R$',
  },
  canada: {
    language: 'en-CA',
    languageLabel: 'EN',
    currency: 'CAD',
    currencySymbol: 'CA$',
  },
  chile: {
    language: 'es-CL',
    languageLabel: 'ES',
    currency: 'CLP',
    currencySymbol: 'CL$',
  },
  colombia: {
    language: 'es-CO',
    languageLabel: 'ES',
    currency: 'COP',
    currencySymbol: 'COL$',
  },
  mexico: {
    language: 'es-MX',
    languageLabel: 'ES',
    currency: 'MXN',
    currencySymbol: 'MX$',
  },
  peru: {
    language: 'es-PE',
    languageLabel: 'ES',
    currency: 'PEN',
    currencySymbol: 'S/',
  },
  'united-states': {
    language: 'en-US',
    languageLabel: 'EN',
    currency: 'USD',
    currencySymbol: '$',
  },
  australia: {
    language: 'en-AU',
    languageLabel: 'EN',
    currency: 'AUD',
    currencySymbol: 'A$',
  },
  china: {
    language: 'zh-CN',
    languageLabel: 'ZH',
    currency: 'CNY',
    currencySymbol: '¥',
  },
  'hong-kong': {
    language: 'zh-HK',
    languageLabel: 'ZH',
    currency: 'HKD',
    currencySymbol: 'HK$',
  },
  india: {
    language: 'en-IN',
    languageLabel: 'EN',
    currency: 'INR',
    currencySymbol: '₹',
  },
  indonesia: {
    language: 'id-ID',
    languageLabel: 'ID',
    currency: 'IDR',
    currencySymbol: 'Rp',
  },
  japan: {
    language: 'ja-JP',
    languageLabel: 'JA',
    currency: 'JPY',
    currencySymbol: '¥',
  },
  malaysia: {
    language: 'en-MY',
    languageLabel: 'EN',
    currency: 'MYR',
    currencySymbol: 'RM',
  },
  philippines: {
    language: 'en-PH',
    languageLabel: 'EN',
    currency: 'PHP',
    currencySymbol: '₱',
  },
  singapore: {
    language: 'en-SG',
    languageLabel: 'EN',
    currency: 'SGD',
    currencySymbol: 'S$',
  },
  'south-korea': {
    language: 'ko-KR',
    languageLabel: 'KO',
    currency: 'KRW',
    currencySymbol: '₩',
  },
  bulgaria: {
    language: 'bg-BG',
    languageLabel: 'BG',
    currency: 'EUR',
    currencySymbol: '€',
  },
  finland: {
    language: 'fi-FI',
    languageLabel: 'FI',
    currency: 'EUR',
    currencySymbol: '€',
  },
  france: {
    language: 'fr-FR',
    languageLabel: 'FR',
    currency: 'EUR',
    currencySymbol: '€',
  },
  germany: {
    language: 'de-DE',
    languageLabel: 'DE',
    currency: 'EUR',
    currencySymbol: '€',
  },
  ireland: {
    language: 'en-IE',
    languageLabel: 'EN',
    currency: 'EUR',
    currencySymbol: '€',
  },
  italy: {
    language: 'it-IT',
    languageLabel: 'IT',
    currency: 'EUR',
    currencySymbol: '€',
  },
  netherlands: {
    language: 'nl-NL',
    languageLabel: 'NL',
    currency: 'EUR',
    currencySymbol: '€',
  },
  oman: {
    language: 'ar-OM',
    languageLabel: 'AR',
    currency: 'OMR',
    currencySymbol: 'OMR',
  },
  poland: {
    language: 'pl-PL',
    languageLabel: 'PL',
    currency: 'PLN',
    currencySymbol: 'zł',
  },
  portugal: {
    language: 'pt-PT',
    languageLabel: 'PT',
    currency: 'EUR',
    currencySymbol: '€',
  },
  spain: {
    language: 'es-ES',
    languageLabel: 'ES',
    currency: 'EUR',
    currencySymbol: '€',
  },
  sweden: {
    language: 'sv-SE',
    languageLabel: 'SV',
    currency: 'SEK',
    currencySymbol: 'kr',
  },
  switzerland: {
    language: 'de-CH',
    languageLabel: 'DE',
    currency: 'CHF',
    currencySymbol: 'CHF',
  },
  turkey: {
    language: 'tr-TR',
    languageLabel: 'TR',
    currency: 'TRY',
    currencySymbol: '₺',
  },
  'united-arab-emirates': {
    language: 'ar-AE',
    languageLabel: 'AR',
    currency: 'AED',
    currencySymbol: 'AED',
  },
  'united-kingdom': {
    language: 'en-GB',
    languageLabel: 'EN',
    currency: 'GBP',
    currencySymbol: '£',
  },
};

const regionLabels: Record<Region, string> = {
  AMER: 'Americas',
  APAC: 'Asia-Pacific',
  EMEA: 'Europe, Middle East & Africa',
};

export function getLocaleSettings(countryId: CountryId): LocaleSettings {
  return localeByCountry[countryId];
}

export function getRegionLabel(region: Region): string {
  return regionLabels[region];
}

export function formatPrice(amount: number, countryId: CountryId): string {
  const { currency, currencySymbol, language } = getLocaleSettings(countryId);
  try {
    return new Intl.NumberFormat(language, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currencySymbol}${amount.toLocaleString()}`;
  }
}
