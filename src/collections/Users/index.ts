// collections/Users/index.ts
import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'

export const Users: CollectionConfig = {
  slug: 'users',

  // 🔹 KOLLEKSIYA NOMLARI TARJIMASI
  labels: {
    singular: {
      en: 'User',
      ru: 'Пользователь',
      uz: 'Foydalanuvchi',
      zh: '用户',
    },
    plural: {
      en: 'Users',
      ru: 'Пользователи',
      uz: 'Foydalanuvchilar',
      zh: '用户',
    },
  },

  access: {
    admin: authenticated,
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },

  admin: {
    defaultColumns: ['name', 'email'],
    useAsTitle: 'name',

    // 🔹 ADMIN PANEL META MA'LUMOTLARI
    group: {
      en: 'User Management',
      ru: 'Управление пользователями',
    },
    description: {
      en: 'Manage user accounts and permissions',
      ru: 'Управление учетными записями и правами пользователей',
    },
  },

  auth: {
    useAPIKey: true,
  },

  fields: [
    {
      name: 'name',
      type: 'text',
      // localized: true,

      label: {
        en: 'Name',
        ru: 'Имя',
      },
      admin: {
        placeholder: {
          en: 'Enter full name',
          ru: 'Введите полное имя',
        },
        description: {
          en: "User's full name as displayed in the system",
          ru: 'Полное имя пользователя, отображаемое в системе',
        },
      },
    },
  ],

  timestamps: true,
}
