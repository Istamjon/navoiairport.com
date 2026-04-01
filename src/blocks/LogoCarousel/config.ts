import type { Block } from 'payload'

export const LogoCarousel: Block = {
  slug: 'logoCarousel',
  labels: {
    singular: {
      en: 'Logo Carousel',
      ru: 'Карусель логотипов',
      uz: 'Logotiplar karuseli',
    },
    plural: {
      en: 'Logo Carousels',
      ru: 'Карусели логотипов',
      uz: 'Logotiplar karusellari',
    },
  },
  fields: [
    {
      name: 'backgroundColor',
      type: 'select',
      defaultValue: 'white',
      options: [
        { label: 'Oq (White)', value: 'white' },
        { label: 'Kulrang (Gray #F5F5F5)', value: 'gray' },
      ],
      admin: {
        description: 'Fon rangini tanlang',
      },
    },
    {
      name: 'speed',
      type: 'number',
      defaultValue: 30,
      admin: {
        description: 'Animation speed in seconds (default: 30)',
      },
      label: {
        en: 'Animation Speed (seconds)',
        ru: 'Скорость анимации (в секундах)',
        uz: 'Animatsiya tezligi (soniya)',
      },
    },
    {
      name: 'logos',
      type: 'array',
      required: true,
      minRows: 1,
      labels: {
        singular: {
          en: 'Logo',
          ru: 'Логотип',
          uz: 'Logotip',
        },
        plural: {
          en: 'Logos',
          ru: 'Логотипы',
          uz: 'Logotiplar',
        },
      },
      fields: [
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: {
            en: 'Logo Image',
            ru: 'Изображение логотипа',
            uz: 'Logotip rasmi',
          },
        },
        {
          name: 'link',
          type: 'text',
          admin: {
            placeholder: 'https://example.com',
            description: 'Optional URL for the logo link',
          },
          label: {
            en: 'Link URL',
            ru: 'Ссылка URL',
            uz: 'Havola URL',
          },
        },
      ],
    },
  ],
}
