import { Link, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import {
  categories,
  installationCostsCategory,
  productCategories,
} from '../data/categories';
import { useCatalog } from '../context/CatalogContext';
import type { CategoryId } from '../types';

interface GuideCard {
  eyebrow: string;
  title: string;
  description: string;
  action: string;
  to?: string;
  onClick?: () => void;
}

interface ResourceCard {
  title: string;
  description: string;
  action: string;
  to: string;
  external?: boolean;
}

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-extrabold m-0 text-text">{title}</h2>
      {subtitle ? <p className="text-sm text-text-muted mt-2 mb-0 m-0">{subtitle}</p> : null}
    </div>
  );
}

function GuideCardTile({ card }: { card: GuideCard }) {
  return (
    <article className="h-full flex flex-col text-left rounded-sm border border-border bg-surface p-5">
      <p className="text-[11px] font-bold uppercase tracking-wide text-brand-red m-0">{card.eyebrow}</p>
      <h3 className="text-lg font-bold mt-2 mb-2 m-0 text-text">{card.title}</h3>
      <p className="text-sm text-text-muted leading-relaxed m-0 flex-1">{card.description}</p>
    </article>
  );
}

function ProductCategoryTile({
  name,
  description,
  itemCount,
  onBrowse,
}: {
  name: string;
  description: string;
  itemCount: number;
  onBrowse: () => void;
}) {
  return (
    <article className="rounded-sm border border-border bg-surface p-5 flex flex-col h-full">
      <h3 className="text-xl font-bold m-0 mb-2 text-text">{name}</h3>
      <p className="text-sm text-text-muted leading-relaxed m-0 flex-1">{description}</p>
      <p className="font-mono text-[11px] text-brand-red mt-3 mb-4 m-0">{itemCount} products</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onBrowse}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-sm border border-brand-red text-brand-red bg-transparent cursor-pointer hover:bg-accent-subtle transition-colors"
        >
          Browse catalog
        </button>
      </div>
    </article>
  );
}

function ResourceTile({ card }: { card: ResourceCard }) {
  const className = clsx(
    'block h-full no-underline rounded-sm border border-border bg-surface p-5',
    'transition-colors hover:border-brand-red/40 hover:shadow-sm',
  );

  if (card.external) {
    return (
      <a href={card.to} target="_blank" rel="noreferrer" className={className}>
        <h3 className="text-base font-bold m-0 mb-2 text-text">{card.title}</h3>
        <p className="text-sm text-text-muted leading-relaxed m-0">{card.description}</p>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-red mt-4">
          {card.action}
          <span aria-hidden>→</span>
        </span>
      </a>
    );
  }

  return (
    <Link to={card.to} className={className}>
      <h3 className="text-base font-bold m-0 mb-2 text-text">{card.title}</h3>
      <p className="text-sm text-text-muted leading-relaxed m-0">{card.description}</p>
      <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-red mt-4">
        {card.action}
        <span aria-hidden>→</span>
      </span>
    </Link>
  );
}

export function HomeLandingPage() {
  const navigate = useNavigate();
  const { countryName, regionLabel, locale, setCategory } = useCatalog();

  const goToCatalog = (categoryId: CategoryId | null = null) => {
    setCategory(categoryId);
    navigate('/products');
  };

  const guideCards: GuideCard[] = [
    {
      eyebrow: 'Catalog',
      title: 'Browse accessories',
      description:
        'Search, filter, and compare cabinet, power, cross connect, and cage accessories across AMER, APAC, and EMEA.',
      action: 'Open catalog',
      onClick: () => goToCatalog(null),
    },
    {
      eyebrow: 'Quote builder',
      title: 'Build a quote',
      description:
        'Add items to your cart from any product page and review quantities before requesting a quote.',
      action: 'View cart',
      to: '/cart',
    },
    {
      eyebrow: 'Regional pricing',
      title: 'Shop by location',
      description: `Prices are localized for ${countryName} with ${locale.currency} formatting across ${regionLabel}.`,
      action: 'Browse products',
      onClick: () => goToCatalog(null),
    },
    {
      eyebrow: 'Installation',
      title: 'Installation costs',
      description:
        'Review Smart Build labour and deployment pricing tables by region and country.',
      action: 'View pricing',
      onClick: () => goToCatalog('installation-costs'),
    },
  ];

  const resourceCards: ResourceCard[] = [
    {
      title: 'Excel price list',
      description: 'Upload or connect to the live Accessories Price List workbook for reference data.',
      action: 'Open Excel data',
      to: '/excel',
    },
    {
      title: 'Customer sign-in',
      description: 'Sign in with your Microsoft account to access saved preferences and integrations.',
      action: 'Sign in from header',
      to: '/products',
    },
    {
      title: 'Equinix documentation',
      description: 'Explore official Equinix product documentation, APIs, and platform guides.',
      action: 'Visit docs.equinix.com',
      to: 'https://docs.equinix.com/',
      external: true,
    },
    {
      title: 'Customer support',
      description: `Contact your ${regionLabel} customer support team for volume pricing, availability, and custom quotes.`,
      action: 'Contact customer support',
      to: 'https://www.equinix.com/contact-us/customer-support',
      external: true,
    },
  ];

  const allProductCategories = [...productCategories, installationCostsCategory];

  return (
    <main>
      <section className="relative border-b border-border overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/banners/02@2x.png')" }}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/20"
        />
        <div className="relative max-w-[1440px] mx-auto px-6 py-12 lg:py-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/85 m-0 mb-3">
            Equinix Smart Build
          </p>
          <h1 className="text-4xl lg:text-5xl font-extrabold m-0 mb-4 text-white max-w-4xl leading-tight">
            Accessory Price List Quote Generator
          </h1>
          <p className="text-lg text-white/90 leading-relaxed m-0 max-w-3xl">
            Browse data center accessories, compare regional pricing, and assemble quotes from the
            Equinix Accessories Price List — organized the way you expect from Equinix product
            documentation.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <button
              type="button"
              onClick={() => goToCatalog(null)}
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-sm border-none bg-brand-red text-white cursor-pointer hover:bg-brand-red-hover transition-colors"
            >
              Browse catalog
            </button>
            <Link
              to="/cart"
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-sm border border-white/80 text-white no-underline hover:bg-white/10 transition-colors"
            >
              View cart
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-6 py-10 lg:py-12">
        <SectionHeading
          title="Using this tool"
          subtitle="Get started with catalog browsing, quote building, and regional pricing."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {guideCards.map((card) => (
            <GuideCardTile key={card.title} card={card} />
          ))}
        </div>
      </section>

      <section className="bg-surface-muted border-y border-border py-10 lg:py-12">
        <div className="max-w-[1440px] mx-auto px-6">
          <SectionHeading
            title="Our products"
            subtitle="Explore accessory categories from the price list catalog."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {allProductCategories.map((category) => (
              <ProductCategoryTile
                key={category.id}
                name={category.name}
                description={category.description}
                itemCount={category.itemCount}
                onBrowse={() => goToCatalog(category.id)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-6 py-10 lg:py-12">
        <SectionHeading
          title="Resources & support"
          subtitle="Reference data, documentation, and ways to get help."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {resourceCards.map((card) => (
            <ResourceTile key={card.title} card={card} />
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="max-w-[1440px] mx-auto px-6 py-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold m-0 mb-1">Ready to build a quote?</h2>
            <p className="text-sm text-text-muted m-0">
              {categories.length} accessory categories · localized for {countryName}
            </p>
          </div>
          <button
            type="button"
            onClick={() => goToCatalog(null)}
            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-sm border-none bg-brand-red text-white cursor-pointer hover:bg-brand-red-hover transition-colors"
          >
            Open full catalog
          </button>
        </div>
      </section>
    </main>
  );
}
