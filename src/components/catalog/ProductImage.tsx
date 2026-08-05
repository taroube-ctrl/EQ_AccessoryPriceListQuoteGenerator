import { useState } from 'react';
import clsx from 'clsx';
import { getProductImageUrl } from '../../utils/productImages';
import type { Product } from '../../types';

interface ProductImageProps {
  product: Product;
  className?: string;
  imgClassName?: string;
  iconSize?: number;
  labelClassName?: string;
}

function ImagePlaceholder({
  iconSize,
  labelClassName,
}: {
  iconSize: number;
  labelClassName: string;
}) {
  return (
    <div className="text-center text-text-muted">
      <svg
        className="mx-auto mb-2 opacity-40"
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
      <span className={clsx('font-mono', labelClassName)}>Product Image</span>
    </div>
  );
}

export function ProductImage({
  product,
  className,
  imgClassName,
  iconSize = 48,
  labelClassName = 'text-xs',
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const src = getProductImageUrl(product);
  const alt = [product.brand, product.partNumber || product.name].filter(Boolean).join(' ');

  return (
    <div
      className={clsx(
        'bg-surface-muted flex items-center justify-center overflow-hidden',
        className,
      )}
    >
      {failed ? (
        <ImagePlaceholder iconSize={iconSize} labelClassName={labelClassName} />
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className={clsx('w-full h-full object-contain', imgClassName)}
        />
      )}
    </div>
  );
}
