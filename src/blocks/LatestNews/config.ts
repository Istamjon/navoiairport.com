import type { Block } from 'payload'

export const LatestNews: Block = {
  slug: 'latestNews',
  interfaceName: 'LatestNewsBlock',
  labels: {
    singular: 'Latest News',
    plural: 'Latest News',
  },
  fields: [
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
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      admin: {
        description: 'Select category to filter posts',
      },
    },
    {
      name: 'postsLimit',
      type: 'number',
      defaultValue: 8,
      min: 1,
      max: 20,
      admin: {
        description: 'Maximum number of posts to display',
      },
    },
    {
      name: 'readMoreText',
      type: 'text',
      localized: true,
      defaultValue: 'Read More',
      admin: {
        description: 'Text for "Read More" link on each card',
      },
    },
    {
      name: 'allNewsButton',
      type: 'group',
      fields: [
        {
          name: 'text',
          type: 'text',
          localized: true,
          defaultValue: 'Barcha yangiliklar',
        },
        {
          name: 'link',
          type: 'text',
          defaultValue: '/news',
        },
      ],
    },
    {
      name: 'settings',
      type: 'group',
      fields: [
        {
          name: 'showNavigation',
          type: 'checkbox',
          defaultValue: true,
          label: 'Show Navigation Arrows',
        },
        {
          name: 'showDots',
          type: 'checkbox',
          defaultValue: true,
          label: 'Show Dots Indicator',
        },
        {
          name: 'autoplay',
          type: 'checkbox',
          defaultValue: true,
          label: 'Enable Autoplay',
        },
        {
          name: 'autoplayDelay',
          type: 'number',
          defaultValue: 5000,
          min: 1000,
          admin: {
            condition: (data) => data.settings?.autoplay === true,
            description: 'Delay in milliseconds',
          },
        },
      ],
    },
  ],
}
