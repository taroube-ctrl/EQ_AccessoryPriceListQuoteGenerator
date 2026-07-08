import type { PowerSubCategory } from '../types/powerSubcategories';

export const powerSubCategories: PowerSubCategory[] = [
  {
    id: 'rack-pdus',
    name: 'Rack PDUs (rPDU)',
    description: 'Cabinet-mounted power distribution units.',
    children: [
      {
        id: 'rpdu-basic',
        name: 'Basic',
        description: 'Standard outlet distribution without metering or switching.',
      },
      {
        id: 'rpdu-monitored',
        name: 'Monitored',
        description: 'Outlet-level or unit-level power monitoring.',
      },
      {
        id: 'rpdu-metered',
        name: 'Metered',
        description: 'Accurate branch-level power metering.',
      },
      {
        id: 'rpdu-switched',
        name: 'Switched',
        description: 'Remote outlet switching and power control.',
      },
    ],
  },
  {
    id: 'updu',
    name: 'Floor / Overhead PDUs (uPDU)',
    description: 'Under-floor or overhead branch power distribution units.',
  },
  {
    id: 'updu-input-cables',
    name: 'uPDU Input Cables',
    description: 'Upstream power cables by plug type, amperage, voltage, and length.',
  },
];

export const powerSubCategoryMap = Object.fromEntries(
  [
    { id: 'power-all', name: 'All Power Accessories' },
    ...powerSubCategories,
    ...powerSubCategories.flatMap((group) => group.children ?? []),
  ].map((item) => [item.id, item]),
) as Record<
  import('../types/powerSubcategories').PowerSubCategoryId,
  { id: string; name: string; description?: string }
>;
