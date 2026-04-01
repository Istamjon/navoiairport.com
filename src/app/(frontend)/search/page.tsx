import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { Search } from '@/search/Component'
import PageClient from './page.client'
import { CardPostData } from '@/components/Card'
import { SearchX } from 'lucide-react'
import { cookies } from 'next/headers'

const DICTIONARY = {
  uz: {
    title: 'Saytdan qidirish',
    subtitle: 'Kerakli ma\'lumotni topish uchun quyidagi qidiruv panelidan foydalaning',
    results: 'Natijalar:',
    found: 'ta topildi',
    notFoundTitle: 'Hech narsa topilmadi',
    notFoundDesc1: 'Siz izlayotgan',
    word: 'so‘z',
    notFoundDesc2: 'bo\'yicha hech qanday natija mavjud emas. Boshqa kalit so\'zni kiritib ko\'ring yoki bosh sahifaga qayting.',
  },
  ru: {
    title: 'Поиск по сайту',
    subtitle: 'Используйте панель поиска ниже, чтобы найти нужную информацию',
    results: 'Результаты:',
    found: 'найдено',
    notFoundTitle: 'Ничего не найдено',
    notFoundDesc1: 'По запросу',
    word: 'слово',
    notFoundDesc2: 'ничего не найдено. Попробуйте ввести другое ключевое слово или вернитесь на главную страницу.',
  },
  en: {
    title: 'Site Search',
    subtitle: 'Use the search panel below to find the information you need',
    results: 'Results for:',
    found: 'found',
    notFoundTitle: 'Nothing found',
    notFoundDesc1: 'No results available for',
    word: 'word',
    notFoundDesc2: '. Try entering a different keyword or return to the homepage.',
  },
  zh: {
    title: '网站搜索',
    subtitle: '使用下面的搜索面板查找您需要的信息',
    results: '结果:',
    found: '找到',
    notFoundTitle: '没有找到任何内容',
    notFoundDesc1: '没有找到关于',
    word: '词',
    notFoundDesc2: '的结果。请尝试输入其他关键字或返回主页。',
  },
}

type Args = {
  searchParams: Promise<{
    q: string
  }>
}
export default async function Page({ searchParams: searchParamsPromise }: Args) {
  const { q: query } = await searchParamsPromise
  const payload = await getPayload({ config: configPromise })
  
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get('payload-locale')?.value
  const activeLocale = (localeCookie && Object.keys(DICTIONARY).includes(localeCookie) 
    ? localeCookie 
    : 'uz') as keyof typeof DICTIONARY
  
  const t = DICTIONARY[activeLocale]

  const posts = await payload.find({
    collection: 'search',
    depth: 1,
    limit: 12,
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
    },
    ...(query
      ? {
          where: {
            or: [
              {
                title: {
                  like: query,
                },
              },
              {
                'meta.description': {
                  like: query,
                },
              },
              {
                'meta.title': {
                  like: query,
                },
              },
              {
                slug: {
                  like: query,
                },
              },
            ],
          },
        }
      : {}),
  })

  return (
    <div className="pt-24 pb-24 min-h-[80vh]">
      <PageClient />
      
      {/* Search Header Region */}
      <div className="container mb-12 mt-8">
        <div className="max-w-4xl mx-auto text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
            {t.title}
          </h1>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            {t.subtitle}
          </p>

          <div className="w-full">
            <Search />
          </div>
        </div>
      </div>

      {/* Search Results Region */}
      <div className="container animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
        {query && (
          <div className="mb-8 flex items-center justify-between border-b pb-4">
            <h2 className="text-2xl font-bold">
              <span className="text-muted-foreground font-normal">{t.results}</span> &quot;{query}&quot;
            </h2>
            <div className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
              {posts.totalDocs || posts.docs.length} {t.found}
            </div>
          </div>
        )}

        {(posts.totalDocs || posts.docs.length) > 0 ? (
          <CollectionArchive posts={posts.docs as CardPostData[]} />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-24 h-24 mb-6 rounded-full bg-muted/50 flex items-center justify-center">
              <SearchX className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-2">{t.notFoundTitle}</h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              {t.notFoundDesc1} <strong>&quot;{query || t.word}&quot;</strong> {t.notFoundDesc2}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Navoi International Airport Official Website | Search`,
  }
}
