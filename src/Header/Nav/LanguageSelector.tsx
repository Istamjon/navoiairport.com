'use client'
import React, { useState, useEffect, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/utilities/ui'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

// ─── Flag SVGs ────────────────────────────────────────────────────────────────
// Each flag matches the Payload CMS locale code in the LANGUAGES array below.

const FlagUZ = () => (
  <svg
    viewBox="0 0 30 20"
    xmlns="http://www.w3.org/2000/svg"
    className="shrink-0"
    style={{ width: 20, height: 14 }}
    aria-hidden="true"
  >
    {/* Uzbekistan: blue / white / green stripes with red dividers */}
    <rect width="30" height="6.67" fill="#1EB53A" />
    <rect y="6.67" width="30" height="6.67" fill="#FFFFFF" />
    <rect y="13.33" width="30" height="6.67" fill="#0099B5" />
    <rect y="6.47" width="30" height="0.6" fill="#CE1126" />
    <rect y="12.93" width="30" height="0.6" fill="#CE1126" />
    {/* Crescent moon */}
    <circle cx="5" cy="3.33" r="2.2" fill="#FFFFFF" />
    <circle cx="6.1" cy="3.33" r="1.8" fill="#1EB53A" />
    {/* 12 small stars in two rows */}
    <g fill="#FFFFFF">
      <circle cx="9" cy="1.8" r="0.45" />
      <circle cx="10.5" cy="1.8" r="0.45" />
      <circle cx="12" cy="1.8" r="0.45" />
      <circle cx="13.5" cy="1.8" r="0.45" />
      <circle cx="9" cy="3.6" r="0.45" />
      <circle cx="10.5" cy="3.6" r="0.45" />
      <circle cx="12" cy="3.6" r="0.45" />
      <circle cx="13.5" cy="3.6" r="0.45" />
      <circle cx="9.75" cy="2.7" r="0.45" />
      <circle cx="11.25" cy="2.7" r="0.45" />
      <circle cx="12.75" cy="2.7" r="0.45" />
    </g>
  </svg>
)

const FlagRU = () => (
  <svg
    viewBox="0 0 30 20"
    xmlns="http://www.w3.org/2000/svg"
    className="shrink-0"
    style={{ width: 20, height: 14 }}
    aria-hidden="true"
  >
    <rect width="30" height="6.67" fill="#FFFFFF" />
    <rect y="6.67" width="30" height="6.67" fill="#0039A6" />
    <rect y="13.33" width="30" height="6.67" fill="#D52B1E" />
  </svg>
)

const FlagEN = () => (
  <svg
    viewBox="0 0 30 20"
    xmlns="http://www.w3.org/2000/svg"
    className="shrink-0"
    style={{ width: 20, height: 14 }}
    aria-hidden="true"
  >
    <rect width="30" height="20" fill="#012169" />
    {/* White diagonals */}
    <line x1="0" y1="0" x2="30" y2="20" stroke="#fff" strokeWidth="4" />
    <line x1="30" y1="0" x2="0" y2="20" stroke="#fff" strokeWidth="4" />
    {/* Red diagonals */}
    <line x1="0" y1="0" x2="30" y2="20" stroke="#C8102E" strokeWidth="2.4" />
    <line x1="30" y1="0" x2="0" y2="20" stroke="#C8102E" strokeWidth="2.4" />
    {/* White cross */}
    <rect x="12" y="0" width="6" height="20" fill="#fff" />
    <rect x="0" y="7" width="30" height="6" fill="#fff" />
    {/* Red cross */}
    <rect x="13.2" y="0" width="3.6" height="20" fill="#C8102E" />
    <rect x="0" y="8.2" width="30" height="3.6" fill="#C8102E" />
  </svg>
)

const FlagZH = () => (
  <svg
    viewBox="0 0 30 20"
    xmlns="http://www.w3.org/2000/svg"
    className="shrink-0"
    style={{ width: 20, height: 14 }}
    aria-hidden="true"
  >
    <rect width="30" height="20" fill="#DE2910" />
    {/* Large star — 5-pointed, centered near left */}
    <polygon
      points="5,2 6.18,5.64 9.51,5.64 6.82,7.73 7.94,11.36 5,9.27 2.06,11.36 3.18,7.73 0.49,5.64 3.82,5.64"
      fill="#FFDE00"
    />
    {/* Four small stars */}
    <polygon
      points="11,1 11.59,2.77 13.42,2.77 11.97,3.83 12.56,5.59 11,4.54 9.44,5.59 10.03,3.83 8.58,2.77 10.41,2.77"
      fill="#FFDE00"
      transform="scale(0.5) translate(11,1)"
    />
    <polygon
      points="14,4 14.59,5.77 16.42,5.77 14.97,6.83 15.56,8.59 14,7.54 12.44,8.59 13.03,6.83 11.58,5.77 13.41,5.77"
      fill="#FFDE00"
      transform="scale(0.5) translate(13,3)"
    />
    <polygon
      points="14,8 14.59,9.77 16.42,9.77 14.97,10.83 15.56,12.59 14,11.54 12.44,12.59 13.03,10.83 11.58,9.77 13.41,9.77"
      fill="#FFDE00"
      transform="scale(0.5) translate(11,9)"
    />
    <polygon
      points="11,10 11.59,11.77 13.42,11.77 11.97,12.83 12.56,14.59 11,13.54 9.44,14.59 10.03,12.83 8.58,11.77 10.41,11.77"
      fill="#FFDE00"
      transform="scale(0.5) translate(8,12)"
    />
  </svg>
)

// ─── Locale config — codes MUST match payload.config.ts localization.locales ──
const LANGUAGES = [
  { code: 'uz', label: "O'zbek", Flag: FlagUZ },
  { code: 'ru', label: 'Русский', Flag: FlagRU },
  { code: 'en', label: 'English', Flag: FlagEN },
  { code: 'zh', label: '中文', Flag: FlagZH },
] as const

type LangCode = (typeof LANGUAGES)[number]['code']

const COOKIE_NAME = 'payload-locale'

/** Read the current locale from the cookie (client-side only). */
function getLocaleFromCookie(): LangCode {
  if (typeof document === 'undefined') return 'uz'
  const match = document.cookie.split('; ').find((row) => row.startsWith(`${COOKIE_NAME}=`))
  const value = match?.split('=')[1] as LangCode | undefined
  return LANGUAGES.some((l) => l.code === value) ? (value as LangCode) : 'uz'
}

export const LanguageSelector: React.FC<{ mobile?: boolean }> = ({ mobile = false }) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selected, setSelected] = useState<LangCode>('uz')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Hydrate from cookie on mount
  useEffect(() => {
    setSelected(getLocaleFromCookie())
  }, [])

  // Close dropdown on outside click (desktop only)
  useEffect(() => {
    if (mobile) return
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [mobile])

  // Close dropdown on Escape key (desktop only)
  useEffect(() => {
    if (mobile) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [mobile])

  const handleSelect = (code: LangCode) => {
    setSelected(code)
    setOpen(false)

    // Persist in cookie — Payload CMS picks this up server-side
    document.cookie = `${COOKIE_NAME}=${code}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`

    // Refresh all server components so they re-fetch in the new locale
    startTransition(() => {
      router.refresh()
    })
  }

  const current = LANGUAGES.find((l) => l.code === selected) ?? LANGUAGES[0]

  // Mobile version - inline flags
  if (mobile) {
    return (
      <div className="flex items-center gap-2" role="group" aria-label="Language selector">
        {LANGUAGES.map(({ code, label, Flag }) => (
          <motion.button
            key={code}
            type="button"
            onClick={() => handleSelect(code)}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'p-2 rounded-md transition-all duration-200',
              code === selected ? 'bg-white/20  ' : 'bg-white/10',
              isPending && 'opacity-60 pointer-events-none',
            )}
            aria-label={`Switch to ${label}`}
            aria-pressed={code === selected}
          >
            <Flag />
          </motion.button>
        ))}
      </div>
    )
  }

  // Desktop version - dropdown
  return (
    <div ref={ref} className="relative">
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        whileTap={{ y: 1 }}
        className={cn(
          'flex items-center gap-1.5 px-2 py-3  text-sm font-medium',
          'text-white transition-colors   hover:text-white',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          isPending && 'opacity-60 pointer-events-none',
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Tilni tanlash / Select language"
      >
        <current.Flag />
        <span className="hidden sm:inline rounded-md">{current.label}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown className="size-3.5 text-white" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            aria-label="Language options"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="absolute right-0 mt-2 min-w-max bg-white border border-blue-300/5 rounded-md shadow-lg p-2 z-50 overflow-hidden"
          >
            <div className="flex flex-col gap-1">
              {LANGUAGES.map(({ code, label, Flag }, i) => (
                <motion.button
                  key={code}
                  type="button"
                  role="option"
                  aria-selected={code === selected}
                  onClick={() => handleSelect(code)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 text-sm transition-all duration-300 rounded-md whitespace-nowrap',
                    code === selected
                      ? 'bg-primary   text-white'
                      : 'text-primary hover:bg-primary/50',
                  )}
                >
                  <Flag />
                  <span>{label}</span>
                  {code === selected && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="ml-auto text-white text-xs"
                      aria-hidden="true"
                    >
                      ✓
                    </motion.span>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
