import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Product } from '../types';
import type { CartItem, CartPriceSnapshot } from '../types/cart';

const STORAGE_KEY = 'accessory-quote-cart';

export interface CartAddedToastState {
  id: number;
  productId: string;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  addedToast: CartAddedToastState | null;
  addProduct: (product: Product, price: CartPriceSnapshot, quantity?: number) => void;
  removeProduct: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  dismissAddedToast: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function loadStoredItems(): CartItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadStoredItems());
  const [addedToast, setAddedToast] = useState<CartAddedToastState | null>(null);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const dismissAddedToast = useCallback(() => {
    setAddedToast(null);
  }, []);

  const addProduct = useCallback(
    (product: Product, price: CartPriceSnapshot, quantity = 1) => {
      const addQuantity = Math.max(1, Math.floor(quantity));

      setItems((current) => {
        const existing = current.find((item) => item.productId === product.id);
        if (existing) {
          return current.map((item) =>
            item.productId === product.id
              ? {
                  ...item,
                  quantity: item.quantity + addQuantity,
                  unitPrice: price.unitPrice ?? item.unitPrice,
                  priceCountryId: price.priceCountryId ?? item.priceCountryId,
                }
              : item,
          );
        }

        return [
          ...current,
          {
            productId: product.id,
            quantity: addQuantity,
            unitPrice: price.unitPrice,
            priceCountryId: price.priceCountryId,
          },
        ];
      });

      setAddedToast({
        id: Date.now(),
        productId: product.id,
        quantity: addQuantity,
      });
    },
    [],
  );

  const removeProduct = useCallback((productId: string) => {
    setItems((current) => current.filter((item) => item.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((current) => current.filter((item) => item.productId !== productId));
      return;
    }

    setItems((current) =>
      current.map((item) => (item.productId === productId ? { ...item, quantity } : item)),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      itemCount,
      addedToast,
      addProduct,
      removeProduct,
      updateQuantity,
      clearCart,
      dismissAddedToast,
    }),
    [items, itemCount, addedToast, addProduct, removeProduct, updateQuantity, clearCart, dismissAddedToast],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
