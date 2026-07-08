import { Link } from 'react-router-dom';
import { categoryMap } from '../../data/categories';
import type { CategoryId } from '../../types';
import type { ProductSubCategoryId } from '../../types/productSubcategories';
import { getProductSubCategoryName } from '../../utils/productSubcategories';

interface BreadcrumbsProps {
  categoryId: CategoryId | null;
  subCategoryId: ProductSubCategoryId | null;
  pageLabel?: string;
  productName?: string;
  onNavigate: (
    categoryId: CategoryId | null,
    subCategoryId?: ProductSubCategoryId | null,
  ) => void;
}

export function Breadcrumbs({
  categoryId,
  subCategoryId,
  pageLabel,
  productName,
  onNavigate,
}: BreadcrumbsProps) {
  if (pageLabel) {
    return (
      <div className="bg-surface-muted border-b border-border">
        <div className="max-w-[1440px] mx-auto px-6 py-2.5 flex items-center gap-2 text-sm">
          <Link to="/" className="text-brand-red no-underline hover:underline">
            Home
          </Link>
          <span className="text-text-muted">/</span>
          <span className="text-text-secondary font-medium">{pageLabel}</span>
        </div>
      </div>
    );
  }

  const crumbs: {
    label: string;
    to?: string;
    categoryId?: CategoryId | null;
    subCategoryId?: ProductSubCategoryId | null;
    current?: boolean;
  }[] = [
    { label: 'Home', to: '/' },
    categoryId || productName
      ? { label: 'Products', to: '/products' }
      : { label: 'Products', current: true },
  ];

  if (categoryId) {
    crumbs.push({ label: categoryMap[categoryId].name, categoryId });

    const subCategoryName = getProductSubCategoryName(categoryId, subCategoryId);
    if (subCategoryName) {
      crumbs.push({
        label: subCategoryName,
        categoryId,
        subCategoryId,
      });
    }
  }

  if (productName) {
    crumbs.push({
      label: productName,
      categoryId,
      subCategoryId,
      current: true,
    });
  }

  return (
    <div className="bg-surface-muted border-b border-border">
      <div className="max-w-[1440px] mx-auto px-6 py-2.5 flex items-center gap-2 text-sm">
        {crumbs.map((crumb, i) => (
          <span key={`${crumb.label}-${i}`} className="flex items-center gap-2">
            {i > 0 && <span className="text-text-muted">/</span>}
            {crumb.current || i === crumbs.length - 1 ? (
              <span className="text-text-secondary font-medium">{crumb.label}</span>
            ) : crumb.to ? (
              <Link to={crumb.to} className="text-brand-red no-underline hover:underline">
                {crumb.label}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate(crumb.categoryId ?? null, crumb.subCategoryId ?? null)}
                className="text-brand-red bg-transparent border-none cursor-pointer p-0 text-sm hover:underline"
              >
                {crumb.label}
              </button>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
