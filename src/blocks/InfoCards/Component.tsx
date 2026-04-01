'use client'

import React from 'react'
import { motion } from 'framer-motion'
import type { InfoCardsBlock } from '@/payload-types'
import { Media } from '@/components/Media'
import { CMSLink } from '@/components/Link'
import { cn } from '@/utilities/ui'

export const InfoCardsComponent: React.FC<InfoCardsBlock> = ({ title, subtitle, cards }) => {
  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVars = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, damping: 20 } },
  }

  return (
    <section className="bg-[#f5f5f5] dark:bg-background px-4 md:px-0 lg:px-0 py-16 md:py-24 overflow-hidden border-t border-border/50">
      <div className="container relative z-10">
        <div className="mb-10 md:mb-14">
          {title && (
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-[#0B1E4A] dark:text-foreground tracking-tight uppercase">
              {title}
            </h2>
          )}
          {subtitle && <p className="text-lg text-muted-foreground max-w-2xl">{subtitle}</p>}
        </div>

        {cards && cards.length > 0 && (
          <motion.div
            variants={containerVars}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {cards.map((card: any, index: number) => {
              const isHighlight = card.style === 'highlight'
              const link = card.link

              // Apply masonry logic: first item is large (spans 2 cols, 2 rows on large screens)
              const isFirst = index === 0

              const CardContent = (
                <motion.div
                  variants={itemVars}
                  className={cn(
                    'group relative h-full min-h-[280px] md:min-h-[320px] rounded-md p-4 md:p-6 flex flex-col justify-end overflow-hidden transition-all duration-300 border border-border/60 shine-effect',
                    isHighlight
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background dark:bg-card text-foreground',
                  )}
                >
                  {/* FULL CARD IMAGE */}
                  {card.cardImage && typeof card.cardImage === 'object' && (
                    <div className="absolute inset-0 z-0 transform group-hover:scale-105 transition-transform duration-500 pointer-events-none">
                      <Media
                        resource={card.cardImage}
                        fill={true}
                        imgClassName="object-cover object-center w-full h-full"
                        priority={index < 4}
                      />
                    </div>
                  )}

                  {/* GRADIENT OVERLAY FOR PREMIUM TEXT CONTRAST */}
                  <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#0B1E4A]/90 via-[#0B1E4A]/40 to-transparent pointer-events-none transition-opacity duration-300 group-hover:opacity-90" />

                  {/* PRO MAX TRANSPARENT TEXT CONTAINER */}
                  <div className="relative z-10 w-full p-5 md:p-6 lg:p-8 mt-auto pointer-events-none flex flex-col gap-2">
                    <h3
                      className={cn(
                        'font-bold leading-tight transition-colors drop-shadow-sm',
                        isFirst ? 'text-2xl md:text-3xl lg:text-4xl' : 'text-xl md:text-2xl',
                        'text-white',
                      )}
                    >
                      {card.cardTitle}
                    </h3>
                    <p
                      className={cn(
                        'leading-relaxed text-white/90 drop-shadow-sm',
                        isFirst ? 'text-base lg:text-lg max-w-[90%]' : 'text-sm',
                      )}
                    >
                      {card.cardDescription}
                    </p>
                  </div>
                </motion.div>
              )

              const wrapperClass = cn(
                'block w-full h-full',
                isFirst ? 'lg:col-span-2 lg:row-span-2' : 'lg:col-span-1 lg:row-span-1',
              )

              if (link && link.url) {
                return (
                  <CMSLink
                    key={index}
                    {...link}
                    label={null}
                    className={cn(
                      wrapperClass,
                      'no-underline outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md cursor-pointer block',
                    )}
                  >
                    {CardContent}
                  </CMSLink>
                )
              }

              return (
                <div key={index} className={cn(wrapperClass, 'cursor-default')}>
                  {CardContent}
                </div>
              )
            })}
          </motion.div>
        )}
      </div>
    </section>
  )
}
