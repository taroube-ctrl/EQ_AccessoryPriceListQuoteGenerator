import { createContext, useContext, useCallback } from 'react';
import { allCountries } from '../data/countries';
import { useCatalogFilters } from '../hooks/useCatalogFilters';
import { useUserLocation } from '../hooks/useUserLocation';
import type { CountryId, Region } from '../types';

type CatalogContextValue = ReturnType<typeof useCatalogFilters> &
  ReturnType<typeof useUserLocation> & {
    setUserCountryAndFilters: (countryId: CountryId, region: Region) => void;
  };

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const userLocation = useUserLocation();
  const catalog = useCatalogFilters({
    userCountry: userLocation.countryId,
    userRegion: userLocation.region,
    locationReady: userLocation.ready,
  });

  const setUserCountryAndFilters = useCallback(
    (countryId: CountryId, region: Region) => {
      userLocation.setUserCountry(countryId, region);
      catalog.applyUserLocation(countryId, region);
    },
    [userLocation, catalog],
  );

  const value: CatalogContextValue = {
    ...userLocation,
    ...catalog,
    setUserCountryAndFilters,
    allCountries,
  };

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used within CatalogProvider');
  return ctx;
}
