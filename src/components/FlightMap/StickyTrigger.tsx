'use client'

import React from 'react'
import { Plane } from 'lucide-react'
import { getLocaleFromCookie } from './getLocale'

const LABELS: Record<string, string> = {
  uz: 'Parvozlar xaritasi',
  ru: 'Карта рейсов',
  en: 'Flight Map',
  zh: '航班地图',
}

interface StickyTriggerProps {
  onClick: () => void
  isOpen: boolean
}

export const StickyTrigger = ({ onClick, isOpen }: StickyTriggerProps) => {
  const [label, setLabel] = React.useState('Parvozlar xaritasi')
  const [displayLabel, setDisplayLabel] = React.useState('Parvozlar xaritasi')
  const [labelOpacity, setLabelOpacity] = React.useState(1)
  const [hovered, setHovered] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const handler = (e: MediaQueryListEvent | MediaQueryList) => setIsMobile(e.matches)
    handler(mq)
    mq.addEventListener('change', handler as (e: MediaQueryListEvent) => void)
    return () => mq.removeEventListener('change', handler as (e: MediaQueryListEvent) => void)
  }, [])

  React.useEffect(() => {
    const locale = getLocaleFromCookie()
    const newLabel = LABELS[locale] ?? LABELS['uz']
    setLabel(newLabel)
    setDisplayLabel(newLabel)
  }, [])

  // Slow fade whenever label changes (language switch)
  React.useEffect(() => {
    if (displayLabel === label) return
    setLabelOpacity(0)
    const timer = setTimeout(() => {
      setDisplayLabel(label)
      setLabelOpacity(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [label, displayLabel])

  // Poll for locale changes (e.g., when user switches language in the header)
  React.useEffect(() => {
    const interval = setInterval(() => {
      const locale = getLocaleFromCookie()
      const newLabel = LABELS[locale] ?? LABELS['uz']
      if (newLabel !== label) setLabel(newLabel)
    }, 800)
    return () => clearInterval(interval)
  }, [label])

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={displayLabel}
      style={{
        position: 'fixed',
        left: 0,
        top: '50%',
        transform: isOpen
          ? 'translateY(-50%) translateX(-120%)'
          : hovered
            ? 'translateY(-50%) scaleX(1.06)'
            : 'translateY(-50%) scaleX(1)',
        opacity: isOpen ? 0 : 1,
        pointerEvents: isOpen ? 'none' : 'auto',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: isMobile ? '6px' : '10px',
        padding: isMobile ? '10px 6px' : '16px 10px',
        background: 'var(--color-primary, #1D4ED8)',
        color: 'var(--color-primary-foreground, #fff)',
        borderRadius: isMobile ? '0 8px 8px 0' : '0 12px 12px 0',

        border: '1px solid rgba(255,255,255,0.2)',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s ease',
        outline: 'none',
      }}
    >
      {/* Shimmer on hover */}
      <span
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(135deg, transparent 20%, rgba(255,255,255,0.28) 50%, transparent 80%)',
          transform: hovered ? 'translateX(200%) skewX(-20deg)' : 'translateX(-200%) skewX(-20deg)',
          transition: 'transform 0.6s ease',
        }}
      />

      {/* Icon */}
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '50%',
          padding: isMobile ? '5px' : '7px',
          zIndex: 1,
        }}
      >
        <Plane size={isMobile ? 14 : 18} />
      </span>

      {/* Vertical Text — fades on locale change */}
      <span
        style={{
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          fontWeight: 600,
          letterSpacing: isMobile ? '0.12em' : '0.18em',
          fontSize: isMobile ? '10px' : '13px',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          zIndex: 1,
          opacity: labelOpacity,
          transition: 'opacity 0.4s ease',
        }}
      >
        {displayLabel}
      </span>
    </button>
  )
}
