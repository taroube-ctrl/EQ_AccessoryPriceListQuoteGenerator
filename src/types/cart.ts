import type { CountryId } from './index';

export interface CartItem {
  productId: string;
  quantity: number;
  unitPrice: number | null;
  priceCountryId: CountryId | null;
}

export interface CartPriceSnapshot {
  unitPrice: number | null;
  priceCountryId: CountryId | null;
}
