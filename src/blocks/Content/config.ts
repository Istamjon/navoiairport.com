import type { Block, Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
  BlockquoteFeature,
  ChecklistFeature,
  LinkFeature,
  OrderedListFeature,
  UnorderedListFeature,
  AlignFeature,
  UploadFeature,
  HTMLConverterFeature,
  HorizontalRuleFeature,
} from '@payloadcms/richtext-lexical'

import { link } from '@/fields/link'

const columnFields: Field[] = [
  {
    name: 'size',
    type: 'select',
    defaultValue: 'oneThird',
    options: [
      {
        label: 'One Third',
        value: 'oneThird',
      },
      {
        label: 'Half',
        value: 'half',
      },
      {
        label: 'Two Thirds',
        value: 'twoThirds',
      },
      {
        label: 'Full',
        value: 'full',
      },
    ],
  },
  {
    name: 'richText',
    type: 'richText',
    editor: lexicalEditor({
      features: ({ rootFeatures }) => {
        return [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
          BlockquoteFeature(),
          ChecklistFeature(),
          LinkFeature({
            enabledCollections: ['pages', 'posts'],
          }),
          OrderedListFeature(),
          UnorderedListFeature(),
          AlignFeature(),
          UploadFeature({
            collections: {
              media: {
                fields: [
                  {
                    name: 'alt',
                    type: 'text',
                  },
                  {
                    name: 'caption',
                    type: 'richText',
                    editor: lexicalEditor({
                      features: ({ rootFeatures }) => {
                        return [
                          ...rootFeatures,
                          FixedToolbarFeature(),
                          InlineToolbarFeature(),
                        ]
                      },
                    }),
                  },
                  {
                    name: 'enableLink',
                    type: 'checkbox',
                    label: 'Enable Link',
                  },
                  {
                    name: 'link',
                    type: 'group',
                    fields: [
                      {
                        name: 'type',
                        type: 'radio',
                        options: [
                          {
                            label: 'Internal link',
                            value: 'internal',
                          },
                          {
                            label: 'Custom URL',
                            value: 'custom',
                          },
                        ],
                        defaultValue: 'internal',
                        required: true,
                      },
                      {
                        name: 'reference',
                        type: 'relationship',
                        relationTo: ['pages', 'posts'],
                        required: true,
                        admin: {
                          condition: (_data: any, siblingData: any) => siblingData?.type === 'internal',
                        },
                      },
                      {
                        name: 'url',
                        type: 'text',
                        required: true,
                        admin: {
                          condition: (_data: any, siblingData: any) => siblingData?.type === 'custom',
                        },
                      },
                      {
                        name: 'newTab',
                        type: 'checkbox',
                        label: 'Open in new tab',
                      },
                    ],
                    admin: {
                      condition: (_data: any, siblingData: any) => Boolean(siblingData?.enableLink),
                    },
                  },
                ],
              },
            },
          }),
          HTMLConverterFeature(),
          HorizontalRuleFeature(),
        ]
      },
    }),
    label: false,
  },
  {
    name: 'image',
    type: 'upload',
    relationTo: 'media',
    admin: {
      condition: (_data, siblingData) => {
        return !siblingData.richText || Object.keys(siblingData.richText).length === 0;
      },
    },
  },
  {
    name: 'enableLink',
    type: 'checkbox',
  },
  link({
    overrides: {
      admin: {
        condition: (_data, siblingData) => {
          return Boolean(siblingData?.enableLink);
        },
      },
      validate: (data: any, { siblingData }: any) => {
        if (!siblingData?.enableLink) return true; // Skip validation if link is disabled

        const { type, reference, url } = data || {};

        if (type === 'reference' && !reference) {
          return 'Internal link requires a page or post reference.';
        }

        if (type === 'custom' && (!url || !url.trim())) {
          return 'Custom URL is required.';
        }

        return true;
      },
    },
  }),
]

export const Content: Block = {
  slug: 'content',
  interfaceName: 'ContentBlock',
  fields: [
    {
      name: 'columns',
      type: 'array',
      admin: {
        initCollapsed: true,
      },
      fields: columnFields,
    },
  ],
}