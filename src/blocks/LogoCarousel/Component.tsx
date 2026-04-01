'use client'

import React from 'react'
import { Media } from '@/components/Media'
import Link from 'next/link'
import { motion } from 'framer-motion'

export type LogoCarouselProps = {
  blockType: 'logoCarousel'
  backgroundColor?: 'white' | 'gray'
  speed?: number
  logos?: Array<{
    logo: any
    link?: string
    id?: string
  }>
}

export const LogoCarouselComponent: React.FC<LogoCarouselProps> = ({
  backgroundColor = 'white',
  speed = 30,
  logos,
}) => {
  if (!logos || logos.length === 0) return null

  // Duplicate logos multiple times so it fills ultra-wide screens smoothly without ending before the loop.
  // Standard practice for infinite marquees is to duplicate it at least twice.
  const duplicatedLogos = [...logos, ...logos, ...logos, ...logos]

  const bgClass =
    backgroundColor === 'gray' ? 'bg-[#F5F5F5] dark:bg-zinc-900' : 'bg-white dark:bg-background'

  return (
    <div className={`py-10 md:py-24 overflow-hidden ${bgClass}`}>
      {/* Infinite loop container */}
      <div className="relative w-full flex overflow-hidden group">
        <motion.div
          className="flex flex-shrink-0 flex-nowrap min-w-full"
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            repeat: Infinity,
            ease: 'linear',
            duration: speed * 2, // Doubled because we have 4 sets instead of 2, so it travels further
          }}
        >
          {duplicatedLogos.map((item, index) => {
            const hasLink = Boolean(item.link)

            const MediaElement = (
              <div className="relative h-12 w-32 sm:h-14 sm:w-40 md:h-16 md:w-48 lg:h-20 lg:w-56 flex items-center justify-center transition-transform duration-300 transform hover:scale-110">
                {typeof item.logo === 'object' && item.logo !== null && (
                  <Media
                    resource={item.logo}
                    className="w-full h-full flex items-center justify-center p-2"
                    imgClassName="max-h-full w-auto object-contain"
                  />
                )}
              </div>
            )

            return (
              <div
                key={`${item.id || index}-${index}`}
                className="flex-shrink-0 px-4 sm:px-6 md:px-8 lg:px-10" // Horizontal padding acts as the gap, ensuring seamless loop calculations
              >
                {hasLink ? (
                  <Link href={item.link as string} target="_blank" rel="noopener noreferrer">
                    {MediaElement}
                  </Link>
                ) : (
                  MediaElement
                )}
              </div>
            )
          })}
        </motion.div>
      </div>
    </div>
  )
}
