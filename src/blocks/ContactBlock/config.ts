import type { Block } from 'payload'

export const ContactBlock: Block = {
  slug: 'contact',
  interfaceName: 'ContactBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
    },
    {
      name: 'subtitle',
      type: 'text',
      label: 'Subtitle',
    },
    {
      name: 'contactInfo',
      type: 'array',
      fields: [
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Email', value: 'email' },
            { label: 'Phone', value: 'phone' },
            { label: 'Address', value: 'address' },
            { label: 'Social Media', value: 'social' },
          ],
          required: true,
          label: 'Contact Type',
        },
        {
          name: 'label',
          type: 'text',
          required: true,
          label: 'Label',
        },
        {
          name: 'value',
          type: 'text',
          required: true,
          label: 'Value',
        },
        {
          name: 'icon',
          type: 'text',
          label: 'Icon (optional)',
        },
        {
          name: 'link',
          type: 'text',
          label: 'Link (for social media)',
        },
      ],
      label: 'Contact Information',
    },
    {
      name: 'formFields',
      type: 'array',
      fields: [
        {
          name: 'fieldType',
          type: 'select',
          options: [
            { label: 'Text Input', value: 'text' },
            { label: 'Email', value: 'email' },
            { label: 'Textarea', value: 'textarea' },
            { label: 'Select', value: 'select' },
            { label: 'Checkbox', value: 'checkbox' },
          ],
          required: true,
          label: 'Field Type',
        },
        {
          name: 'label',
          type: 'text',
          required: true,
          label: 'Field Label',
        },
        {
          name: 'name',
          type: 'text',
          required: true,
          label: 'Field Name',
        },
        {
          name: 'placeholder',
          type: 'text',
          label: 'Placeholder',
        },
        {
          name: 'required',
          type: 'checkbox',
          defaultValue: false,
          label: 'Required',
        },
      ],
      label: 'Form Fields',
    },
    {
      name: 'showMap',
      type: 'checkbox',
      defaultValue: false,
      label: 'Show Map',
    },
    {
      name: 'mapEmbedCode',
      type: 'textarea',
      label: 'Map Embed Code',
      admin: {
        condition: (_, { showMap }) => Boolean(showMap),
      },
    },
    {
      name: 'layout',
      type: 'select',
      options: [
        { label: 'Split Layout', value: 'split' },
        { label: 'Form First', value: 'form-first' },
        { label: 'Info First', value: 'info-first' },
      ],
      defaultValue: 'split',
      label: 'Layout Style',
    },
  ],
  labels: {
    singular: 'Contact',
    plural: 'Contacts',
  },
}