import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { generateUniqueFilename, isValidFilename } from '../utilities/sanitizeFilename'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        // Sanitize and generate unique filename on upload
        if (data.filename && req.file) {
          // Validate filename for security
          if (!isValidFilename(data.filename)) {
            throw new Error('Invalid filename detected. Filename contains unsafe characters.')
          }

          // Generate unique filename with timestamp and UUID
          const uniqueFilename = generateUniqueFilename(data.filename)
          data.filename = uniqueFilename

          req.payload.logger.info(`Generated unique filename: ${uniqueFilename}`)
        }

        return data
      },
    ],
  },
  // 🔹 KOLLEKSIYA NOMLARI TARJIMASI
  labels: {
    singular: {
      en: 'Media',
      ru: 'Медиа',
      uz: 'Media',
      zh: '媒体',
    },
    plural: {
      en: 'Media Files',
      ru: 'Медиафайлы',
      uz: 'Media fayllar',
      zh: '媒体文件',
    },
  },
  folders: true,
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      //required: true,
      // 🔹 ALT MAYDONI TARJIMALARI
      label: {
        en: 'Alt Text',
        ru: 'Альтернативный текст',
        uz: 'Muqobil matn (Alt)',
        zh: '替代文本',
      },
      localized: true,
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
      localized: true,
    },
  ],
  upload: {
    // Upload to the public/media directory in Next.js making them publicly accessible even outside of Payload
    staticDir: path.resolve(dirname, '../../public/media'),
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    formatOptions: {
      format: 'webp',
      options: {
        quality: 85,
      },
    },
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
      },
      {
        name: 'small',
        width: 600,
      },
      {
        name: 'medium',
        width: 900,
      },
      {
        name: 'large',
        width: 1400,
      },
      {
        name: 'xlarge',
        width: 1920,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
}
