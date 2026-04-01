import type { Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '@/fields/linkGroup'

export const hero: Field = {
  name: 'hero',
  type: 'group',
  localized: true,
  fields: [
    {
      name: 'type',
      type: 'select',
      defaultValue: 'lowImpact',
      label: 'Type',
      options: [
        {
          label: 'None',
          value: 'none',
        },
        {
          label: 'High Impact',
          value: 'highImpact',
        },
        {
          label: 'Medium Impact',
          value: 'mediumImpact',
        },
        {
          label: 'Low Impact',
          value: 'lowImpact',
        },
        {
          label: 'NIA',
          value: 'nia',
        },
      ],
      required: true,
    },
    {
      name: 'richText',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: false,
    },
    linkGroup({
      overrides: {
        maxRows: 2,
      },
    }),
    {
      name: 'media',
      type: 'upload',
      admin: {
        condition: (_, { type } = {}) => ['highImpact', 'mediumImpact'].includes(type),
      },
      relationTo: 'media',
      required: true,
    },
    {
      name: 'backgroundType',
      type: 'radio',
      admin: {
        condition: (_, { type } = {}) => type === 'nia',
        layout: 'horizontal',
      },
      defaultValue: 'images',
      options: [
        {
          label: {
            en: 'Image Slideshow',
            ru: 'Слайдшоу изображений',
            uz: 'Rasm slaydshowi',
            zh: '图片幻灯片',
          },
          value: 'images',
        },
        {
          label: {
            en: 'YouTube Video',
            ru: 'YouTube видео',
            uz: 'YouTube video',
            zh: 'YouTube视频',
          },
          value: 'video',
        },
      ],
      label: {
        en: 'Background Type',
        ru: 'Тип фона',
        uz: 'Fon turi',
        zh: '背景类型',
      },
    },
    {
      name: 'slideshowImages',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      admin: {
        condition: (_, siblingData) =>
          siblingData?.type === 'nia' && siblingData?.backgroundType === 'images',
        description: 'Upload multiple images for background slideshow (recommended: 3-5 images)',
      },
      label: {
        en: 'Slideshow Images',
        ru: 'Изображения слайдшоу',
        uz: 'Slayd rasmlar',
        zh: '幻灯片图片',
      },
      required: true,
      minRows: 1,
    },
    {
      name: 'youtubeVideoUrl',
      type: 'text',
      admin: {
        condition: (_, siblingData) =>
          siblingData?.type === 'nia' && siblingData?.backgroundType === 'video',
        description:
          'Enter YouTube video URL or ID (e.g., https://www.youtube.com/watch?v=VIDEO_ID or just VIDEO_ID)',
      },
      label: {
        en: 'YouTube Video URL',
        ru: 'URL YouTube видео',
        uz: 'YouTube video URL',
        zh: 'YouTube视频链接',
      },
      required: true,
    },
    {
      name: 'departureTab',
      type: 'text',
      admin: {
        condition: (_, { type } = {}) => type === 'nia',
      },
      defaultValue: 'UCHIB KETISH',
      label: {
        en: 'Departure Tab',
        ru: 'Вкладка вылета',
        uz: "Uchish yorlig'i",
        zh: '出发标签',
      },
    },
    {
      name: 'arrivalTab',
      type: 'text',
      admin: {
        condition: (_, { type } = {}) => type === 'nia',
      },
      defaultValue: "QO'NIB KELISH",
      label: {
        en: 'Arrival Tab',
        ru: 'Вкладка прилета',
        uz: "Qo'nish yorlig'i",
        zh: '到达标签',
      },
    },
    {
      name: 'destinationLabel',
      type: 'text',
      admin: {
        condition: (_, { type } = {}) => type === 'nia',
      },
      defaultValue: 'Qayerga',
      label: {
        en: 'Destination Label',
        ru: 'Метка направления',
        uz: "Yo'nalish yorlig'i",
        zh: '目的地标签',
      },
    },
    {
      name: 'originLabel',
      type: 'text',
      admin: {
        condition: (_, { type } = {}) => type === 'nia',
      },
      defaultValue: 'Qayerdan',
      label: {
        en: 'Origin Label',
        ru: 'Метка происхождения',
        uz: "Qayerdan yorlig'i",
        zh: '出发地标签',
      },
    },
    {
      name: 'destinationPlaceholder',
      type: 'text',
      admin: {
        condition: (_, { type } = {}) => type === 'nia',
      },
      defaultValue: 'Shahar yoki aeroport',
      label: {
        en: 'Destination Placeholder',
        ru: 'Заполнитель направления',
        uz: "Yo'nalish placeholder",
        zh: '目的地占位符',
      },
    },
    {
      name: 'dateLabel',
      type: 'text',
      admin: {
        condition: (_, { type } = {}) => type === 'nia',
      },
      defaultValue: 'Sana',
      label: {
        en: 'Date Label',
        ru: 'Метка даты',
        uz: "Sana yorlig'i",
        zh: '日期标签',
      },
    },
    {
      name: 'searchButton',
      type: 'text',
      admin: {
        condition: (_, { type } = {}) => type === 'nia',
      },
      defaultValue: 'QIDIRISH',
      label: {
        en: 'Search Button',
        ru: 'Кнопка поиска',
        uz: 'Qidiruv tugmasi',
        zh: '搜索按钮',
      },
    },
  ],
  label: false,
}
