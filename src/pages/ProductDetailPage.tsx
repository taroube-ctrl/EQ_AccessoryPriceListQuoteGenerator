import { Link, useNavigate, useParams } from 'react-router-dom';
import { getCountryName, getCountryIdsForRegions } from '../data/countries';
import { categoryMap } from '../data/categories';
import { formatPrice } from '../data/localeConfig';
import { getProductById, getRelatedProducts } from '../data/products';
import { getProductCountries } from '../hooks/useCatalogFilters';
import { sortCountryIdsByCatalogFrequency } from '../utils/countryCatalogFrequency';
import { getProductEquinixPrice, getProductDisplayPrice } from '../utils/productPricing';
import { useCatalog } from '../context/CatalogContext';
import { ProductDimensionsDisplay } from '../components/catalog/ProductDimensionsDisplay';
import { ProductCard } from '../components/catalog/ProductCard';
import { PduInputCableBadge, ProductLabels } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { getProductDisplayName, formatDescriptionWithDisplayUnits, resolveProductDimensions } from '../utils/productDisplayName';
import { pduRequiresSeparateInputCable } from '../utils/powerPduInputCable';
import { AddToCartControls } from '../components/cart/AddToCartControls';

export function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { countryId, displayUnit, setCategory, filters } = useCatalog();

  const product = productId ? getProductById(productId) : undefined;

  if (!product) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Product not found</h1>
        <p className="text-text-muted mb-6">
          The item you are looking for may have been removed or the link is incorrect.
        </p>
          <Button onClick={() => navigate('/products')}>Back to catalog</Button>
      </div>
    );
  }

  const category = categoryMap[product.categoryId];
  const productCountries = sortCountryIdsByCatalogFrequency(getProductCountries(product));
  const relatedProducts = getRelatedProducts(product);
  const activeCountryIds = getCountryIdsForRegions(filters.regions);
  const scopedCountries = filters.countries.filter((id) => activeCountryIds.includes(id));
  const displayPrice = getProductDisplayPrice(product, countryId, scopedCountries);
  const customerPrice = displayPrice?.price ?? null;
  const equinixPrice = getProductEquinixPrice(product, displayPrice?.countryId ?? countryId);
  const showInputCableNotice = pduRequiresSeparateInputCable(product);
  const resolvedDimensions = resolveProductDimensions(product);

  const browseCategory = () => {
    setCategory(product.categoryId);
    navigate('/products');
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
        <div className="aspect-[4/3] bg-surface-muted border border-border rounded-sm flex items-center justify-center">
          <div className="text-center text-text-muted">
            <svg
              className="mx-auto mb-2 opacity-40"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <span className="text-sm font-mono">Product Image</span>
          </div>
        </div>

        <div>
          <div className="mb-3">
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

          {product.partNumber ? (
            <p className="font-mono text-sm text-text-muted mb-1 m-0">{product.partNumber}</p>
          ) : null}
          <h1 className="text-3xl font-extrabold mb-2 m-0">
            {getProductDisplayName(product, displayUnit)}
          </h1>

          <button
            type="button"
            onClick={browseCategory}
            className="text-sm text-brand-red bg-transparent border-none cursor-pointer p-0 hover:underline mb-4"
          >
            {category.name}
          </button>

          {resolvedDimensions ? (
            <div className="mb-4 p-4 bg-surface-muted border border-border rounded-sm">
              <h2 className="text-sm font-bold uppercase tracking-wide text-text-secondary mb-2 m-0">
                Dimensions
              </h2>
              <ProductDimensionsDisplay dimensions={resolvedDimensions} displayUnit={displayUnit} />
            </div>
          ) : null}

          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-text-secondary mb-2 m-0">
              Specifications
            </h2>
            <p className="text-base text-text-secondary leading-relaxed m-0">
              {formatDescriptionWithDisplayUnits(product.description, displayUnit)}
            </p>
            {showInputCableNotice ? (
              <p className="text-sm text-amber-950 bg-amber-50 border border-amber-200 rounded-sm px-3 py-2 mt-3 m-0">
                This PDU is sold without an upstream input cable. Order a compatible input cable
                separately if required for your deployment.
              </p>
            ) : null}
          </div>

          {product.purpose ? (
            <div className="mb-6">
              <h2 className="text-sm font-bold uppercase tracking-wide text-text-secondary mb-2 m-0">
                Purpose
              </h2>
              <p className="text-base text-text-secondary leading-relaxed m-0">{product.purpose}</p>
            </div>
          ) : null}

          <p className="text-3xl font-extrabold m-0 mb-1">
            {customerPrice != null ? formatPrice(customerPrice, countryId) : 'Pricing unavailable'}
          </p>
          {displayPrice && displayPrice.countryId !== countryId ? (
            <p className="text-sm text-text-muted mb-1 m-0">
              Priced for {getCountryName(displayPrice.countryId)}
            </p>
          ) : null}
          {equinixPrice != null && customerPrice != null && equinixPrice !== customerPrice ? (
            <p className="text-sm text-text-muted mb-6 m-0">
              Equinix price: {formatPrice(equinixPrice, countryId)}
            </p>
          ) : null}

          <div className="flex flex-wrap items-stretch gap-3 mb-8">
            <AddToCartControls product={product} layout="inline" />
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm border-t border-border pt-6 m-0">
            <div>
              <dt className="font-semibold text-text-secondary mb-1">Brand</dt>
              <dd className="m-0 text-text-muted">{product.brand ?? '—'}</dd>
            </div>
            <div>
              <dt className="font-semibold text-text-secondary mb-1">Part number</dt>
              <dd className="m-0 font-mono text-text-muted">{product.partNumber ?? '—'}</dd>
            </div>
            <div>
              <dt className="font-semibold text-text-secondary mb-1">Regions</dt>
              <dd className="m-0 text-text-muted">{product.regions.join(', ')}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-semibold text-text-secondary mb-1">Countries</dt>
              <dd className="m-0 text-text-muted">
                {productCountries.map(getCountryName).join(', ')}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section>
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-bold m-0">Related products</h2>
            <Link
              to="/products"
              onClick={() => setCategory(product.categoryId)}
              className="text-sm text-brand-red no-underline hover:underline"
            >
              View all in {category.name}
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
