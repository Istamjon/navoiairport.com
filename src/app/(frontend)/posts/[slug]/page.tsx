import type { Metadata } from 'next'

import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { TypedLocale } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import RichText from '@/components/RichText'

import type { Post } from '@/payload-types'

import { PostHero } from '@/heros/PostHero'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { getLocale } from '@/utilities/getLocale'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config: configPromise })
    const posts = await payload.find({
      collection: 'posts',
      draft: false,
      limit: 1000,
      overrideAccess: false,
      pagination: false,
      select: {
        slug: true,
      },
    })

    const params = posts.docs.map(({ slug }) => {
      return { slug }
    })

    return params
  } catch (error) {
    return []
  }
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

function sanitizeLexicalData(data: any): any {
  if (!data?.root?.children) return data

  const cleanChildren = (children: any[], inP: boolean = false): any[] => {
    const result: any[] = []
    if (!Array.isArray(children)) return result

    for (const child of children) {
      if (child.type === 'paragraph' && inP) {
        // Dissolve nested paragraph wrappers to fix "p inside p" React hydration errors
        if (child.children) {
          result.push(...cleanChildren(child.children, true))
        }
      } else {
        const isNowInP = inP || child.type === 'paragraph'
        const newChild = { ...child }
        if (newChild.children) {
          newChild.children = cleanChildren(newChild.children, isNowInP)
        }
        result.push(newChild)
      }
    }
    return result
  }

  return {
    ...data,
    root: {
      ...data.root,
      children: cleanChildren(data.root.children, false),
    },
  }
}

export default async function Post({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const locale = await getLocale()
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = '/posts/' + decodedSlug
  const post = await queryPostBySlug({ slug: decodedSlug, locale })

  if (!post) return <PayloadRedirects url={url} />

  return (
    <article className="pt-16 pb-16">
      <PageClient />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <PostHero post={post} locale={locale} />

      <div className="container mt-8">
        <Link
          href="/posts"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft className="size-4 mr-1" />
          {locale === 'uz'
            ? 'Barcha yangiliklar'
            : locale === 'ru'
              ? 'Все новости'
              : locale === 'zh'
                ? '所有新闻'
                : 'All posts'}
        </Link>
      </div>

      <div className="flex flex-col items-center gap-4 pt-8">
        <div className="container">
          <RichText className=" " data={sanitizeLexicalData(post.content)} enableGutter={false} />

          {post.relatedPosts && post.relatedPosts.length > 0 && (
            <div className=" mx-auto mt-16 pt-12 border-t border-border/50">
              <h3 className="text-2xl font-bold mb-8">
                {locale === 'uz'
                  ? 'O‘xshash maqolalar'
                  : locale === 'ru'
                    ? 'Похожие статьи'
                    : locale === 'zh'
                      ? '相关文章'
                      : 'Related posts'}
              </h3>
              <RelatedPosts
                className="!container-none"
                docs={post.relatedPosts.filter((post) => typeof post === 'object')}
              />
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const locale = await getLocale()
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const post = await queryPostBySlug({ slug: decodedSlug, locale })

  return generateMeta({ doc: post })
}

const queryPostBySlug = cache(async ({ slug, locale }: { slug: string; locale: TypedLocale }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    locale,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
