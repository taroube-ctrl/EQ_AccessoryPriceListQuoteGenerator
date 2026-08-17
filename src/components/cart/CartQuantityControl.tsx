import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useCart } from '../../context/CartContext';

interface CartQuantityControlProps {
  productId: string;
  quantity: number;
  className?: string;
}

function normalizeQuantity(raw: string, fallback: number): number {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.floor(parsed);
}

export function CartQuantityControl({ productId, quantity, className }: CartQuantityControlProps) {
  const { updateQuantity } = useCart();
  const [draft, setDraft] = useState(String(quantity));

  useEffect(() => {
    setDraft(String(quantity));
  }, [quantity]);

  const commitDraft = (raw = draft) => {
    const next = normalizeQuantity(raw, quantity);
    setDraft(String(next));
    if (next !== quantity) updateQuantity(productId, next);
  };

  return (
    <div
      className={clsx(
        'inline-flex items-center border border-border rounded-sm overflow-hidden bg-surface',
        className,
      )}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => updateQuantity(productId, quantity - 1)}
        className="w-8 h-8 border-none bg-surface-muted cursor-pointer hover:bg-accent-subtle shrink-0"
      >
        −
      </button>
      <label htmlFor={`cart-qty-${productId}`} className="sr-only">
        Quantity
      </label>
      <input
        id={`cart-qty-${productId}`}
        type="number"
        min={1}
        inputMode="numeric"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => commitDraft()}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.currentTarget.blur();
          }
        }}
        className="w-12 min-w-0 px-1 py-2 text-sm text-center font-mono border-none outline-none bg-transparent [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => updateQuantity(productId, quantity + 1)}
        className="w-8 h-8 border-none bg-surface-muted cursor-pointer hover:bg-accent-subtle shrink-0"
      >
        +
      </button>
    </div>
  );
}
