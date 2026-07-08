import clsx from 'clsx';
import type { Region } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  active?: boolean;
  className?: string;
}

export function Badge({ children, active = true, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-block px-2 py-0.5 text-xs font-mono font-medium rounded-sm',
        active
          ? 'bg-accent-subtle text-brand-red border border-accent-border'
          : 'bg-surface-muted text-text-muted line-through border border-border',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function RegionBadges({ regions, available }: { regions: Region[]; available: Region[] }) {
  const all: Region[] = ['AMER', 'APAC', 'EMEA'];
  return (
    <div className="flex flex-wrap gap-1">
      {all.map((region) => (
        <Badge key={region} active={available.includes(region)}>
          {region}
        </Badge>
      ))}
    </div>
  );
}

export function BrandBadge({ brand }: { brand: string }) {
  const variesByQuote = /varies by quote/i.test(brand);

  return (
    <span
      className={clsx(
        'inline-block px-2 py-0.5 text-xs rounded-sm border',
        variesByQuote
          ? 'font-medium bg-amber-50 text-amber-950 border-amber-200'
          : 'font-semibold bg-slate-800 text-white border-slate-700',
      )}
    >
      {brand}
    </span>
  );
}

interface ProductLabelsProps {
  brand?: string;
  regions: Region[];
  availableRegions: Region[];
}

export function PduInputCableBadge() {
  return (
    <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-sm border bg-amber-50 text-amber-950 border-amber-200">
      Input cable not included
    </span>
  );
}

export function ProductLabels({ brand, regions, availableRegions }: ProductLabelsProps) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {brand ? <BrandBadge brand={brand} /> : null}
      <RegionBadges regions={regions} available={availableRegions} />
    </div>
  );
}
