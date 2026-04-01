'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import type { Media as MediaType } from '@/payload-types'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { cn } from '@/utilities/ui'
import { PlaneLanding, PlaneTakeoff, Search, Calendar, MapPin } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── YouTube Video Helper ─────────────────────────────────────────────────────
const extractYouTubeVideoId = (url: string): string | null => {
  if (!url) return null

  // If it's already just an ID (11 characters)
  if (url.length === 11 && !url.includes('/') && !url.includes('?')) {
    return url
  }

  // Extract from various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

// ─── Flight Search Block ──────────────────────────────────────────────────────
interface FlightSearchLabels {
  departureTab: string
  arrivalTab: string
  destinationLabel: string
  originLabel: string
  destinationPlaceholder: string
  dateLabel: string
  searchButton: string
}

const FlightSearchBlock: React.FC<{ labels?: FlightSearchLabels }> = ({ labels }) => {
  const [tab, setTab] = useState<'departure' | 'arrival'>('departure')
  const [destination, setDestination] = useState('')
  const [date, setDate] = useState('')

  // Default labels (Uzbek)
  const defaultLabels: FlightSearchLabels = {
    departureTab: 'UCHIB KETISH',
    arrivalTab: "QO'NIB KELISH",
    destinationLabel: 'Qayerga',
    originLabel: 'Qayerdan',
    destinationPlaceholder: 'Shahar yoki aeroport',
    dateLabel: 'Sana',
    searchButton: 'QIDIRISH',
  }

  const t = labels || defaultLabels

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="w-full max-w-3xl mx-auto"
    >
      <div className="flex rounded-t-md overflow-hidden mb-0 relative">
        {/* Active tab indicator */}
        <motion.div
          className="absolute bottom-0 h-1 bg-white"
          initial={false}
          animate={{
            left: tab === 'departure' ? '0%' : '50%',
            width: '50%',
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />

        <motion.button
          type="button"
          onClick={() => setTab('departure')}
          whileTap={{ y: 1 }}
          className={cn(
            'flex-1 flex items-center justify-start gap-2 px-6 py-3.5 text-sm font-semibold transition-colors duration-300 button-shine',
            tab === 'departure'
              ? 'bg-white/90 text-primary hover:bg-white'
              : 'bg-primary text-white hover:bg-primary/90',
          )}
        >
          <PlaneTakeoff className="size-4" />
          {t.departureTab}
        </motion.button>

        <motion.button
          type="button"
          onClick={() => setTab('arrival')}
          whileTap={{ y: 1 }}
          className={cn(
            'flex-1 flex items-center justify-start gap-2 px-5 py-3.5 text-sm font-semibold transition-colors duration-300 button-shine',
            tab === 'arrival'
              ? 'bg-white/90 text-primary hover:bg-white'
              : 'bg-primary text-white hover:bg-primary/90',
          )}
        >
          <PlaneLanding className="size-4" />
          {t.arrivalTab}
        </motion.button>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="bg-white/80 backdrop-blur-sm p-5 rounded-b-md flex flex-col sm:flex-row gap-3 items-end"
      >
        {/* Destination / Origin */}
        <motion.div
          key={tab}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 w-full"
        >
          <label className="block text-[10px] font-semibold text-gray-500 tracking-widest uppercase mb-1.5">
            {tab === 'departure' ? t.destinationLabel : t.originLabel}
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <motion.input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder={t.destinationPlaceholder}
              whileFocus={{ borderColor: '#000827' }}
              className="rounded-md w-full h-11 pl-9 pr-3 text-sm text-gray-800 border border-gray-400 focus:border-primary focus:outline-none placeholder:text-gray-400 transition-colors"
            />
          </div>
        </motion.div>

        {/* Date */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex-1 w-full"
        >
          <label className="block text-[10px] font-semibold text-gray-500 tracking-widest uppercase mb-1.5">
            {t.dateLabel}
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
            <motion.input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              whileFocus={{ borderColor: '#0a1628' }}
              className="rounded-md w-full h-11 pl-9 pr-3 text-sm text-primary border border-gray-400 focus:border-[#0a1628] focus:outline-none transition-colors appearance-none"
            />
          </div>
        </motion.div>

        {/* Submit */}
        <motion.button
          type="button"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          whileTap={{ y: 1 }}
          className={cn(
            'h-11 px-6 flex items-center gap-2 text-sm font-bold tracking-wide rounded-md',
            'bg-primary text-white hover:bg-primary/90',
            'transition-all duration-200 whitespace-nowrap shrink-0 button-shine',
          )}
        >
          <Search className="size-4" />
          {t.searchButton}
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

// ─── Main NiaHero ─────────────────────────────────────────────────────────────

export const NiaHero: React.FC<{
  media?: MediaType
  richText?: any
  backgroundType?: 'images' | 'video'
  slideshowImages?: MediaType[]
  youtubeVideoUrl?: string | null
  departureTab?: string
  arrivalTab?: string
  destinationLabel?: string
  originLabel?: string
  destinationPlaceholder?: string
  dateLabel?: string
  searchButton?: string
}> = ({
  media,
  richText,
  backgroundType = 'images',
  slideshowImages,
  youtubeVideoUrl,
  departureTab,
  arrivalTab,
  destinationLabel,
  originLabel,
  destinationPlaceholder,
  dateLabel,
  searchButton,
}) => {
  const { setHeaderTheme } = useHeaderTheme()
  const [mounted, setMounted] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [firstSlideLoaded, setFirstSlideLoaded] = useState(false)
  const slideIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Determine background type and content
  const isVideoBackground = backgroundType === 'video' && youtubeVideoUrl
  const videoId = isVideoBackground ? extractYouTubeVideoId(youtubeVideoUrl || '') : null

  // Use slideshow images if available, otherwise fallback to single media
  const images =
    slideshowImages && slideshowImages.length > 0 ? slideshowImages : media ? [media] : []
  const hasMultipleImages = images.length > 1

  useEffect(() => {
    setHeaderTheme('dark')
    // Trigger entrance animation
    const id = setTimeout(() => setMounted(true), 100)
    // Trigger first slide fade-in
    const slideId = setTimeout(() => setFirstSlideLoaded(true), 300)
    return () => {
      clearTimeout(id)
      clearTimeout(slideId)
    }
  }, [setHeaderTheme])

  // Slideshow effect (only for image backgrounds)
  useEffect(() => {
    if (isVideoBackground || !hasMultipleImages) return

    slideIntervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length)
    }, 10000) // Change slide every 10 seconds to match Ken Burns animation duration

    return () => {
      if (slideIntervalRef.current) {
        clearInterval(slideIntervalRef.current)
      }
    }
  }, [isVideoBackground, hasMultipleImages, images.length])

  return (
    <>
      <div
        className="relative flex flex-col items-left justify-center text-white min-h-[65vh]   overflow-hidden"
        data-theme="dark"
      >
        <div className="absolute inset-0 z-0">
          {isVideoBackground && videoId ? (
            // YouTube Video Background
            <>
              <div className="absolute inset-0 w-full h-full overflow-hidden">
                <iframe
                  className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2"
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`}
                  title="Background video"
                  allow="autoplay; encrypted-media"
                  allowFullScreen={false}
                  style={{ pointerEvents: 'none' }}
                />
              </div>
              <div className="absolute inset-0 bg-black/40" />
            </>
          ) : (
            // Image Slideshow Background with Framer Motion
            <AnimatePresence initial={false} mode="sync">
              {images.map((img, index) => {
                const isActive = index === currentSlide
                const isSingleImage = images.length === 1

                // Ken Burns variants with framer-motion
                const kenBurnsVariants = [
                  { scale: [1, 1.08], x: [0, 0], y: [0, 0] }, // zoom-in
                  { scale: [1, 1.08], x: [0, -30], y: [0, 0] }, // zoom-pan-right
                  { scale: [1, 1.08], x: [0, 30], y: [0, 0] }, // zoom-pan-left
                  { scale: [1.03, 1.08], x: [0, 0], y: [0, -20] }, // pan-up
                ]
                const kenBurnsAnimation = kenBurnsVariants[index % kenBurnsVariants.length]

                if (!isActive && !isSingleImage) return null

                return (
                  <motion.div
                    key={`slide-${index}`}
                    initial={{ opacity: index === 0 && !firstSlideLoaded ? 0 : isActive ? 0 : 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      opacity: { duration: 2.5, ease: [0.45, 0, 0.55, 1] },
                    }}
                    className="absolute inset-0 z-10"
                    style={{ position: 'absolute' }}
                  >
                    {img && typeof img === 'object' && (
                      <motion.div
                        initial={{
                          scale: kenBurnsAnimation.scale[0],
                          x: kenBurnsAnimation.x[0],
                          y: kenBurnsAnimation.y[0],
                        }}
                        animate={{
                          scale: kenBurnsAnimation.scale[1],
                          x: kenBurnsAnimation.x[1],
                          y: kenBurnsAnimation.y[1],
                        }}
                        transition={{
                          duration: 10,
                          ease: [0.25, 0.46, 0.45, 0.94],
                        }}
                        className="relative w-full h-full overflow-hidden"
                      >
                        <Media
                          fill
                          imgClassName="object-cover object-center"
                          priority={index === 0}
                          resource={img}
                        />
                      </motion.div>
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>
          )}

          {/* Overlay Gradients - Above images */}
          <div className="absolute inset-0 z-30 bg-gradient-to-b from-black/40 via-black/30 to-black/70 pointer-events-none" />

          <div
            className="absolute inset-0 z-11 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)',
            }}
          />
        </div>

        <div className="container relative z-10 flex flex-col items-left text-left gap-8 pt-4 pb-16">
          <div
            className={cn(
              'max-w-4xl transition-all duration-700 bg-black/50 border-l-10 border-white/50  pl-10  py-4   delay-100',
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
            )}
          >
            {richText ? (
              <RichText
                className="[&_h1]:text-md [&_h1]:md:text-md [&_h1]:font-bold [&_h1]:leading-tight [&_h1]:tracking-tight [&_h1]:text-white [&_p]:text-lg [&_p]:text-white/70 [&_p]:mt-4 px-4 lg:px-0 "
                data={richText}
                enableGutter={false}
              />
            ) : (
              <div></div>
            )}
          </div>

          {/* Flight Search */}
          <div
            className={cn(
              'w-full max-w-2xl transition-all px-4 lg:px-0   duration-700 delay-200',
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
            )}
          >
            <FlightSearchBlock
              labels={{
                departureTab: departureTab || 'UCHIB KETISH',
                arrivalTab: arrivalTab || "QO'NIB KELISH",
                destinationLabel: destinationLabel || 'Qayerga',
                originLabel: originLabel || 'Qayerdan',
                destinationPlaceholder: destinationPlaceholder || 'Shahar yoki aeroport',
                dateLabel: dateLabel || 'Sana',
                searchButton: searchButton || 'QIDIRISH',
              }}
            />
          </div>
        </div>
      </div>
    </>
  )
}
