'use client'

import { formatDateTime } from 'src/utilities/formatDateTime'
import React, { useRef } from 'react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'
import { formatAuthors } from '@/utilities/formatAuthors'
import { motion, useScroll, useTransform } from 'framer-motion'

export const PostHero: React.FC<{
  post: Post
  locale?: string
}> = ({ post, locale = 'uz' }) => {
  const { categories, heroImage, populatedAuthors, publishedAt, title } = post

  const DICTIONARY = {
    uz: { author: 'Muallif', date: 'Nashr qilingan sana' },
    ru: { author: 'Автор', date: 'Дата публикации' },
    en: { author: 'Author', date: 'Date Published' },
    zh: { author: '作者', date: '发布日期' },
  }
  const activeLocale = (locale && Object.keys(DICTIONARY).includes(locale) ? locale : 'uz') as keyof typeof DICTIONARY
  const t = DICTIONARY[activeLocale]

  const hasAuthors =
    populatedAuthors && populatedAuthors.length > 0 && formatAuthors(populatedAuthors) !== ''

  const ref = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })

  const yBackground = useTransform(scrollYProgress, [0, 1], ['0%', '40%'])
  const opacityText = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const yText = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  }

  return (
    <div ref={ref} className="relative -mt-[10.4rem] w-full overflow-hidden bg-slate-950 pt-40 pb-12 md:pt-48 md:pb-16">
      <motion.div 
        initial={{ scale: 1.05, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        style={{ y: yBackground }}
        className="select-none absolute inset-[-10%] z-0"
      >
        {heroImage && typeof heroImage !== 'string' && (
          <Media fill priority imgClassName="object-cover" resource={heroImage} />
        )}
        <div className="absolute inset-0 bg-black/60" />
      </motion.div>
      
      <div className="container relative z-10 text-white">
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          style={{ opacity: opacityText, y: yText }}
          className="max-w-3xl"
        >
          <motion.div variants={fadeIn} className="uppercase text-xs md:text-sm font-semibold tracking-wider text-white mb-4 flex flex-wrap gap-2">
            {categories?.map((category, index) => {
              if (typeof category === 'object' && category !== null) {
                const { title: categoryTitle } = category
                const titleToUse = categoryTitle || 'Untitled category'

                return (
                  <span key={index} className="bg-primary/90 backdrop-blur-sm shadow-sm px-4 py-1.5 rounded-full text-white">
                    {titleToUse}
                  </span>
                )
              }
              return null
            })}
          </motion.div>

          <motion.h1 variants={fadeIn} className="mb-6 text-3xl md:text-5xl lg:text-5xl font-extrabold leading-tight">{title}</motion.h1>

          <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 sm:gap-12 mt-8 text-white/80">
            {hasAuthors && (
              <div className="flex flex-col gap-1">
                <p className="text-xs uppercase tracking-widest text-white/50 font-semibold mt-[2px]">{t.author}</p>
                <p className="font-medium text-white">{formatAuthors(populatedAuthors)}</p>
              </div>
            )}
            {publishedAt && (
              <div className="flex flex-col gap-1">
                <p className="text-xs uppercase tracking-widest text-white/50 font-semibold mt-[2px]">{t.date}</p>
                <time className="font-medium text-white" dateTime={publishedAt}>{formatDateTime(publishedAt)}</time>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
