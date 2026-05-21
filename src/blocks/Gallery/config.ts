import type { Block } from 'payload'

export const Gallery: Block = {
  slug: 'gallery',
  interfaceName: 'GalleryBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Gallery Title',
    },
    {
      name: 'subtitle',
      type: 'text',
      label: 'Gallery Subtitle',
    },
    {
      name: 'images',
      type: 'array',
      minRows: 1,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Image',
        },
        {
          name: 'caption',
          type: 'text',
          label: 'Caption',
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Description',
          maxLength: 200,
        },
      ],
      label: 'Gallery Images',
    },
    {
      name: 'layout',
      type: 'select',
      options: [
        { label: 'Grid', value: 'grid' },
        { label: 'Masonry', value: 'masonry' },
        { label: 'Slider', value: 'slider' },
      ],
      defaultValue: 'grid',
      label: 'Layout Style',
    },
    {
      name: 'columns',
      type: 'select',
      options: [
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
        { label: '4 Columns', value: '4' },
        { label: '5 Columns', value: '5' },
      ],
      defaultValue: '3',
      admin: {
        condition: (_, { layout }) => layout === 'grid' || layout === 'masonry',
      },
      label: 'Number of Columns',
    },
    {
      name: 'enableLightbox',
      type: 'checkbox',
      defaultValue: true,
      label: 'Enable Lightbox',
    },
    {
      name: 'showCaptions',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show Captions',
    },
  ],
  labels: {
    singular: 'Gallery',
    plural: 'Galleries',
  },
}