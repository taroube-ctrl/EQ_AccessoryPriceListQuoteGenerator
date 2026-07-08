import { Link, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useCart } from '../context/CartContext';
import { useCatalog } from '../context/CatalogContext';
import { formatPrice } from '../data/localeConfig';
import { getProductById } from '../data/products';
import { Button } from '../components/ui/Button';
import { getProductDisplayName } from '../utils/productDisplayName';

export function CartPage() {
  const navigate = useNavigate();
  const { items, itemCount, removeProduct, updateQuantity, clearCart } = useCart();
  const { countryId, displayUnit } = useCatalog();

  const pricedTotal = items.reduce((total, item) => {
    if (item.unitPrice == null) return total;
    return total + item.unitPrice * item.quantity;
  }, 0);

  const hasUnpricedItems = items.some((item) => item.unitPrice == null);

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold m-0 mb-2">Cart</h1>
          <p className="text-sm text-text-muted m-0">
            {itemCount === 0
              ? 'No items in your quote yet.'
              : `${itemCount} item${itemCount === 1 ? '' : 's'} in your quote.`}
          </p>
        </div>
        {items.length > 0 ? (
          <Button variant="secondary" onClick={clearCart}>
            Clear cart
          </Button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="border border-border rounded-sm bg-surface p-10 text-center">
          <p className="text-text-muted mb-6 m-0">Your cart is empty.</p>
          <Button onClick={() => navigate('/products')}>Browse products</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_20rem] gap-8 items-start">
          <div className="border border-border rounded-sm bg-surface overflow-hidden">
            <ul className="divide-y divide-border m-0 p-0 list-none">
              {items.map((item) => {
                const product = getProductById(item.productId);
                if (!product) return null;

                const lineTotal =
                  item.unitPrice != null ? item.unitPrice * item.quantity : null;

                return (
                  <li key={item.productId} className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/products/${product.id}`}
                          className="text-lg font-bold text-text no-underline hover:text-brand-red"
                        >
                          {getProductDisplayName(product, displayUnit)}
                        </Link>
                        {product.partNumber ? (
                          <p className="font-mono text-xs text-text-muted mt-1 mb-0">
                            {product.partNumber}
                          </p>
                        ) : null}
                        {item.unitPrice != null ? (
                          <p className="text-sm text-text-muted mt-2 mb-0">
                            {formatPrice(item.unitPrice, countryId)} each
                          </p>
                        ) : (
                          <p className="text-sm text-text-muted mt-2 mb-0">Pricing unavailable</p>
                        )}
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="inline-flex items-center border border-border rounded-sm overflow-hidden">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="w-8 h-8 border-none bg-surface-muted cursor-pointer hover:bg-accent-subtle"
                          >
                            −
                          </button>
                          <span className="w-10 text-center text-sm font-mono">{item.quantity}</span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="w-8 h-8 border-none bg-surface-muted cursor-pointer hover:bg-accent-subtle"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right min-w-[6rem]">
                          <p className="text-lg font-extrabold m-0">
                            {lineTotal != null ? formatPrice(lineTotal, countryId) : 'Price TBD'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeProduct(item.productId)}
                      className={clsx(
                        'mt-4 text-sm text-text-muted border-none bg-transparent cursor-pointer p-0',
                        'hover:text-brand-red hover:underline',
                      )}
                    >
                      Remove
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <aside className="border border-border rounded-sm bg-surface p-5 lg:sticky lg:top-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-text-secondary m-0 mb-4">
              Quote summary
            </h2>
            <dl className="space-y-3 text-sm m-0">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-text-muted m-0">Items</dt>
                <dd className="font-mono m-0">{itemCount}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
                <dt className="font-semibold m-0">Estimated total</dt>
                <dd className="text-xl font-extrabold m-0">
                  {hasUnpricedItems && pricedTotal === 0
                    ? 'Price TBD'
                    : formatPrice(pricedTotal, countryId)}
                </dd>
              </div>
            </dl>
            {hasUnpricedItems ? (
              <p className="text-xs text-text-muted mt-3 mb-0 leading-relaxed">
                Some items do not have pricing for your selected location. Contact sales for a full
                quote.
              </p>
            ) : null}
            <Button
              variant="cart"
              className="w-full mt-5"
              onClick={() => navigate('/request-quote')}
            >
              Request Quote
            </Button>
            <Link
              to="/products"
              className="block text-center text-sm text-brand-red no-underline hover:underline mt-4"
            >
              Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
