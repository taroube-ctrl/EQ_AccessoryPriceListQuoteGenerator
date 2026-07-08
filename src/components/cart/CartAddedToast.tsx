import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useCatalog } from '../../context/CatalogContext';
import { getProductById } from '../../data/products';
import { getProductDisplayName } from '../../utils/productDisplayName';

export function CartAddedToast() {
  const { addedToast, dismissAddedToast } = useCart();
  const { displayUnit } = useCatalog();
  const [visible, setVisible] = useState(false);
  const product = addedToast ? getProductById(addedToast.productId) : undefined;
  const productName = product ? getProductDisplayName(product, displayUnit) : 'Item';

  useEffect(() => {
    if (!addedToast) {
      setVisible(false);
      return;
    }

    const showTimer = window.setTimeout(() => setVisible(true), 10);
    const hideTimer = window.setTimeout(() => dismissAddedToast(), 3200);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, [addedToast, dismissAddedToast]);

  if (!addedToast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={clsx(
        'fixed top-24 right-4 z-[100] w-[min(20rem,calc(100vw-2rem))]',
        'transition-all duration-300 ease-out',
        visible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0',
      )}
    >
      <div className="flex items-start gap-3 rounded-sm border border-border bg-surface px-4 py-3 shadow-lg">
        <span
          aria-hidden
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cart text-white"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-text m-0">
            {addedToast.quantity > 1
              ? `${addedToast.quantity} items added to cart`
              : 'Item added to cart'}
          </p>
          <p className="text-xs text-text-muted mt-1 mb-2 m-0 line-clamp-2">{productName}</p>
          <Link
            to="/cart"
            onClick={dismissAddedToast}
            className="text-xs font-semibold text-cart no-underline hover:underline"
          >
            View cart
          </Link>
        </div>
        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={dismissAddedToast}
          className="shrink-0 border-none bg-transparent text-text-muted cursor-pointer p-0 hover:text-text"
        >
          ×
        </button>
      </div>
    </div>
  );
}
