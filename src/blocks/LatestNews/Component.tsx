'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Newspaper } from 'lucide-react'
import type { LatestNewsBlock as LatestNewsBlockProps } from '@/payload-types'
import type { Post } from '@/payload-types'
import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'

// Hook for responsive cards per view
const useResponsiveCardsPerView = () => {
  const [cardsPerView, setCardsPerView] = useState(4)

  useEffect(() => {
    const updateCardsPerView = () => {
      if (window.innerWidth < 640) {
        setCardsPerView(1) // Mobile
      } else if (window.innerWidth < 1024) {
        setCardsPerView(2) // Tablet
      } else {
        setCardsPerView(4) // Desktop
      }
    }

    updateCardsPerView()
    window.addEventListener('resize', updateCardsPerView)
    return () => window.removeEventListener('resize', updateCardsPerView)
  }, [])

  return cardsPerView
}

type Props = {
  className?: string
  disableInnerContainer?: boolean
  posts?: Post[]
} & LatestNewsBlockProps

export const LatestNewsBlock: React.FC<Props> = (props) => {
  const { posts, mainHeading, subtitle, readMoreText, allNewsButton, settings } = props

  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false)

  const cardsPerView = useResponsiveCardsPerView()

  // Memoize calculations to avoid recalculating on every render
  const { totalSlides, visiblePosts } = useMemo(() => {
    if (!posts || posts.length === 0) {
      return { totalSlides: 0, visiblePosts: [] }
    }

    // Handle edge case: fewer posts than cardsPerView
    const minPosts = Math.min(posts.length, cardsPerView)
    const slides = Math.max(1, posts.length - minPosts + 1)

    // Create extended array for seamless loop
    const extended =
      posts.length >= cardsPerView ? [...posts, ...posts.slice(0, cardsPerView)] : [...posts]

    // Get visible posts, ensuring we don't go out of bounds
    const safeIndex = currentIndex % posts.length
    const visible = extended.slice(safeIndex, safeIndex + cardsPerView)

    return {
      totalSlides: slides,
      visiblePosts: visible,
    }
  }, [posts, cardsPerView, currentIndex])

  const nextSlide = useCallback(() => {
    if (!posts || posts.length === 0) return
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % posts.length)
  }, [posts])

  const prevSlide = useCallback(() => {
    if (!posts || posts.length === 0) return
    setDirection(-1)
    setCurrentIndex((prev) => {
      if (prev <= 0) {
        return posts.length - 1
      }
      return prev - 1
    })
  }, [posts])

  const goToSlide = useCallback(
    (index: number) => {
      setDirection(index > currentIndex ? 1 : -1)
      setCurrentIndex(index)
    },
    [currentIndex],
  )

  useEffect(() => {
    if (settings?.autoplay && totalSlides > 1 && !isAutoplayPaused) {
      const interval = setInterval(nextSlide, settings.autoplayDelay || 5000)
      return () => clearInterval(interval)
    }
  }, [settings?.autoplay, settings?.autoplayDelay, nextSlide, totalSlides, isAutoplayPaused])

  if (!posts || posts.length === 0) return null

  // Optimized slide variants with smooth easing
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
  }

  // Card stagger animation for initial load
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
      },
    }),
  }

  return (
    <section
      className="relative bg-background py-20 md:py-30 xl:py-30  overflow-hidden"
      onMouseEnter={() => setIsAutoplayPaused(true)}
      onMouseLeave={() => setIsAutoplayPaused(false)}
    >
      <div className="container px-2 lg-px-0 relative z-10">
        {/* ROW 1: Header Section - Right: Heading/Subtitle, Left: Navigation */}
        <motion.div
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{
            duration: 0.7,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          {/* Heading & Subtitle */}
          <div className="flex-1">
            {mainHeading && (
              <motion.h2
                className="text-3xl md:text-4xl font-bold text-foreground mb-2 uppercase tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{
                  duration: 0.6,
                  delay: 0.2,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
              >
                {mainHeading}
              </motion.h2>
            )}
            {subtitle && (
              <motion.p
                className="text-sm text-muted-foreground max-w-2xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{
                  duration: 0.6,
                  delay: 0.3,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
              >
                {subtitle}
              </motion.p>
            )}
          </div>

          {/* Navigation Buttons */}
          {settings?.showNavigation && totalSlides > 1 && (
            <motion.div
              className="flex gap-2"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <button
                onClick={prevSlide}
                className="w-10 h-10 rounded-md border border-foreground bg-transparent text-foreground flex items-center justify-center button-shine focus-visible:ring-2 focus-visible:ring-primary outline-none hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextSlide}
                className="w-10 h-10 rounded-md border border-foreground bg-transparent text-foreground flex items-center justify-center button-shine focus-visible:ring-2 focus-visible:ring-primary outline-none hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* ROW 2: Carousel Posts - 4 Card Grid */}
        <div className="relative overflow-hidden mb-12">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: {
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                  mass: 0.8,
                },
                opacity: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
                scale: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {visiblePosts.map((post, index: number) => {
                if (typeof post !== 'object') return null

                // Get first category for badge
                const firstCategory =
                  Array.isArray(post.categories) && post.categories.length > 0
                    ? typeof post.categories[0] === 'object'
                      ? post.categories[0]
                      : null
                    : null

                return (
                  <motion.div
                    key={`${currentIndex}-${index}`}
                    className="group relative"
                    custom={index}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-50px' }}
                    variants={cardVariants}
                  >
                    <a
                      href={`/posts/${typeof post === 'object' && 'slug' in post ? post.slug : ''}`}
                      className="bg-[#F5F5F5] dark:bg-card rounded-md overflow-hidden w-full h-full flex flex-col block shine-effect focus-visible:ring-2 focus-visible:ring-primary outline-none"
                      role="article"
                      aria-label={post.title || 'News article'}
                    >
                      {/* Card Image - Top */}
                      {post.heroImage && typeof post.heroImage === 'object' && (
                        <div className="relative w-full aspect-[16/9] overflow-hidden bg-muted flex-shrink-0">
                          <Media
                            resource={post.heroImage}
                            fill={true}
                            imgClassName="object-cover"
                          />
                        </div>
                      )}

                      {/* Card Content - Bottom */}
                      <div className="flex-1 p-6 flex flex-col justify-between">
                        <div>
                          {/* Category Badge */}
                          {firstCategory && 'title' in firstCategory && (
                            <div className="mb-3">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-foreground bg-accent/50 rounded">
                                <Newspaper className="w-3.5 h-3.5" aria-hidden="true" />
                                {firstCategory.title}
                              </span>
                            </div>
                          )}

                          {/* Title */}
                          {post.title && (
                            <h3 className="text-lg font-bold text-foreground mb-3 line-clamp-2 leading-tight">
                              {post.title}
                            </h3>
                          )}

                          {/* Description */}
                          {post.meta?.description && (
                            <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-3">
                              {post.meta.description}
                            </p>
                          )}
                        </div>

                        {/* Read More Link */}
                        <div className="flex items-center justify-end mt-auto">
                          <span className="text-sm font-semibold text-primary dark:text-white flex items-center gap-1">
                            {readMoreText || 'Read More'} →
                          </span>
                        </div>
                      </div>
                    </a>
                  </motion.div>
                )
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ROW 3: Dots Indicator Left, All News Button Right */}
        <motion.div
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Dots Indicator */}
          {settings?.showDots && totalSlides > 1 && (
            <motion.div
              className="flex gap-2 justify-center md:justify-start"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              {Array.from({ length: totalSlides }).map((_, index) => {
                const normalizedIndex = currentIndex % (posts?.length || 1)
                const isActive = normalizedIndex === index

                return (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={cn(
                      'h-2 rounded-md transition-all focus-visible:ring-2 focus-visible:ring-primary outline-none',
                      isActive
                        ? 'w-8 bg-primary'
                        : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50',
                    )}
                    aria-label={`Go to slide ${index + 1}`}
                    aria-current={isActive ? 'true' : 'false'}
                  />
                )
              })}
            </motion.div>
          )}

          {/* All News Button - Outline Style */}
          {allNewsButton?.link && (
            <a
              href={allNewsButton.link}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-foreground bg-transparent text-foreground rounded-md font-semibold button-shine focus-visible:ring-2 focus-visible:ring-primary outline-none hover:bg-primary hover:text-primary-foreground transition-colors duration-200 text-sm"
              role="button"
              aria-label={allNewsButton.text || 'View all news'}
            >
              {allNewsButton.text || 'Barcha yangiliklar'}
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </a>
          )}
        </motion.div>
      </div>
    </section>
  )
}
