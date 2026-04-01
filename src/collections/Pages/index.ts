// collections/Pages/index.ts
import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { Archive } from '../../blocks/ArchiveBlock/config'
import { CallToAction } from '../../blocks/CallToAction/config'
import { Content } from '../../blocks/Content/config'
import { FormBlock } from '../../blocks/Form/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { FlightsTable } from '../../blocks/FlightsTable/config'
import { Carousel } from '../../blocks/Carusel/config'
import { LatestNews } from '../../blocks/LatestNews/config'
import { InfoCards } from '../../blocks/InfoCards/config'
import { LogoCarousel } from '../../blocks/LogoCarousel/config'
import { hero } from '@/heros/config'
import { slugField } from 'payload'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',

  // 🔹 KOLLEKSIYA NOMLARI TARJIMASI
  labels: {
    singular: {
      en: 'Page',
      ru: 'Страница',
      uz: 'Sahifa',
      zh: '页面',
    },
    plural: {
      en: 'Pages',
      ru: 'Страницы',
      uz: 'Sahifalar',
      zh: '页面',
    },
  },

  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },

  // This config controls what's populated by default when a page is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'pages'>
  defaultPopulate: {
    title: true,
    slug: true,
  },

  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],

    // 🔹 ADMIN PANEL META MA'LUMOTLARI
    group: {
      en: 'Content',
      ru: 'Контент',
      uz: 'Kontent',
      zh: '内容',
    },
    description: {
      en: 'Manage website pages',
      ru: 'Управление страницами сайта',
      uz: 'Sayt sahifalarini boshqarish',
      zh: '管理网站页面',
    },

    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'pages',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'pages',
        req,
      }),
    useAsTitle: 'title',
  },

  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,

      // 🔹 TITLE MAYDONI TARJIMALARI
      label: {
        en: 'Title',
        ru: 'Название страницы',
        uz: 'Sahifa nomi',
      },
      admin: {
        placeholder: {
          en: 'Enter page title',
          ru: 'Введите название страницы',
          uz: 'Sahifa nomini kiriting',
        },
        description: {
          en: 'The main title of your page',
          ru: 'Основное название вашей страницы',
          uz: 'Sahifangizning asosiy nomi',
        },
      },
    },

    {
      type: 'tabs',
      tabs: [
        {
          // 🔹 HERO TAB TARJIMASI
          label: {
            en: 'Hero',
            ru: 'Герой',
          },
          fields: [hero],
        },
        {
          // 🔹 CONTENT TAB TARJIMASI
          label: {
            en: 'Content',
            ru: 'Содержание',
          },
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blocks: [
                CallToAction,
                Content,
                MediaBlock,
                Archive,
                FormBlock,
                FlightsTable,
                Carousel,
                LatestNews,
                InfoCards,
                LogoCarousel,
              ],
              required: true,
              localized: true,
              // 🔹 LAYOUT MAYDONI TARJIMALARI
              label: {
                en: 'Page Layout',
                ru: 'Макет страницы',
              },

              admin: {
                initCollapsed: true,
                description: {
                  en: 'Add content blocks to build your page',
                  ru: 'Добавляйте блоки контента для создания страницы',
                },
              },
            },
          ],
        },
        {
          name: 'meta',
          localized: true,
          // 🔹 SEO TAB TARJIMASI
          label: {
            en: 'SEO',
            ru: 'SEO',
          },
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),
            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,
              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },

    {
      name: 'publishedAt',
      type: 'date',

      // 🔹 PUBLISHED AT TARJIMALARI
      label: {
        en: 'Published At',
        ru: 'Опубликовано',
      },

      admin: {
        position: 'sidebar',
        description: {
          en: 'Date and time when the page was/will be published',
          ru: 'Дата и время публикации страницы',
        },
      },
    },

    slugField(),
  ],

  hooks: {
    afterChange: [revalidatePage],
    beforeChange: [populatePublishedAt],
    afterDelete: [revalidateDelete],
  },

  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
