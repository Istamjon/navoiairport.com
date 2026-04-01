// collections/Categories.ts
import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',

  // 🔹 KOLLEKSIYA NOMLARI TARJIMASI
  labels: {
    singular: {
      en: 'Category',
      ru: 'Категория',
      uz: 'Kategoriya',
      zh: '类别',
    },
    plural: {
      en: 'Categories',
      ru: 'Категории',
      uz: 'Kategoriyalar',
      zh: '类别',
    },
  },

  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },

  admin: {
    useAsTitle: 'title',

    // 🔹 ADMIN PANEL META TARJIMALARI
    group: {
      en: 'Content',
      ru: 'Контент',
      uz: 'Kontent',
      zh: '内容',
    },
    description: {
      en: 'Organize posts and content by categories',
      ru: 'Организация постов и контента по категориям',
      uz: 'Postlar va kontentni kategoriyalar bo‘yicha tashkil qilish',
      zh: '按类别组织文章和内容',
    },
  },

  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,

      // 🔹 TITLE MAYDONI TARJIMALARI
      label: {
        en: 'Category Name',
        ru: 'Название категории',
      },
      admin: {
        placeholder: {
          en: 'e.g., Technology, News, Lifestyle',
          ru: 'масалан, Технологии, Новости, Образ жизни',
        },
        description: {
          en: 'The display name for this category',
          ru: 'Отображаемое название этой категории',
        },
      },
    },

    // 🔹 SLUGFIELD TARJIMASI
    slugField({
      position: undefined,
    }),
  ],
}
