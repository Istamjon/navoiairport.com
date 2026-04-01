import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import { searchPlugin } from '@payloadcms/plugin-search'
import { Plugin } from 'payload'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { searchFields } from '@/search/fieldOverrides'
import { beforeSyncWithSearch } from '@/search/beforeSync'

import { Page, Post } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'

const generateTitle: GenerateTitle<Post | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | Navoi International Airport` : 'Navoi International Airport'
}

const generateURL: GenerateURL<Post | Page> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

export const plugins: Plugin[] = [
  redirectsPlugin({
    collections: ['pages', 'posts'],
    overrides: {
      // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              admin: {
                description: 'You will need to rebuild the website when changing this field.',
              },
            }
          }
          return field
        })
      },
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  }),
  nestedDocsPlugin({
    collections: ['categories', 'pages'],
    generateLabel: (_, doc) => doc.title as string,
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  seoPlugin({
    generateTitle,
    generateURL,
    // Add localized: true to ensure meta fields are translatable
    // Note: If this version of the plugin doesn't support this directly,
    // we might need to override the fields.
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formOverrides: {
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
  }),
  searchPlugin({
    collections: ['posts', 'pages'],
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
  mcpPlugin({
    collections: {
      categories: {
        description: 'Product and post categories for organizing content',
        enabled: true,
      },
      pages: {
        description: 'Static and dynamic website pages with various layouts',
        enabled: true,
      },
      posts: {
        description: 'Chronological blog posts, news articles, and press releases',
        enabled: true,
      },
      media: {
        description: 'Image and video assets used across the website',
        enabled: true,
      },
      users: {
        description: 'Website administrators and authors',
        enabled: true,
      },
      redirects: {
        description: 'URL redirection rules and internal links',
        enabled: true,
      },
      forms: {
        description: 'User-facing web forms and surveys',
        enabled: true,
      },
      'form-submissions': {
        description: 'Data submitted by users via web forms',
        enabled: true,
      },
      search: {
        description: 'Full-text search results and rankings',
        enabled: true,
      },
      'payload-folders': {
        description: 'Organize media and other assets into folders',
        enabled: true,
      },
      'payload-mcp-api-keys': {
        description: 'API keys for MCP connection management',
        enabled: true,
      },
      'payload-kv': {
        description: 'Key-value storage for internal state',
        enabled: true,
      },
      'payload-jobs': {
        description: 'Background tasks and scheduled operations',
        enabled: true,
      },
      'payload-locked-documents': {
        description: 'Information about locked documents in the CMS',
        enabled: true,
      },
    },
    globals: {
      footer: {
        description: 'Global footer configuration including navigation links and copyright info',
        enabled: true,
      },
      header: {
        description: 'Global header configuration including primary navigation and site logo',
        enabled: true,
      },
    },
  }),
]
