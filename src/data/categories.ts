import type { Category, CategoryId } from '../types';
import { getInstallationLineItemCount } from './installationCosts';
import { getCategoryProductCounts } from './products';

const categoryCounts = getCategoryProductCounts();

export const productCategories: Category[] = [
  {
    id: 'cabinet-accessories',
    name: 'Cabinet Accessories',
    description:
      'Racks, panels, cable management, and mounting hardware for data center cabinets.',
    itemCount: categoryCounts['cabinet-accessories'] ?? 0,
  },
  {
    id: 'power-accessories',
    name: 'Power Accessories',
    description:
      'PDUs, power strips, UPS modules, and electrical distribution components.',
    itemCount: categoryCounts['power-accessories'] ?? 0,
  },
  {
    id: 'cross-connect-accessories',
    name: 'Cross Connect Accessories',
    description:
      'Patch panels, fiber cassettes, copper modules, and cross-connect cabling.',
    itemCount: categoryCounts['cross-connect-accessories'] ?? 0,
  },
  {
    id: 'cage-accessories',
    name: 'Cage Accessories',
    description:
      'Security cages, door hardware, access control, and containment solutions.',
    itemCount: categoryCounts['cage-accessories'] ?? 0,
  },
];

export const installationCostsCategory: Category = {
  id: 'installation-costs',
  name: 'Installation Costs',
  description:
    'Professional installation, commissioning, and deployment service packages.',
  itemCount: getInstallationLineItemCount(),
};

/** Accessory categories shown under Products in the red nav. */
export const categories = productCategories;

export const categoryMap = Object.fromEntries(
  [...productCategories, installationCostsCategory].map((c) => [c.id, c]),
) as Record<CategoryId, Category>;

export type NavSection = 'home' | 'products' | 'installation-costs';

export function getNavSection(categoryId: CategoryId | null, pathname = '/'): NavSection {
  if (pathname === '/') return 'home';
  if (categoryId === 'installation-costs') return 'installation-costs';
  if (categoryId || pathname.startsWith('/products')) return 'products';
  return 'home';
}

export function isProductCategory(categoryId: CategoryId | null): categoryId is CategoryId {
  return categoryId != null && categoryId !== 'installation-costs';
}
