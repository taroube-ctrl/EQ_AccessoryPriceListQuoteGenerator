import { useRef, useState } from 'react';
import clsx from 'clsx';
import { getNavSection, productCategories } from '../../data/categories';
import { cageSubCategories } from '../../data/cageSubcategories';
import { crossConnectSubCategories } from '../../data/crossConnectSubcategories';
import { powerSubCategories } from '../../data/powerSubcategories';
import type { Category, CategoryId } from '../../types';
import type { ProductSubCategoryId } from '../../types/productSubcategories';
import { isCageSubCategoryId } from '../../utils/cageSubcategories';
import { isCrossConnectSubCategoryId } from '../../utils/crossConnectSubcategories';
import { isPowerSubCategoryId } from '../../utils/powerSubcategories';

interface MegaNavProps {
  activeCategory: CategoryId | null;
  activeSubCategory: ProductSubCategoryId | null;
  pathname?: string;
  onCategorySelect: (
    categoryId: CategoryId | null,
    subCategoryId?: ProductSubCategoryId | null,
    destination?: 'home' | 'catalog',
  ) => void;
}

type ExpandableCategoryId =
  | 'cross-connect-accessories'
  | 'cage-accessories'
  | 'power-accessories';

interface SubCategoryGroup {
  id: ProductSubCategoryId;
  name: string;
  description?: string;
  children?: SubCategoryGroup[];
}

interface ExpandableCategoryConfig {
  categoryId: ExpandableCategoryId;
  allId: ProductSubCategoryId;
  allLabel: string;
  groups: SubCategoryGroup[];
  isActiveSubCategory: (subCategoryId: ProductSubCategoryId | null) => boolean;
}

const expandableCategories: ExpandableCategoryConfig[] = [
  {
    categoryId: 'cross-connect-accessories',
    allId: 'cross-connect-all',
    allLabel: 'All Cross Connect Accessories',
    groups: crossConnectSubCategories,
    isActiveSubCategory: (subCategoryId) => isCrossConnectSubCategoryId(subCategoryId),
  },
  {
    categoryId: 'cage-accessories',
    allId: 'cage-all',
    allLabel: 'All Cage Accessories',
    groups: cageSubCategories,
    isActiveSubCategory: (subCategoryId) => isCageSubCategoryId(subCategoryId),
  },
  {
    categoryId: 'power-accessories',
    allId: 'power-all',
    allLabel: 'All Power Accessories',
    groups: powerSubCategories,
    isActiveSubCategory: (subCategoryId) => isPowerSubCategoryId(subCategoryId),
  },
];

const expandableCategoryMap = Object.fromEntries(
  expandableCategories.map((config) => [config.categoryId, config]),
) as Record<ExpandableCategoryId, ExpandableCategoryConfig>;

function navButtonClass(active: boolean) {
  return clsx(
    'px-5 py-3.5 text-sm font-semibold border-none bg-transparent text-white cursor-pointer relative hover:bg-brand-red-hover transition-colors whitespace-nowrap',
    'after:absolute after:bottom-0 after:left-4 after:right-4 after:h-0.5 after:bg-white after:scale-x-0 after:transition-transform',
    active && 'after:scale-x-100',
  );
}

function subCategoryButtonClass(active: boolean, nested = false) {
  return clsx(
    'w-full text-left border-none bg-transparent cursor-pointer hover:bg-accent-subtle transition-colors',
    nested ? 'px-8 py-2' : 'px-5 py-2.5',
    active && 'bg-accent-subtle',
  );
}

export function MegaNav({
  activeCategory,
  activeSubCategory,
  pathname = '/',
  onCategorySelect,
}: MegaNavProps) {
  const [productsOpen, setProductsOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<ExpandableCategoryId | null>(null);
  const closeTimer = useRef<number | null>(null);
  const activeSection = getNavSection(activeCategory, pathname);

  const handleEnter = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setProductsOpen(true);
  };

  const handleLeave = () => {
    closeTimer.current = window.setTimeout(() => {
      setProductsOpen(false);
      setExpandedCategory(null);
    }, 150);
  };

  const selectCategory = (
    categoryId: CategoryId | null,
    subCategoryId: ProductSubCategoryId | null = null,
    destination: 'home' | 'catalog' = 'catalog',
  ) => {
    onCategorySelect(categoryId, subCategoryId, destination);
    setProductsOpen(false);
    setExpandedCategory(null);
  };

  const renderExpandableCategory = (category: Category, config: ExpandableCategoryConfig) => {
    const isCategoryActive = activeCategory === config.categoryId;
    const isExpanded = expandedCategory === config.categoryId;
    const activeSubForCategory = isCategoryActive && config.isActiveSubCategory(activeSubCategory);

    return (
      <li key={category.id}>
        <button
          type="button"
          onClick={() =>
            setExpandedCategory((current) =>
              current === config.categoryId ? null : config.categoryId,
            )
          }
          className={clsx(
            'w-full text-left px-5 py-3 border-none bg-transparent cursor-pointer hover:bg-accent-subtle transition-colors flex items-start justify-between gap-3',
            isCategoryActive && 'bg-accent-subtle',
          )}
        >
          <span>
            <span
              className={clsx(
                'block text-sm font-semibold',
                isCategoryActive ? 'text-brand-red' : 'text-text',
              )}
            >
              {category.name}
            </span>
            <span className="block text-xs text-text-muted mt-0.5 leading-snug">
              {category.description}
            </span>
            <span className="block font-mono text-[10px] text-brand-red mt-1">
              {category.itemCount} products
            </span>
          </span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={clsx('shrink-0 mt-1 transition-transform', isExpanded && 'rotate-180')}
            aria-hidden="true"
          >
            <path d="M2 4l4 4 4-4" />
          </svg>
        </button>

        {isExpanded && (
          <ul className="list-none m-0 p-0 pb-2 border-t border-border bg-accent-subtle/40">
            <li>
              <button
                type="button"
                onClick={() => selectCategory(config.categoryId, config.allId)}
                className={subCategoryButtonClass(
                  isCategoryActive &&
                    (!activeSubCategory || activeSubCategory === config.allId),
                )}
              >
                <span className="block text-sm font-semibold text-text">{config.allLabel}</span>
              </button>
            </li>

            {config.groups.map((group) => (
              <li key={group.id}>
                <button
                  type="button"
                  onClick={() => selectCategory(config.categoryId, group.id)}
                  className={subCategoryButtonClass(
                    isCategoryActive && activeSubForCategory && activeSubCategory === group.id,
                  )}
                >
                  <span className="block text-sm font-semibold text-text">{group.name}</span>
                  {group.description ? (
                    <span className="block text-xs text-text-muted mt-0.5">{group.description}</span>
                  ) : null}
                </button>

                {group.children?.map((child) => (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => selectCategory(config.categoryId, child.id)}
                    className={subCategoryButtonClass(
                      isCategoryActive && activeSubForCategory && activeSubCategory === child.id,
                      true,
                    )}
                  >
                    <span className="block text-sm text-text">{child.name}</span>
                    {child.description ? (
                      <span className="block text-xs text-text-muted mt-0.5">{child.description}</span>
                    ) : null}
                  </button>
                ))}
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <nav className="bg-brand-red text-white">
      <div className="max-w-[1440px] mx-auto px-6 flex">
        <button
          type="button"
          onClick={() => selectCategory(null, null, 'home')}
          className={navButtonClass(activeSection === 'home')}
        >
          Home
        </button>

        <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
          <button
            type="button"
            onClick={() => selectCategory(null, null, 'catalog')}
            aria-expanded={productsOpen}
            aria-haspopup="true"
            className={clsx(
              navButtonClass(activeSection === 'products' || productsOpen),
              'inline-flex items-center gap-1.5',
            )}
          >
            Products
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={clsx('transition-transform', productsOpen && 'rotate-180')}
              aria-hidden="true"
            >
              <path d="M2 4l4 4 4-4" />
            </svg>
          </button>

          {productsOpen && (
            <div className="absolute left-0 top-full z-50 min-w-[360px] bg-surface text-text shadow-xl border border-border rounded-b-sm py-2">
              <ul className="list-none m-0 p-0">
                {productCategories.map((category) => {
                  const config = expandableCategoryMap[category.id as ExpandableCategoryId];
                  if (config) {
                    return renderExpandableCategory(category, config);
                  }

                  return (
                    <li key={category.id}>
                      <button
                        type="button"
                        onClick={() => selectCategory(category.id)}
                        className={clsx(
                          'w-full text-left px-5 py-3 border-none bg-transparent cursor-pointer hover:bg-accent-subtle transition-colors',
                          activeCategory === category.id && 'bg-accent-subtle',
                        )}
                      >
                        <span
                          className={clsx(
                            'block text-sm font-semibold',
                            activeCategory === category.id ? 'text-brand-red' : 'text-text',
                          )}
                        >
                          {category.name}
                        </span>
                        <span className="block text-xs text-text-muted mt-0.5 leading-snug">
                          {category.description}
                        </span>
                        <span className="block font-mono text-[10px] text-brand-red mt-1">
                          {category.itemCount} products
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => selectCategory('installation-costs')}
          className={navButtonClass(activeSection === 'installation-costs')}
        >
          Installation Costs
        </button>
      </div>
    </nav>
  );
}
