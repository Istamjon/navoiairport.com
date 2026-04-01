'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp } from 'lucide-react'

export const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  // Determine visibility and calculate scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const maxScroll = documentHeight - windowHeight

      // Show button after scrolling down 300px
      if (scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }

      // Calculate progress (0 to 100)
      if (maxScroll > 0) {
        const progress = Math.min(100, Math.max(0, (scrollY / maxScroll) * 100))
        setScrollProgress(progress)
      } else {
        setScrollProgress(0)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    // Initial check
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  // SVG Circle parameters
  const radius = 22
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          onClick={scrollToTop}
          aria-label="Yuqoriga qaytish"
          className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-background/80 dark:bg-card/80 backdrop-blur-md border border-border/50 shadow-lg text-primary hover:text-foreground transition-all duration-300 focus-visible:ring-4 focus-visible:ring-primary/50 outline-none group hover:shadow-xl hover:-translate-y-1 overflow-hidden"
        >
          {/* Progress Circle SVG */}
          <svg
            className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
            viewBox="0 0 56 56"
          >
            {/* Background ring */}
            <circle
              className="text-muted/30"
              strokeWidth="3"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="28"
              cy="28"
            />
            {/* Progress ring */}
            <motion.circle
              className="text-primary dark:text-white/40 transition-all duration-150 ease-out"
              strokeWidth="3"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="28"
              cy="28"
            />
          </svg>

          {/* Icon */}
          <div className="relative z-10 p-2 bg-background/50 rounded-full group-hover:bg-primary dark:bg-white/50 group-hover:text-primary-foreground transition-colors duration-300">
            <ArrowUp className="w-5 h-5 pointer-events-none" />
          </div>

          {/* Sparkle/Shine effect on hover */}
          <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute top-0 -left-[100%] w-[50%] h-[100%] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 animate-shine" />
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
