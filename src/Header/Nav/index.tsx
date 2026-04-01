'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Menu, X, SearchIcon, ChevronDown } from 'lucide-react'
import { cn } from '@/utilities/ui'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

import type { Header as HeaderType } from '@/payload-types'
import type { NavItem } from './NavMenu'
import { NavMenu, resolveHref } from './NavMenu'
import { LanguageSelector } from './LanguageSelector'
import { SearchModal } from '@/components/SearchModal'

// ─── Main HeaderNav ───────────────────────────────────────────────────────────

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = (data?.navItems || []) as NavItem[]
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      {/* ── Desktop nav ─────────────────────────────────────────── */}
      <div className="hidden md:flex items-center gap-6">
        <NavMenu items={navItems} />

        {/* Separator before utilities */}
        <span aria-hidden="true" className="h-4 w-px bg-border/60 shrink-0" />

        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          aria-label="Search"
          className="p-1 text-white hover:text-white/80 transition-colors rounded-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <SearchIcon className="size-4" />
        </button>

        <LanguageSelector />
      </div>

      {/* ── Mobile: language + hamburger ────────────────────────── */}
      <div className="flex md:hidden items-center gap-2">
        <LanguageSelector />
        <button
          type="button"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          onClick={() => setMobileOpen((v) => !v)}
          className="p-1.5 rounded-none hover:bg-muted/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {mobileOpen ? <X className="size-5 text-blue-300" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* ── Mobile drawer — fixed so it sits below sticky header ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="md:hidden fixed left-0 right-0 z-40 bg-card border-b border-border shadow-xl overflow-hidden"
            style={{
              top: 'var(--header-height, 65px)',
              maxHeight: '80vh',
            }}
          >
            <motion.nav
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="container py-3 flex flex-col overflow-y-auto"
              aria-label="Mobile navigation"
            >
              {navItems.map((item, i, arr) => (
                <React.Fragment key={item.id ?? i}>
                  <MobileNavItem item={item} onClose={() => setMobileOpen(false)} />
                  {/* Horizontal divider between top-level items */}
                  {i < arr.length - 1 && (
                    <div aria-hidden="true" className="mx-2 h-px bg-border/50" />
                  )}
                </React.Fragment>
              ))}

              {/* Search link */}
              <div aria-hidden="true" className="mx-2 h-px bg-border/50" />
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false)
                  setSearchOpen(true)
                }}
                className="flex items-center gap-2.5 px-2 py-3 text-sm text-foreground/75 hover:text-foreground hover:bg-muted/60 transition-colors w-full text-left"
              >
                <SearchIcon className="size-4" />
                Qidirish
              </button>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ─── Mobile nav item — accordion with smooth animation ────────────────────────

const MobileNavItem: React.FC<{ item: NavItem; onClose: () => void }> = ({ item, onClose }) => {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const hasSubItems = !!(item.subItems && item.subItems.length > 0)
  const href = resolveHref(item.link)
  const isActive = hasSubItems
    ? item.subItems!.some((sub) => {
        const h = resolveHref(sub.link)
        return h && h !== '#' && (pathname === h || pathname.startsWith(h + '/'))
      })
    : !!href && href !== '#' && (pathname === href || pathname.startsWith(href + '/'))

  if (!hasSubItems) {
    if (!href || href === '#') return null
    const newTabProps = item.link.newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {}
    return (
      <Link
        href={href}
        onClick={onClose}
        className={cn(
          'flex items-center px-2 py-3 text-sm font-medium transition-colors',
          isActive ? 'text-primary' : '  hover:text-white hover:bg-muted/50',
        )}
        {...newTabProps}
      >
        {item.link.label}
        {isActive && (
          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
        )}
      </Link>
    )
  }

  return (
    <div>
      <motion.button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'w-full flex items-center justify-between px-2 py-3 text-sm font-medium transition-colors hover:bg-muted/30',
          isActive ? 'text-primary' : 'text-foreground/80 hover:text-white',
          open && 'bg-muted/30',
        )}
      >
        <span>{item.link.label}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown aria-hidden="true" className="size-4 text-muted-foreground" />
        </motion.div>
      </motion.button>

      {/* Smooth accordion with framer-motion */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              exit={{ y: -10 }}
              transition={{ duration: 0.2 }}
              className="pl-4 pb-1 border-l-2 border-primary/30 ml-4 flex flex-col"
            >
              {item.subItems!.map((sub, i) => {
                const subHref = resolveHref(sub.link)
                if (!subHref || subHref === '#') return null
                const subActive = pathname === subHref || pathname.startsWith(subHref + '/')
                const newTabProps = sub.link.newTab
                  ? { rel: 'noopener noreferrer', target: '_blank' }
                  : {}
                return (
                  <motion.div
                    key={sub.id ?? i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.05 }}
                  >
                    <Link
                      href={subHref}
                      onClick={onClose}
                      className={cn(
                        'flex items-center py-2 text-sm transition-colors',
                        subActive
                          ? 'text-primary font-medium'
                          : 'text-foreground/70 hover:text-foreground',
                      )}
                      {...newTabProps}
                    >
                      <span
                        className="mr-2 size-1 rounded-full bg-current opacity-60"
                        aria-hidden="true"
                      />
                      {sub.link.label}
                    </Link>
                  </motion.div>
                )
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
