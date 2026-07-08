import { useState } from 'react';
import clsx from 'clsx';
import { useAddToCart } from '../../hooks/useAddToCart';
import { Button } from '../ui/Button';
import type { Product } from '../../types';

interface AddToCartControlsProps {
  product: Product;
  layout?: 'stacked' | 'inline';
  className?: string;
}

export function AddToCartControls({
  product,
  layout = 'stacked',
  className,
}: AddToCartControlsProps) {
  const [quantity, setQuantity] = useState(1);
  const handleAddToCart = useAddToCart(product);

  const commitQuantity = (raw: string) => {
    const parsed = Number(raw);
    setQuantity(Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : 1);
  };

  const quantityInput = (
    <div
      className={clsx(
        'inline-flex items-center border border-border rounded-sm overflow-hidden bg-surface shrink-0',
        layout === 'stacked' ? 'w-[4.5rem]' : 'w-[5rem]',
      )}
    >
      <label htmlFor={`add-qty-${product.id}`} className="sr-only">
        Quantity
      </label>
      <input
        id={`add-qty-${product.id}`}
        type="number"
        min={1}
        inputMode="numeric"
        value={quantity}
        onChange={(event) => commitQuantity(event.target.value)}
        onClick={(event) => event.stopPropagation()}
        className="w-full min-w-0 px-2 py-2.5 text-sm text-center font-mono border-none outline-none bg-transparent"
      />
    </div>
  );

  if (layout === 'inline') {
    return (
      <div className={clsx('flex flex-wrap items-stretch gap-2', className)}>
        {quantityInput}
        <Button
          variant="cart"
          className="min-w-[160px]"
          onClick={(event) => handleAddToCart(quantity, event)}
        >
          Add to Cart
        </Button>
      </div>
    );
  }

  return (
    <div className={clsx('flex items-stretch gap-2', className)}>
      {quantityInput}
      <button
        type="button"
        onClick={(event) => handleAddToCart(quantity, event)}
        className={clsx(
          'flex-1 inline-flex items-center justify-center font-semibold transition-colors rounded-sm cursor-pointer',
          'px-5 py-2.5 text-sm bg-cart text-white hover:bg-cart-hover border border-cart',
        )}
      >
        Add to Cart
      </button>
    </div>
  );
}
