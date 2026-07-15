import { lazy, Suspense } from 'react';
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { CatalogProvider, useCatalog } from './context/CatalogContext';
import { CartProvider } from './context/CartContext';
import { Layout } from './components/layout/Layout';
import { HomeLandingPage } from './pages/HomeLandingPage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { RequestQuotePage } from './pages/RequestQuotePage';
import { MyQuotesPage } from './pages/MyQuotesPage';
import { getProductById } from './data/products';
import type { CategoryId } from './types';
import type { ProductSubCategoryId } from './types/productSubcategories';
import { getProductSubCategory } from './utils/productSubcategories';
import { getProductDisplayName } from './utils/productDisplayName';

const ExcelDataPage = lazy(() =>
  import('./pages/ExcelDataPage').then((module) => ({ default: module.ExcelDataPage })),
);

function CatalogLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { filters, setSearch, setCategory, displayUnit } = useCatalog();

  const productId = location.pathname.startsWith('/products/')
    ? location.pathname.replace('/products/', '')
    : null;
  const product = productId ? getProductById(productId) : undefined;
  const isCartPage = location.pathname === '/cart';
  const isRequestQuotePage = location.pathname === '/request-quote';
  const isMyQuotesPage = location.pathname === '/my-quotes';
  const isLandingPage = location.pathname === '/';

  const handleCategoryNavigate = (
    categoryId: CategoryId | null,
    subCategoryId: ProductSubCategoryId | null = null,
    destination?: 'home' | 'catalog',
  ) => {
    setCategory(categoryId, subCategoryId);

    if (destination === 'home') {
      navigate('/');
      return;
    }

    if (destination === 'catalog' || categoryId !== null || subCategoryId !== null) {
      if (location.pathname !== '/products') {
        navigate('/products');
      }
      return;
    }

    navigate('/');
  };

  const breadcrumbSubCategory = product
    ? getProductSubCategory(product)
    : filters.subCategoryId;

  return (
    <Layout
      search={filters.search}
      onSearchChange={setSearch}
      categoryId={
        isLandingPage ? null : product?.categoryId ?? filters.categoryId
      }
      subCategoryId={isLandingPage ? null : breadcrumbSubCategory}
      pageLabel={
        isCartPage
          ? 'Cart'
          : isRequestQuotePage
            ? 'Request Quote'
            : isMyQuotesPage
              ? 'My Quotes'
              : undefined
      }
      pathname={location.pathname}
      productName={product ? getProductDisplayName(product, displayUnit) : undefined}
      onCategorySelect={handleCategoryNavigate}
    >
      <Outlet />
    </Layout>
  );
}

function PageLoader() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center text-text-muted">
      Loading…
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: '/excel',
    element: (
      <Suspense fallback={<PageLoader />}>
        <ExcelDataPage />
      </Suspense>
    ),
  },
  {
    element: (
      <CatalogProvider>
        <CartProvider>
          <CatalogLayout />
        </CartProvider>
      </CatalogProvider>
    ),
    children: [
      { path: '/', element: <HomeLandingPage /> },
      { path: '/products', element: <CatalogPage /> },
      { path: '/cart', element: <CartPage /> },
      { path: '/request-quote', element: <RequestQuotePage /> },
      { path: '/my-quotes', element: <MyQuotesPage /> },
      { path: '/products/:productId', element: <ProductDetailPage /> },
    ],
  },
], {
  basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/',
});

function App() {
  return <RouterProvider router={router} />;
}

export default App;
