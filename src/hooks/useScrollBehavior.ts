'use client'
import { useEffect, useRef, useState } from 'react'

interface ScrollBehavior {
  /** true when scrolled more than `threshold` px from top */
  scrolled: boolean
  /** true when user is actively scrolling downward */
  hidden: boolean
}

/**
 * Tracks scroll direction and position.
 * - `scrolled`: add backdrop-blur / shadow when true
 * - `hidden`:   hide topbar when true
 */
export function useScrollBehavior(threshold = 60): ScrollBehavior {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const lastY = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > threshold)
      // Hide topbar when scrolling down past threshold, show when scrolling up
      setHidden(y > threshold && y > lastY.current)
      lastY.current = y
    }

    // passive for perf
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return { scrolled, hidden }
}
