import type { CrossConnectSubCategory } from '../types/crossConnectSubcategories';

export const crossConnectSubCategories: CrossConnectSubCategory[] = [
  {
    id: 'ethernet-media-converters',
    name: 'Ethernet Media Converters',
    description: 'Copper Ethernet to fiber conversion for 10/100/1000 traffic.',
    children: [
      {
        id: 'ethernet-singlemode',
        name: 'Singlemode',
        description: 'Long-reach SM fiber handoffs, including 1000Base-LX.',
      },
      {
        id: 'ethernet-multimode',
        name: 'Multimode',
        description: 'Short-reach MM fiber handoffs, including 1000Base-SX.',
      },
    ],
  },
  {
    id: 'telecom-media-converters',
    name: 'Telecom Media Converters',
    description: 'Legacy circuit conversion to fiber for cross-connect handoffs.',
    children: [
      {
        id: 'telecom-t1-e1',
        name: 'T1/E1',
        description: 'RJ48 telecom interfaces converted to fiber.',
      },
      {
        id: 'telecom-ds3-e3',
        name: 'DS3/E3',
        description: 'Coax DS3/E3 interfaces converted to fiber.',
      },
    ],
  },
];

export const crossConnectSubCategoryMap = Object.fromEntries(
  [
    { id: 'cross-connect-all', name: 'All Cross Connect Accessories' },
    ...crossConnectSubCategories,
    ...crossConnectSubCategories.flatMap((group) => group.children ?? []),
  ].map((item) => [item.id, item]),
) as Record<
  import('../types/crossConnectSubcategories').CrossConnectSubCategoryId,
  { id: string; name: string; description?: string }
>;
