import type { Block } from 'payload'
import { link } from '../../fields/link'

export const InfoCards: Block = {
  slug: 'infoCards',
  interfaceName: 'InfoCardsBlock',
  labels: {
    singular: {
      en: 'Information Cards',
      ru: 'Информационные Карточки',
      uz: 'Maʼlumot Kartalari',
    },
    plural: {
      en: 'Information Cards',
      ru: 'Информационные Карточки',
      uz: 'Maʼlumot Kartalari',
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'subtitle',
      type: 'text',
      localized: true,
    },
    {
      name: 'cards',
      type: 'array',
      minRows: 1,
      maxRows: 16,
      localized: true,
      fields: [
        {
          name: 'cardTitle',
          type: 'text',
          required: true,
        },
        {
          name: 'cardDescription',
          type: 'text',
          required: true,
        },
        {
          name: 'cardImage',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        link({
          disableLabel: true,
          appearances: false,
          overrides: {
            admin: {
              description: 'Clickable link for the entire card',
            },
          },
        }),
        {
          name: 'style',
          type: 'select',
          defaultValue: 'default',
          options: [
            { label: 'Default (Light Gray)', value: 'default' },
            { label: 'Highlight (Dark Blue)', value: 'highlight' },
          ],
        },
      ],
    },
  ],
}
