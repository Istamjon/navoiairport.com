import type { Block } from 'payload'

export const Carousel: Block = {
  slug: 'carousel',
  interfaceName: 'CarouselBlock',
  labels: {
    singular: 'Carousel',
    plural: 'Carousels',
  },
  fields: [
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Background Image',
      admin: {
        description: 'Optional background image for the carousel section',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'mainHeading',
          type: 'text',
          required: true,
          localized: true,
          admin: {
            width: '50%',
          },
        },
        {
          name: 'subtitle',
          type: 'textarea',
          localized: true,
          admin: {
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'cards',
      type: 'array',
      label: 'Carousel Cards',
      minRows: 1,
      maxRows: 12,
      labels: {
        singular: 'Card',
        plural: 'Cards',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'title',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'subtitle',
          type: 'textarea',
          localized: true,
        },
        {
          name: 'buttonText',
          type: 'text',
          localized: true,
          defaultValue: 'Batafsil',
        },
        {
          name: 'buttonLink',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'allServicesButton',
      type: 'group',
      label: 'All Services Button',
      fields: [
        {
          name: 'text',
          type: 'text',
          localized: true,
          defaultValue: 'Barcha xizmatlar',
        },
        {
          name: 'link',
          type: 'text',
        },
      ],
    },
    {
      name: 'settings',
      type: 'group',
      label: 'Carousel Settings',
      fields: [
        {
          name: 'autoplay',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'autoplayDelay',
          type: 'number',
          defaultValue: 5000,
          admin: {
            description: 'Delay in milliseconds',
            condition: (data) => data.settings?.autoplay === true,
          },
        },
        {
          name: 'showDots',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'showNavigation',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
  ],
}
