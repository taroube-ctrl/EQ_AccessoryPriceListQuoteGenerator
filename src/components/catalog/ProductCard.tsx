import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { formatPrice } from '../../data/localeConfig';
import { getCountryName, getCountryIdsForRegions } from '../../data/countries';
import { useCatalog } from '../../context/CatalogContext';
import { getProductDisplayPrice } from '../../utils/productPricing';
import { getPduCharacteristics } from '../../utils/pduCharacteristics';
import { ProductDimensionsDisplay } from './ProductDimensionsDisplay';
import { ProductImage } from './ProductImage';
import { Badge, PduInputCableBadge, ProductLabels } from '../ui/Badge';
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
  const priceNote = displayPrice?.converted
    ? 'Est. USD'
    : displayPrice &&
        (product.countries?.length === 1 || displayPrice.countryId !== countryId)
      ? getCountryName(displayPrice.countryId)
      : null;
  const showInputCableNotice = pduRequiresSeparateInputCable(product);
  const pduCharacteristics = getPduCharacteristics(product);
  const pduSpecChips = pduCharacteristics
    ? [
        pduCharacteristics.voltage,
        pduCharacteristics.current,
        pduCharacteristics.phase,
        pduCharacteristics.type,
      ].filter((value): value is string => Boolean(value))
    : [];
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
        <ProductImage
          product={product}
          className="aspect-[4/3] border-b border-border"
          iconSize={48}
          labelClassName="text-xs"
        />

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
          {manufacturerModel || priceNote ? (
            <p className="font-mono text-xs text-text-muted mb-3 m-0">
              {manufacturerModel}
              {manufacturerModel && priceNote ? ' · ' : null}
              {priceNote}
            </p>
          ) : null}

          {pduCharacteristics ? (
            <div className="mb-3">
              {pduSpecChips.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {pduSpecChips.map((chip) => (
                    <Badge key={chip}>{chip}</Badge>
                  ))}
                </div>
              ) : null}
              {pduCharacteristics.outlets ? (
                <p className="font-mono text-xs text-text-muted mt-1.5 mb-0">
                  {pduCharacteristics.outlets} outlets
                </p>
              ) : null}
            </div>
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
