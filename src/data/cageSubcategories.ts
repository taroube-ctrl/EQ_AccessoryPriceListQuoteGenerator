import type { CageSubCategory } from '../types/cageSubcategories';

export const cageSubCategories: CageSubCategory[] = [
  {
    id: 'basket-trays',
    name: 'Basket Trays',
    description: 'Overhead copper cable basket pathways, exits, and accessories.',
  },
  {
    id: 'fiber-trays',
    name: 'Fiber Trays',
    description: 'Overhead fiber pathways, sized runs, and vertical drop exits.',
  },
  {
    id: 'copper-trays',
    name: 'Copper Trays',
    description: 'Overhead copper tray sections for structured cable routing.',
  },
  {
    id: 'structured-cabling',
    name: 'Structured Cabling',
    description: 'Patch panels, fiber modules, copper modules, and cabling.',
    children: [
      {
        id: 'structured-copper',
        name: 'Copper',
        description: 'Copper modules and cable packs for twisted-pair handoffs.',
      },
      {
        id: 'structured-fiber',
        name: 'Fiber',
        description: 'Fiber modules, trunks, and MPO cable assemblies.',
      },
      {
        id: 'structured-panels',
        name: 'Panels',
        description: '1RU and 3RU structured cabling panels.',
      },
      {
        id: 'structured-services',
        name: 'Installation Services',
        description: 'Site survey, deployment, and testing services.',
      },
    ],
  },
];

export const cageSubCategoryMap = Object.fromEntries(
  [
    { id: 'cage-all', name: 'All Cage Accessories' },
    ...cageSubCategories,
    ...cageSubCategories.flatMap((group) => group.children ?? []),
  ].map((item) => [item.id, item]),
) as Record<
  import('../types/cageSubcategories').CageSubCategoryId,
  { id: string; name: string; description?: string }
>;
