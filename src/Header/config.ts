import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      localized: true,
      maxRows: 12,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
      fields: [
        // Top-level link (required)
        link({ appearances: false }),

        // Optional sub-navigation items (dropdown)
        {
          name: 'subItems',
          type: 'array',
          label: 'Dropdown sub-items',
          maxRows: 12,
          admin: {
            initCollapsed: true,
            description: 'Add sub-links to create a dropdown menu for this nav item.',
            components: {
              RowLabel: '@/Header/SubRowLabel#SubRowLabel',
            },
          },
          fields: [
            link({ appearances: false }),
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}
