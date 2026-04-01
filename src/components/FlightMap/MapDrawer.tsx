'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Phone } from 'lucide-react'
import MapChart from './MapChart'
import { getLocaleFromCookie } from './getLocale'

const STRINGS: Record<string, Record<string, string>> = {
  uz: {
    title: 'Navoiy Xalqaro Aeroporti Qatnovlari',
    airportName: 'Navoiy Xalqaro Aeroporti',
    address: 'Manzil: Navoiy viloyati, Karmana tumani',
    phone: 'Telefon: +998 79 220 5000',
    maps: "Google Maps da ko'ring",
  },
  ru: {
    title: 'Рейсы Международного Аэропорта Навои',
    airportName: 'Международный Аэропорт Навои',
    address: 'Адрес: Навоийская область, Карманинский район',
    phone: 'Телефон: +998 79 220 5000',
    maps: 'Открыть в Google Maps',
  },
  en: {
    title: 'Navoi International Airport — Flight Routes',
    airportName: 'Navoi International Airport',
    address: 'Address: Navoi Region, Karmana district',
    phone: 'Phone: +998 79 220 5000',
    maps: 'View on Google Maps',
  },
  zh: {
    title: '纳沃伊国际机场航线图',
    airportName: '纳沃伊国际机场',
    address: '地址：纳沃伊州，卡尔马纳区',
    phone: '电话：+998 79 220 5000',
    maps: '在 Google Maps 中查看',
  },
}

export const MapDrawer = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [locale, setLocale] = useState('uz')
  const [textVisible, setTextVisible] = useState(true)

  // Initial locale from cookie
  useEffect(() => {
    setLocale(getLocaleFromCookie())
  }, [])

  // Poll for locale changes
  useEffect(() => {
    const interval = setInterval(() => {
      const newLocale = getLocaleFromCookie()
      if (newLocale !== locale) {
        // Fade out → swap → fade in
        setTextVisible(false)
        setTimeout(() => {
          setLocale(newLocale)
          setTextVisible(true)
        }, 350)
      }
    }, 800)
    return () => clearInterval(interval)
  }, [locale])

  const t = STRINGS[locale] ?? STRINGS['uz']

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // #5: Close on Escape key
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )
  useEffect(() => {
    if (!isOpen) return
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, handleEscape])

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50000, display: 'flex' }}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Drawer — 75% width on md+, full on mobile */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              width: 'clamp(100%, 75vw, 1200px)',
              maxWidth: '1200px',
              height: '100dvh',
              background: 'var(--color-background, #fff)',
              boxShadow: '8px 0 32px rgba(0,0,0,0.2)',
              zIndex: 50001,
              borderRight: '1px solid var(--color-border, #e5e7eb)',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 24px',
                borderBottom: '1px solid var(--color-border, #e5e7eb)',
                background: 'var(--color-primary, #1e40af)',
                flexShrink: 0,
                opacity: textVisible ? 1 : 0,
                transition: 'opacity 0.35s ease',
              }}
            >
              <h2
                style={{
                  fontSize: 'clamp(14px, 2vw, 20px)',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: '#fff',
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  textTransform: 'uppercase',
                }}
              >
                {t.title}
              </h2>
              <button
                onClick={onClose}
                aria-label="Close"
                style={{
                  marginLeft: '16px',
                  padding: '8px',
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'background 0.2s',
                  color: '#fff',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Map Area */}
            <div style={{ flexGrow: 1, position: 'relative', minHeight: 0 }}>
              <MapChart />
            </div>

            {/* Contact Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid var(--color-border, #e5e7eb)',
                background: 'var(--color-card, #f9fafb)',
                flexShrink: 0,
                opacity: textVisible ? 1 : 0,
                transition: 'opacity 0.35s ease',
              }}
            >
              <div
                style={{
                  borderRadius: '8px',
                  background: 'var(--color-muted, #f3f4f6)',
                  padding: '16px',
                  border: '1px solid var(--color-border, #e5e7eb)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '16px',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  fontSize: '14px',
                }}
              >
                {/* Left: Airport name */}
                <div>
                  <p
                    style={{
                      fontWeight: 700,
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      margin: '0 0 4px',
                      color: 'var(--color-foreground, #111)',
                    }}
                  >
                    <PlaneIcon />
                    {t.airportName}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      opacity: 0.7,
                      fontWeight: 500,
                      color: 'var(--color-muted-foreground, #6b7280)',
                    }}
                  >
                    NVI · UTAE
                  </p>
                </div>

                {/* Right: Contact details */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    color: 'var(--color-muted-foreground, #6b7280)',
                  }}
                >
                  <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin
                      size={16}
                      color="var(--color-primary, #1D4ED8)"
                      style={{ flexShrink: 0 }}
                    />
                    {t.address}
                  </p>
                  <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone
                      size={16}
                      color="var(--color-primary, #1D4ED8)"
                      style={{ flexShrink: 0 }}
                    />
                    {t.phone}
                  </p>
                  <a
                    href="https://maps.app.goo.gl/5bMkuFeqkaDqNFNE7"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: 'var(--color-primary, #1D4ED8)',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    {t.maps} →
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function PlaneIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: 'var(--color-primary, #1D4ED8)' }}
    >
      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.5l-1.3 2.6c-.2.4.1.9.5 1l6.7 1.8L8 15l-3.2-1.1c-.5-.2-1 .1-1.2.5l-.8 1.6c-.2.4.1.9.5 1l4.7 1 3-3" />
    </svg>
  )
}
