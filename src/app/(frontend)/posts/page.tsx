import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { cn } from '@/utilities/ui'
import Link from 'next/link'
import PageClient from './page.client'
import { getLocale } from '@/utilities/getLocale'

const DICTIONARY = {
  uz: { title: 'Yangiliklar', desc: 'Aeroportdagi barcha yangiliklar, tadbirlar va muhim eʼlonlar', all: 'Barchasi', post: 'yangilik', posts: 'yangiliklar', showing: 'Ko‘rsatilmoqda:', of: 'dan', noResults: 'Hech narsa topilmadi.' },
  ru: { title: 'Новости', desc: 'Все новости, события и важные объявления аэропорта', all: 'Все', post: 'новость', posts: 'новости', showing: 'Показано:', of: 'из', noResults: 'Ничего не найдено.' },
  en: { title: 'News', desc: 'All news, events, and important announcements at the airport', all: 'All', post: 'post', posts: 'posts', showing: 'Showing', of: 'of', noResults: 'No results found.' },
  zh: { title: '新闻', desc: '机场的所有新闻、事件和重要公告', all: '全部', post: '帖', posts: '帖', showing: '显示', of: '共有', noResults: '未找到结果。' },
}

export const dynamic = 'force-dynamic'

type Args = {
  searchParams: Promise<{
    category?: string
  }>
}

export default async function Page({ searchParams: searchParamsPromise }: Args) {
  const { category: categorySlug } = await searchParamsPromise
  const payload = await getPayload({ config: configPromise })
  const locale = await getLocale()

  const activeLocale = (locale && Object.keys(DICTIONARY).includes(locale) ? locale : 'uz') as keyof typeof DICTIONARY
  const t = DICTIONARY[activeLocale]

  let categoryId = null
  if (categorySlug) {
    const matchedCategory = await payload.find({
      collection: 'categories',
      locale,
      where: { slug: { equals: categorySlug } },
      limit: 1,
    })
    if (matchedCategory.docs.length > 0) categoryId = matchedCategory.docs[0].id
  }

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    overrideAccess: false,
    locale,
    ...(categoryId ? { where: { categories: { in: [categoryId] } } } : {}),
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
    },
  })

  const allCategories = await payload.find({
    collection: 'categories',
    depth: 0,
    limit: 100,
    locale,
    overrideAccess: false,
  })

  return (
    <div className="pt-24 pb-24 min-h-[80vh]">
      <PageClient />
      
      {/* Premium Header */}
      <div className="container mb-16 mt-8">
        <div className="max-w-4xl max-md:text-center animate-in fade-in slide-in-from-bottom-4 duration-700 bg-muted/30 p-8 md:p-12 rounded-md border border-border/50">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
            {t.title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl max-md:mx-auto">
            {t.desc}
          </p>
        </div>
      </div>

      <div className="container mb-8">
        <div className="flex gap-2 mb-8 overflow-x-auto pb-4 scrollbar-hide">
          <Link 
            href="/posts" 
            className={cn("px-5 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap", !categorySlug ? "bg-primary text-white" : "bg-muted text-foreground hover:bg-muted/80")}
          >
            {t.all}
          </Link>
          {allCategories.docs.map(cat => (
            <Link 
              key={cat.id} 
              href={`/posts?category=${cat.slug}`} 
              className={cn("px-5 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap", categorySlug === cat.slug ? "bg-primary text-white" : "bg-muted text-foreground hover:bg-muted/80")}
            >
              {typeof cat === 'object' ? cat.title : ''}
            </Link>
          ))}
        </div>

        <PageRange
          collection="posts"
          currentPage={posts.page}
          limit={12}
          totalDocs={posts.totalDocs}
          collectionLabels={{
            singular: t.post,
            plural: t.posts,
          }}
          labelShowing={t.showing}
          labelOf={t.of}
          labelNoResults={t.noResults}
        />
      </div>

      <CollectionArchive posts={posts.docs} />

      <div className="container">
        {posts.totalPages > 1 && posts.page && (
          <Pagination page={posts.page} totalPages={posts.totalPages} />
        )}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Navoi International Airport Official Website | Posts`,
  }
}
