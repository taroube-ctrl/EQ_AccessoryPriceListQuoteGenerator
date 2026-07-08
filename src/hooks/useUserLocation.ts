import { useCallback, useEffect, useState } from 'react';
import { getCountryName } from '../data/countries';
import { getRegionLabel, getLocaleSettings } from '../data/localeConfig';
import {
  buildFiltersForLocation,
  detectUserLocation,
  storeCountry,
  type DetectionSource,
} from '../utils/detectUserLocation';
import type { CountryId, Region } from '../types';

export function useUserLocation() {
  const [countryId, setCountryId] = useState<CountryId>('united-states');
  const [region, setRegion] = useState<Region>('AMER');
  const [source, setSource] = useState<DetectionSource>('default');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const detected = detectUserLocation();
    setCountryId(detected.countryId);
    setRegion(detected.region);
    setSource(detected.source);
    setReady(true);
  }, []);

  const setUserCountry = useCallback((nextCountryId: CountryId, nextRegion: Region) => {
    setCountryId(nextCountryId);
    setRegion(nextRegion);
    setSource('stored');
    storeCountry(nextCountryId);
  }, []);

  const locale = getLocaleSettings(countryId);
  const currencyCountryId = countryId;

  return {
    ready,
    countryId,
    region,
    countryName: getCountryName(countryId),
    regionLabel: getRegionLabel(region),
    locale,
    currencyCountryId,
    source,
    setUserCountry,
    locationFilters: buildFiltersForLocation(countryId, region),
  };
}
