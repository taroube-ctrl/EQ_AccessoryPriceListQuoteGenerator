import { useCallback } from 'react';
import { getCountryIdsForRegions } from '../data/countries';
import { useCart } from '../context/CartContext';
import { useCatalog } from '../context/CatalogContext';
import { getCartPriceSnapshot } from '../utils/cartPricing';
import type { Product } from '../types';

export function useAddToCart(product: Product) {
  const { addProduct } = useCart();
  const { countryId, filters } = useCatalog();
  const activeCountryIds = getCountryIdsForRegions(filters.regions);
  const scopedCountries = filters.countries.filter((id) => activeCountryIds.includes(id));
  const priceSnapshot = getCartPriceSnapshot(product, countryId, scopedCountries);

  return useCallback(
    (quantity = 1, event?: React.MouseEvent) => {
      event?.stopPropagation();
      event?.preventDefault();
      addProduct(product, priceSnapshot, quantity);
    },
    [addProduct, product, priceSnapshot],
  );
}
