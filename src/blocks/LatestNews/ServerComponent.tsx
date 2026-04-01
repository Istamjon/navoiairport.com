import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { LatestNewsBlock as LatestNewsBlockProps } from '@/payload-types'
import type { Post } from '@/payload-types'
import { LatestNewsBlock } from './Component'
import { getLocale } from '@/utilities/getLocale'

type Props = {
  className?: string
  disableInnerContainer?: boolean
} & LatestNewsBlockProps

export async function LatestNewsServer(props: Props) {
  const { category, postsLimit } = props
  const locale = await getLocale()

  // Fetch posts by category
  let posts: Post[] = []

  // Extract category ID - can be string, number, or Category object
  let categoryId: string | undefined

  if (typeof category === 'string') {
    categoryId = category
  } else if (typeof category === 'number') {
    categoryId = String(category)
  } else if (category && typeof category === 'object' && 'id' in category) {
    categoryId = String(category.id)
  }

  console.log('LatestNewsServer - Category:', categoryId, 'Limit:', postsLimit)

  if (categoryId) {
    try {
      const payload = await getPayload({ config: configPromise })

      const result = await payload.find({
        collection: 'posts',
        locale,
        where: {
          categories: {
            contains: categoryId,
          },
        },
        limit: postsLimit || 8,
        sort: '-publishedAt',
        depth: 1,
      })

      posts = result.docs as Post[]
      console.log('LatestNewsServer - Found posts:', posts.length)
    } catch (error) {
      console.error('Error fetching posts for LatestNews block:', error)
    }
  } else {
    console.warn('LatestNewsServer - No category provided')
  }

  // Pass posts to client component
  return <LatestNewsBlock {...props} posts={posts} />
}
