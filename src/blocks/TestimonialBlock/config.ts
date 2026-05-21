import type { Block } from 'payload'

export const TestimonialBlock: Block = {
  slug: 'testimonial',
  interfaceName: 'TestimonialBlock',
  fields: [
    {
      name: 'quote',
      type: 'textarea',
      required: true,
      label: 'Quote',
      maxLength: 500,
    },
    {
      name: 'author',
      type: 'text',
      required: true,
      label: 'Author Name',
    },
    {
      name: 'role',
      type: 'text',
      label: 'Author Role',
    },
    {
      name: 'company',
      type: 'text',
      label: 'Company',
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      label: 'Author Avatar',
    },
    {
      name: 'rating',
      type: 'select',
      options: [
        { label: '1 Star', value: '1' },
        { label: '2 Stars', value: '2' },
        { label: '3 Stars', value: '3' },
        { label: '4 Stars', value: '4' },
        { label: '5 Stars', value: '5' },
      ],
      defaultValue: '5',
      label: 'Rating',
    },
    {
      name: 'layout',
      type: 'select',
      options: [
        { label: 'Centered', value: 'centered' },
        { label: 'Left Aligned', value: 'left' },
        { label: 'Card Style', value: 'card' },
      ],
      defaultValue: 'centered',
      label: 'Layout Style',
    },
  ],
  labels: {
    singular: 'Testimonial',
    plural: 'Testimonials',
  },
}