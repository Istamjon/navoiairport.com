import type { Block } from 'payload'

export const FAQ: Block = {
  slug: 'faq',
  interfaceName: 'FAQBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      maxLength: 500,
    },
    {
      name: 'questions',
      type: 'array',
      minRows: 1,
      fields: [
        {
          name: 'question',
          type: 'text',
          required: true,
          label: 'Question',
          maxLength: 300,
        },
        {
          name: 'answer',
          type: 'textarea',
          required: true,
          label: 'Answer',
          maxLength: 2000,
        },
        {
          name: 'defaultOpen',
          type: 'checkbox',
          defaultValue: false,
          label: 'Open by default',
        },
      ],
      label: 'Questions',
    },
  ],
  labels: {
    singular: 'FAQ',
    plural: 'FAQs',
  },
}
