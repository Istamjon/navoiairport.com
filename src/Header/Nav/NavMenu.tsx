'use client'
import React, { useRef, useState, useEffect, useCallback, useId } from 'react'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/utilities/ui'
import { motion, AnimatePresence } from 'framer-motion'
import type { Page, Post } from '@/payload-types'

// ─── Types ────────────────────────────────────────────────────────────────────

type CMSReference = {
  relationTo: 'pages' | 'posts'
  value: Page | Post | string | number
} | null

export type NavLink = {
  type?: 'reference' | 'custom' | null
  reference?: CMSReference
  url?: string | null
  label?: string | null
  newTab?: boolean | null
}

export type NavSubItem = {
  link: NavLink
  id?: string | null
}

export type NavItem = {
  link: NavLink
  subItems?: NavSubItem[] | null
  id?: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function resolveHref(link: NavLink): string | null {
  if (link.type === 'reference' && link.reference && typeof link.reference.value === 'object') {
    const slug = (link.reference.value as Page | Post).slug
    if (!slug) return null
    return link.reference.relationTo === 'pages' ? `/${slug}` : `/posts/${slug}`
  }
  return link.url ?? null
}

function isHashOnly(href: string | null): boolean {
  return !href || href === '#'
}

// ─── Magic Line ───────────────────────────────────────────────────────────────
// Sliding 2px bottom indicator that tracks hovered / active nav item.

const MagicLine: React.FC<{
  navRef: React.RefObject<HTMLElement | null>
  hoveredEl: HTMLElement | null
}> = ({ navRef, hoveredEl }) => {
  const pathname = usePathname()
  const [style, setStyle] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0,
  })

  const moveTo = useCallback(
    (el: HTMLElement) => {
      const nav = navRef.current
      if (!nav) return
      const navRect = nav.getBoundingClientRect()
      const elRect = el.getBoundingClientRect()
      setStyle({ left: elRect.left - navRect.left, width: elRect.width, opacity: 1 })
    },
    [navRef],
  )

  const hide = useCallback(() => setStyle((s) => ({ ...s, opacity: 0 })), [])

  // Follow hovered element
  useEffect(() => {
    if (hoveredEl) {
      moveTo(hoveredEl)
    } else {
      // Snap back to active item (if any) when hover ends
      const nav = navRef.current
      const active = nav?.querySelector<HTMLElement>('[data-nav-active="true"]')
      if (active) moveTo(active)
      else hide()
    }
  }, [hoveredEl, navRef, moveTo, hide])

  // Sync to active route on navigation
  useEffect(() => {
    if (hoveredEl) return // don't interrupt hover
    const nav = navRef.current
    const active = nav?.querySelector<HTMLElement>('[data-nav-active="true"]')
    if (active) moveTo(active)
    else hide()
  }, [pathname, navRef, hoveredEl, moveTo, hide])

  return (
    <motion.span
      aria-hidden="true"
      className="pointer-events-none absolute bottom-0 h-[2px] bg-blue-300"
      animate={{
        left: style.left,
        width: style.width,
        opacity: style.opacity,
      }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    />
  )
}

// ─── Single nav item ──────────────────────────────────────────────────────────

const NavMenuItem: React.FC<{
  item: NavItem
  onHover: (el: HTMLElement | null) => void
  isLast: boolean
}> = ({ item, onHover, isLast }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement | HTMLAnchorElement | null>(null)
  const menuId = useId()
  const pathname = usePathname()

  const hasSubItems = !!(item.subItems && item.subItems.length > 0)
  const href = resolveHref(item.link)
  const isHash = isHashOnly(href)

  const isActive = hasSubItems
    ? item.subItems!.some((sub) => {
        const h = resolveHref(sub.link)
        return h && h !== '#' && (pathname === h || pathname.startsWith(h + '/'))
      }) ||
      (!isHash && !!href && (pathname === href || pathname.startsWith(href + '/')))
    : !!href && href !== '#' && (pathname === href || pathname.startsWith(href + '/'))

  // Close on outside click (only when open)
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        ;(triggerRef.current as HTMLElement | null)?.focus()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  // Close on route change
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const triggerClasses = cn(
    ' text-sm font-bold uppercase transition-colors duration-150 outline-none whitespace-nowrap',
    'focus-visible:underline focus-visible:underline-offset-4 focus-visible:decoration-white',
    isActive ? 'text-white' : 'text-white/80 hover:text-white',
  )

  const handleMouseEnter = () => {
    if (triggerRef.current) onHover(triggerRef.current as HTMLElement)
  }
  const handleMouseLeave = () => onHover(null)

  // Smart dropdown position: flip to right-aligned if near screen edge
  // Declared here (before any early return) to satisfy React Hooks rule.
  const [flipRight, setFlipRight] = useState(false)
  useEffect(() => {
    if (!open || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    setFlipRight(rect.left + 220 > window.innerWidth - 16)
  }, [open])

  // ── Plain link (no sub-items) ──────────────────────────────────────────────
  if (!hasSubItems) {
    const newTabProps = item.link.newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {}
    if (!href || isHash) return null
    return (
      <>
        <Link
          ref={triggerRef as React.Ref<HTMLAnchorElement>}
          href={href}
          data-nav-active={isActive || undefined}
          className={triggerClasses}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          {...newTabProps}
        >
          {item.link.label}
        </Link>
        {/* Vertical divider after item (except last) */}
        {!isLast && <span aria-hidden="true" className="h-4 w-px bg-border/60 shrink-0" />}
      </>
    )
  }

  // ── Item with dropdown ─────────────────────────────────────────────────────

  return (
    <>
      <div ref={ref} className="relative">
        <button
          ref={triggerRef as React.Ref<HTMLButtonElement>}
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={menuId}
          data-nav-active={isActive || undefined}
          onClick={() => setOpen((v) => !v)}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={cn(triggerClasses, 'flex items-center gap-1')}
        >
          {item.link.label}
          <ChevronDown
            aria-hidden="true"
            className={cn(
              'size-3.5 text-blue-900-foreground transition-transform duration-200',
              open && 'rotate-180',
            )}
          />
        </button>

        {/* Dropdown panel with framer-motion */}
        <AnimatePresence>
          {open && (
            <motion.div
              id={menuId}
              role="menu"
              aria-label={item.link.label ?? undefined}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className={cn(
                'absolute z-90 mt-5',
                flipRight ? 'right-0' : 'left-0',
                'min-w-[220px] bg-white border border-border/60 shadow-xl',
                'py-1 rounded-b-md overflow-hidden origin-top',
              )}
            >
              {item.subItems!.map((sub, i, arr) => {
                const subHref = resolveHref(sub.link)
                if (!subHref) return null
                const subActive = pathname === subHref || pathname.startsWith(subHref + '/')
                const newTabProps = sub.link.newTab
                  ? { rel: 'noopener noreferrer', target: '_blank' }
                  : {}
                const isLastSub = i === arr.length - 1

                return (
                  <motion.div
                    key={sub.id ?? i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.05 }}
                  >
                    <Link
                      href={subHref}
                      role="menuitem"
                      tabIndex={0}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'flex items-center px-4 py-2 text-md transition-colors duration-150 outline-none',
                        'focus-visible:bg-blue-300 focus-visible:text-foreground',
                        subActive
                          ? 'bg-primary/[0.08] text-black font-semibold border-l-2 border-primary px-4 pl-[14px]'
                          : 'text-primary hover:bg-primary hover:text-white transition-colors duration-200',
                      )}
                      {...newTabProps}
                    >
                      {sub.link.label}
                    </Link>
                    {!isLastSub && <div aria-hidden="true" className="mx-4 h-px bg-border/50" />}
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Vertical divider after item (except last) */}
      {!isLast && <span aria-hidden="true" className="h-4 w-px bg-border border-blue shrink-0" />}
    </>
  )
}

// ─── Full NavMenu ─────────────────────────────────────────────────────────────

export const NavMenu: React.FC<{ items: NavItem[] }> = ({ items }) => {
  const navRef = useRef<HTMLElement | null>(null)
  const [hoveredEl, setHoveredEl] = useState<HTMLElement | null>(null)

  return (
    <nav
      ref={navRef}
      className="relative hidden md:flex items-center gap-2 "
      aria-label="Main navigation"
    >
      {items.map((item, i) => (
        <NavMenuItem
          key={item.id ?? i}
          item={item}
          onHover={setHoveredEl}
          isLast={i === items.length - 1}
        />
      ))}

      {/* Magic line — follows hover, snaps to active on idle */}
      <MagicLine navRef={navRef} hoveredEl={hoveredEl} />
    </nav>
  )
}
