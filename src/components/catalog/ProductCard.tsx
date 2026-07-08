import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { formatPrice } from '../../data/localeConfig';
import { getCountryName, getCountryIdsForRegions } from '../../data/countries';
import { useCatalog } from '../../context/CatalogContext';
import { getProductDisplayPrice } from '../../utils/productPricing';
import { ProductDimensionsDisplay } from './ProductDimensionsDisplay';
import { PduInputCableBadge, ProductLabels } from '../ui/Badge';
import { getProductDisplayName, isCabinetProduct, resolveProductDimensions } from '../../utils/productDisplayName';
import { pduRequiresSeparateInputCable } from '../../utils/powerPduInputCable';
import { AddToCartControls } from '../cart/AddToCartControls';
import type { Product } from '../../types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { countryId, displayUnit, filters } = useCatalog();
  const activeCountryIds = getCountryIdsForRegions(filters.regions);
  const scopedCountries = filters.countries.filter((id) => activeCountryIds.includes(id));
  const displayPrice = getProductDisplayPrice(product, countryId, scopedCountries);
  const listingCountry =
    displayPrice &&
    (product.countries?.length === 1 || displayPrice.countryId !== countryId)
      ? getCountryName(displayPrice.countryId)
      : null;
  const showInputCableNotice = pduRequiresSeparateInputCable(product);
  const resolvedDimensions = resolveProductDimensions(product);
  const showDimensionsBlock = resolvedDimensions != null && !isCabinetProduct(product);
  const displayName = getProductDisplayName(product, displayUnit);
  const modelLine = product.partNumber;
  const manufacturerModel = [product.brand, modelLine].filter(Boolean).join(' · ');

  return (
    <article
      className={clsx(
        'border border-border rounded-sm bg-surface flex flex-col transition-shadow',
        'hover:shadow-md hover:border-brand-red/30',
      )}
    >
      <Link
        to={`/products/${product.id}`}
        className={clsx(
          'flex flex-col flex-1 no-underline text-inherit group',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-red',
        )}
      >
        <div className="aspect-[4/3] bg-surface-muted flex items-center justify-center border-b border-border">
          <div className="text-center text-text-muted">
            <svg
              className="mx-auto mb-2 opacity-40"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <span className="text-xs font-mono">Product Image</span>
          </div>
        </div>

        <div className="p-4 flex flex-col flex-1">
          <div className="mb-2">
            <ProductLabels
              brand={product.brand}
              regions={['AMER', 'APAC', 'EMEA']}
              availableRegions={product.regions}
            />
            {showInputCableNotice ? (
              <div className="mt-2">
                <PduInputCableBadge />
              </div>
            ) : null}
          </div>

          <h3 className="text-base font-bold mb-1 m-0 leading-snug">{displayName}</h3>
          {manufacturerModel || listingCountry ? (
            <p className="font-mono text-xs text-text-muted mb-3 m-0">
              {manufacturerModel}
              {manufacturerModel && listingCountry ? ' · ' : null}
              {listingCountry}
            </p>
          ) : null}

          {showDimensionsBlock ? (
            <ProductDimensionsDisplay
              dimensions={resolvedDimensions!}
              displayUnit={displayUnit}
              compact
            />
          ) : null}

          <p className="text-xl font-extrabold mt-auto pt-2 m-0">
            {displayPrice != null
              ? formatPrice(displayPrice.price, countryId)
              : 'Pricing unavailable'}
          </p>
        </div>
      </Link>

      <div className="px-4 pb-4">
        <AddToCartControls product={product} />
      </div>
    </article>
  );
}
