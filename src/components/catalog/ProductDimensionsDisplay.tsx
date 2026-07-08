import clsx from 'clsx';
import { formatMm, formatRackUnits } from '../../utils/dimensions';
import { formatProductDimensionsLabel } from '../../utils/productDisplayName';
import type { ProductDimensions, DisplayUnit } from '../../types/dimensions';

interface ProductDimensionsDisplayProps {
  dimensions: ProductDimensions;
  displayUnit: DisplayUnit;
  compact?: boolean;
}

export function ProductDimensionsDisplay({
  dimensions,
  displayUnit,
  compact = false,
}: ProductDimensionsDisplayProps) {
  const { rackUnits, widthMm, depthMm } = dimensions;

  if (compact) {
    return (
      <p className="text-xs font-mono text-text-muted m-0 mb-2">
        {formatProductDimensionsLabel(dimensions, displayUnit)}
      </p>
    );
  }

  return (
    <dl className="text-xs text-text-muted space-y-1 mb-3 m-0">
      <div className="flex gap-2">
        <dt className="font-semibold text-text-secondary w-14 shrink-0">Height</dt>
        <dd className="m-0 font-mono">{formatRackUnits(rackUnits)}</dd>
      </div>
      {widthMm != null ? (
        <div className="flex gap-2">
          <dt className="font-semibold text-text-secondary w-14 shrink-0">Width</dt>
          <dd className="m-0 font-mono">{formatMm(widthMm, displayUnit)}</dd>
        </div>
      ) : null}
      {depthMm != null ? (
        <div className="flex gap-2">
          <dt className="font-semibold text-text-secondary w-14 shrink-0">Depth</dt>
          <dd className="m-0 font-mono">{formatMm(depthMm, displayUnit)}</dd>
        </div>
      ) : null}
    </dl>
  );
}

export function ProductDimensionsBadge({
  dimensions,
  displayUnit,
}: {
  dimensions: ProductDimensions;
  displayUnit: DisplayUnit;
}) {
  return (
    <span
      className={clsx(
        'inline-block text-[10px] font-mono px-2 py-0.5 rounded-sm',
        'bg-surface-muted text-text-muted border border-border',
      )}
    >
      {formatProductDimensionsLabel(dimensions, displayUnit)}
    </span>
  );
}
