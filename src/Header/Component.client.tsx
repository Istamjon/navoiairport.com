'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { useScrollBehavior } from '@/hooks/useScrollBehavior'
import { cn } from '@/utilities/ui'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, PhoneCall } from 'lucide-react'

import type { Header } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'
import { Topbar } from './Topbar'
import { LanguageSelector } from './Nav/LanguageSelector'
import type { NavItem } from './Nav/NavMenu'
import { resolveHref } from './Nav/NavMenu'
import { ChevronDown } from 'lucide-react'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()
  const { scrolled, hidden: topbarHidden } = useScrollBehavior(50)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({})

  const toggleAccordion = (id: string) => {
    setOpenAccordions((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  useEffect(() => {
    setHeaderTheme(null)
  }, [pathname]) // eslint-disable-line

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
  }, [headerTheme]) // eslint-disable-line

  return (
    <div className="fixed inset-x-0 top-0 z-30">
      {/* ── Topbar - Hidden on mobile ────────────────────────────────────────────── */}
      <div className="hidden md:block">
        <Topbar hidden={topbarHidden} />
      </div>

      {/* ── Main Header ───────────────────────────────────────── */}
      <header
        className={cn(
          'w-full border-b transition-all duration-300',
          // Primary color background
          scrolled ? 'bg-primary     border-white ' : 'bg-primary  border-blue-300 ',
        )}
        style={
          {
            '--header-height': '60px',
            // Sync top offset with topbar visibility
            transition: 'background-color 300ms,  300ms, border-color 300ms',
          } as React.CSSProperties
        }
        {...(theme ? { 'data-theme': theme } : {})}
      >
        <div className="container flex items-center justify-between h-[60px] text-white">
          {/* Logo */}
          <Link href="/" aria-label="Navoi International Airport">
            <Logo loading="eager" priority="high" className="brightness-0 invert h-7 w-auto" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:block">
            <HeaderNav data={data} />
          </div>

          {/* Mobile Hamburger */}
          <motion.button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            whileTap={{ scale: 0.95 }}
            className="md:hidden p-2 text-white"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </motion.button>
        </div>
      </header>

      {/* Mobile Off-Canvas Menu - Right Side */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Off-Canvas Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-[280px] bg-primary shadow-2xl z-50 md:hidden overflow-y-auto"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center justify-between p-4 border-b border-white/10"
                >
                  <Logo
                    loading="eager"
                    priority="high"
                    className="brightness-0 invert h-8 w-auto"
                  />
                  <motion.button
                    onClick={() => setMobileMenuOpen(false)}
                    whileHover={{ rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 text-white hover:bg-white/10 rounded-md transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="size-6" />
                  </motion.button>
                </motion.div>

                {/* Navigation Section */}
                <nav className="flex-1 py-4 px-3">
                  <div className="space-y-1.5">
                    {data?.navItems && Array.isArray(data.navItems) && data.navItems.length > 0 ? (
                      (data.navItems as NavItem[]).map((item, i) => {
                        const href = resolveHref(item.link)
                        const hasSubItems = item.subItems && item.subItems.length > 0

                        // Show item if it has valid href OR has subItems
                        if (!hasSubItems && (!href || href === '#')) return null

                        const accordionId = item.id ?? `item-${i}`
                        const isOpen = openAccordions[accordionId] ?? false

                        return (
                          <motion.div
                            key={accordionId}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.25 + i * 0.05 }}
                          >
                            {/* Category Header - Clickable */}
                            <button
                              onClick={() => toggleAccordion(accordionId)}
                              className="w-full flex items-center justify-between px-3 py-2 text-white/80 hover:text-white hover:bg-white/5 rounded-md transition-all duration-200 group"
                            >
                              <span className="text-sm font-bold uppercase tracking-wide">
                                {item.link.label}
                              </span>
                              {hasSubItems && (
                                <motion.div
                                  animate={{ rotate: isOpen ? 180 : 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <ChevronDown className="size-4 text-white/60 group-hover:text-white/80" />
                                </motion.div>
                              )}
                            </button>

                            {/* SubItems - Accordion */}
                            <AnimatePresence initial={false}>
                              {hasSubItems && isOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                                  className="overflow-hidden"
                                >
                                  <div className="space-y-0.5 pl-1 pt-1">
                                    {item.subItems!.map((subItem, j) => {
                                      const subHref = resolveHref(subItem.link)
                                      if (!subHref || subHref === '#') return null

                                      return (
                                        <motion.div
                                          key={subItem.id ?? j}
                                          initial={{ opacity: 0, x: 10 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: j * 0.03 }}
                                        >
                                          <Link
                                            href={subHref}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center px-3 py-2 text-white hover:bg-white/10 rounded-md transition-all duration-200 text-[13px] group"
                                          >
                                            <span className="w-1 h-1 rounded-full bg-white/40 mr-2.5 group-hover:bg-white/60 transition-colors" />
                                            <span className="group-hover:translate-x-1 transition-transform duration-200">
                                              {subItem.link.label}
                                            </span>
                                          </Link>
                                        </motion.div>
                                      )
                                    })}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        )
                      })
                    ) : (
                      <div className="px-4 py-3 text-white/60 text-sm">
                        No navigation items available
                      </div>
                    )}
                  </div>
                </nav>

                {/* Contact & Info Section */}
                <div className="border-t border-white/10 bg-primary/50">
                  {/* Phone */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="p-4 border-b border-white/10"
                  >
                    <a
                      href="tel:+998795393862"
                      className="flex items-center gap-2.5 text-white hover:text-blue-300 transition-colors group"
                    >
                      <div className="p-1.5 bg-white/10 rounded-md group-hover:bg-white/20 transition-colors">
                        <PhoneCall className="size-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-white/50 uppercase tracking-wide">
                          Contact
                        </span>
                        <span className="text-sm font-semibold">+998 79 539-38-62</span>
                      </div>
                    </a>
                  </motion.div>

                  {/* Language Selector */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="p-4 border-b border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <LanguageSelector mobile />
                    </div>
                  </motion.div>

                  {/* Social Links */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="p-4"
                  >
                    <div className="flex items-center gap-2.5">
                      <a
                        href="https://youtube.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white/10 rounded-md text-white/80 hover:text-[#FF0000] hover:bg-white/20 transition-all duration-200"
                        aria-label="YouTube"
                      >
                        <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 0 0 .5 6.19C0 8.04 0 12 0 12s0 3.96.5 5.81a3.02 3.02 0 0 0 2.12 2.14C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14C24 15.96 24 12 24 12s0-3.96-.5-5.81zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
                        </svg>
                      </a>
                      <a
                        href="https://instagram.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white/10 rounded-md text-white/80 hover:text-[#E1306C] hover:bg-white/20 transition-all duration-200"
                        aria-label="Instagram"
                      >
                        <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      </a>
                      <a
                        href="https://facebook.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white/10 rounded-md text-white/80 hover:text-[#1877F2] hover:bg-white/20 transition-all duration-200"
                        aria-label="Facebook"
                      >
                        <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </a>
                      <a
                        href="https://t.me"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white/10 rounded-md text-white/80 hover:text-[#229ED9] hover:bg-white/20 transition-all duration-200"
                        aria-label="Telegram"
                      >
                        <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M11.944 0A12 12 0 1 0 24 12 12 12 0 0 0 11.944 0zm3.882 8.027L13.5 16.5c-.1.363-.5.5-.763.3l-2.137-1.65-1.025 1a.368.368 0 0 1-.56-.037l.227-2.412 4.462-4.025c.2-.175-.037-.275-.3-.1L5.9 13.5l-2.212-.687c-.475-.15-.488-.463.1-.688l8.65-3.337c.4-.15.762.1.644.737-.012 0-.012 0 0 0z" />
                        </svg>
                      </a>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
