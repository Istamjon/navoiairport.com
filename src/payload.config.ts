import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'
import { ru } from '@payloadcms/translations/languages/ru'
import { en } from '@payloadcms/translations/languages/en'
import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  i18n: {
    supportedLanguages: { en, ru },
    fallbackLanguage: 'ru',
    translations: {
      en: {
        'plugin-redirects': {
          fromUrl: 'From URL',
          toUrlType: 'To URL Type',
          internalLink: 'Internal Link',
          customUrl: 'Custom URL',
          documentToRedirect: 'Document To Redirect',
          customUrlLabel: 'Custom URL',
        },
        'plugin-seo': {
          meta: 'SEO',
          title: 'Meta Title',
          description: 'Meta Description',
          image: 'Meta Image',
          overview: 'Overview',
          preview: 'Preview',
        },
        'plugin-form-builder': {
          form: 'Form',
          forms: 'Forms',
          submissions: 'Submissions',
          confirmationMessage: 'Confirmation Message',
        },
      },
      ru: {
        'plugin-redirects': {
          fromUrl: 'Исходный URL',
          toUrlType: 'Тип целевого URL',
          internalLink: 'Внутренняя ссылка',
          customUrl: 'Пользовательский URL',
          documentToRedirect: 'Документ для перенаправления',
          customUrlLabel: 'Пользовательский URL',
        },
        'plugin-seo': {
          meta: 'SEO',
          title: 'Мета-заголовок',
          description: 'Мета-описание',
          image: 'Мета-изображение',
          overview: 'Обзор',
          preview: 'Предпросмотр',
        },
        'plugin-form-builder': {
          form: 'Форма',
          forms: 'Формы',
          submissions: 'Отправки',
          confirmationMessage: 'Сообщение о подтверждении',
        },
      },
    },
  },

  experimental: { localizeStatus: true },

  localization: {
    locales: [
      { code: 'uz', label: "O'zbek" },
      { code: 'ru', label: 'Русский' },
      { code: 'en', label: 'English' },
      { code: 'zh', label: '中文', rtl: false },
    ],
    defaultLocale: 'uz',
    fallback: true,
  },

  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeLogin: ['@/components/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      // beforeDashboard: ['@/components/BeforeDashboard'],
    },
    timezones: {
      supportedTimezones: [
        {
          label: 'UTC+5',
          value: 'Asia/Tashkent',
        },
      ],
      defaultTimezone: 'Asia/Tashkent',
    },

    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  collections: [Pages, Posts, Media, Categories, Users],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer],
  email: nodemailerAdapter({
    defaultFromAddress: 'info@navoiyairport.uz',
    defaultFromName: 'Navoi Airport Admin',
    transportOptions: {
      streamTransport: true,
    },
  }),
  plugins,

  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        const secret = process.env.CRON_SECRET
        if (!secret) return false

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [],
  },
})
