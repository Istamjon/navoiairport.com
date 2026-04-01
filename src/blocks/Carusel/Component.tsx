'use client'

import React, { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { CarouselBlock as CarouselBlockProps } from '@/payload-types'
import { Media } from '@/components/Media'

type Props = {
  className?: string
  disableInnerContainer?: boolean
} & CarouselBlockProps

export const CarouselBlock: React.FC<Props> = (props) => {
  const { cards, mainHeading, subtitle, settings } = props
  const [isPaused, setIsPaused] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)

  // Autoplay function using native scroll
  useEffect(() => {
    if (!settings?.autoplay || isPaused) return
    const interval = setInterval(() => {
      if (trackRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = trackRef.current
        // If we reached the end, smoothly scroll back to the start
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          trackRef.current.scrollTo({ left: 0, behavior: 'smooth' })
        } else {
          trackRef.current.scrollBy({ left: 450, behavior: 'smooth' })
        }
      }
    }, settings.autoplayDelay || 5000)
    return () => clearInterval(interval)
  }, [settings?.autoplay, settings?.autoplayDelay, isPaused])

  if (!cards || cards.length === 0) return null

  // Duplicate cards so it feels like a long scrollable list.
  // 3 copies is usually enough to give an "infinite" feel without being too heavy.
  const loopCards = [...cards, ...cards, ...cards]

  const nextSlide = () => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: 450, behavior: 'smooth' })
    }
  }

  const prevSlide = () => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: -450, behavior: 'smooth' })
    }
  }

  return (
    <section
      className="relative bg-[#f5f5f5] dark:bg-background  py-10 lg:py-30 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Image */}
      {props.backgroundImage && typeof props.backgroundImage === 'object' && (
        <div className="absolute inset-0 z-0">
          <Media
            resource={props.backgroundImage}
            imgClassName="object-cover object-center w-full h-full"
          />
        </div>
      )}

      <div className="container relative z-10">
        {/* ROW 1: Header */}
        <motion.div
          className="flex px-4 lg:px-0  flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Heading & Subtitle */}
          <div className="flex-1">
            {mainHeading && (
              <motion.h2
                className="text-4xl md:text-5xl font-bold text-foreground mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {mainHeading}
              </motion.h2>
            )}
            {subtitle && (
              <motion.p
                className="text-lg text-muted-foreground max-w-2xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {subtitle}
              </motion.p>
            )}
          </div>

          {/* Navigation buttons */}
          {settings?.showNavigation && (
            <motion.div
              className="flex gap-3  "
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <button
                onClick={prevSlide}
                className="w-10 h-10 rounded-md border border-primary dark:border-foreground bg-transparent text-primary dark:text-foreground flex items-center justify-center button-shine focus-visible:ring-2 focus-visible:ring-primary outline-none hover:bg-primary dark:hover:bg-foreground hover:text-primary-foreground dark:hover:text-background transition-colors duration-200"
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextSlide}
                className="w-10 h-10 rounded-md border border-primary dark:border-foreground bg-transparent text-primary dark:text-foreground flex items-center justify-center button-shine focus-visible:ring-2 focus-visible:ring-primary outline-none hover:bg-primary dark:hover:bg-foreground hover:text-primary-foreground dark:hover:text-background transition-colors duration-200"
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* ── Interactive Snap Scroll Strip ── */}
      <div className="relative z-10 mb-12">
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-24 z-10 bg-gradient-to-r from-[#f5f5f5] dark:from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-24 z-10 bg-gradient-to-l from-[#f5f5f5] dark:from-background to-transparent" />

        <div
          ref={trackRef}
          className="flex overflow-x-auto snap-x snap-mandatory px-4 sm:px-8 py-4 no-scrollbar"
        >
          <div className="flex gap-4 sm:gap-6">
            {loopCards.map((card, index) => (
              <motion.div
                key={index}
                className="flex-shrink-0 w-[85vw] md:w-[calc(50vw-2rem)] lg:w-[calc(33.333vw-2rem)] xl:w-[calc(25vw-2rem)] snap-center"
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              >
                {/* Spotlight Card */}
                <div
                  className="group relative bg-background dark:bg-card rounded-xl overflow-hidden border border-border h-[250px] sm:h-[240px] xl:h-[260px] flex flex-row items-stretch shine-effect cursor-pointer"
                  role="article"
                  aria-label={card.title || 'Service card'}
                >
                  {/* Spotlight glow on hover */}
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"
                    style={{
                      background:
                        'radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(var(--primary-rgb, 24 144 255)/0.12), transparent 70%)',
                    }}
                  />

                  {/* Image — Left side */}
                  {card.image && typeof card.image === 'object' ? (
                    <div className="relative w-[110px] sm:w-[150px] lg:w-[140px] xl:w-[160px] h-full overflow-hidden bg-muted flex-shrink-0">
                      <Media
                        resource={card.image}
                        fill={true}
                        imgClassName="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="w-[110px] sm:w-[150px] lg:w-[140px] xl:w-[160px] h-full bg-accent/30 flex-shrink-0" />
                  )}

                  {/* Content — Right side */}
                  <div className="flex-1 p-3.5 sm:p-5 flex flex-col justify-between relative z-10 overflow-hidden">
                    <div>
                      {card.title && (
                        <div className="mb-1.5 sm:mb-2">
                          <h3 className="text-base sm:text-lg font-bold text-foreground line-clamp-2 leading-snug">
                            {card.title}
                          </h3>
                          {/* Animated underline */}
                          <div className="h-0.5 bg-primary w-0 group-hover:w-8 rounded-full transition-all duration-300 mt-1.5 sm:mt-2" />
                        </div>
                      )}
                      {card.subtitle && (
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 md:line-clamp-4 leading-relaxed mt-2 sm:mt-3">
                          {card.subtitle}
                        </p>
                      )}
                    </div>

                    {card.buttonLink && (
                      <div className="flex justify-end mt-2 sm:mt-4">
                        <a
                          href={card.buttonLink}
                          className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 border border-primary dark:border-foreground bg-transparent text-primary dark:text-foreground font-semibold uppercase text-[10px] sm:text-xs tracking-wide rounded-md button-shine focus-visible:ring-2 focus-visible:ring-primary outline-none hover:bg-primary dark:hover:bg-foreground hover:text-primary-foreground dark:hover:text-background transition-colors duration-200"
                          role="button"
                          aria-label={`${card.buttonText || 'View details'} – ${card.title}`}
                        >
                          <span>{card.buttonText || 'BATAFSIL'}</span>
                          <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" aria-hidden="true" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CSS to hide scrollbar explicitly for all browsers */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `,
          }}
        />
      </div>
    </section>
  )
}
