import { MainHeader } from './MainHeader';
import { MegaNav } from './MegaNav';
import { Breadcrumbs } from './Breadcrumbs';
import { SiteFooter } from './SiteFooter';
import { CartAddedToast } from '../cart/CartAddedToast';
import type { CategoryId } from '../../types';
import type { ProductSubCategoryId } from '../../types/productSubcategories';

interface LayoutProps {
  children: React.ReactNode;
  search: string;
  onSearchChange: (value: string) => void;
  categoryId: CategoryId | null;
  subCategoryId: ProductSubCategoryId | null;
  pathname: string;
  pageLabel?: string;
  productName?: string;
  onCategorySelect: (
    categoryId: CategoryId | null,
    subCategoryId?: ProductSubCategoryId | null,
    destination?: 'home' | 'catalog',
  ) => void;
}

export function Layout({
  children,
  search,
  onSearchChange,
  categoryId,
  subCategoryId,
  pathname,
  pageLabel,
  productName,
  onCategorySelect,
}: LayoutProps) {
  const isLandingPage = pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-page text-text">
      <MainHeader search={search} onSearchChange={onSearchChange} />
      <MegaNav
        activeCategory={categoryId}
        activeSubCategory={subCategoryId}
        pathname={pathname}
        onCategorySelect={onCategorySelect}
      />
      {!isLandingPage ? (
        <Breadcrumbs
          categoryId={categoryId}
          subCategoryId={subCategoryId}
          pageLabel={pageLabel}
          productName={productName}
          onNavigate={onCategorySelect}
        />
      ) : null}
      {children}
      <CartAddedToast />
      <SiteFooter />
    </div>
  );
}
