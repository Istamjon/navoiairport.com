'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/utilities/ui'
import type { BreadcrumbItem } from '@/utilities/generateBreadcrumbs'

interface BreadcrumbProps {
  items?: BreadcrumbItem[]
  className?: string
  locale?: string
}

const HOME_LABELS: Record<string, string> = {
  uz: 'Bosh sahifa',
  ru: 'Главная',
  en: 'Home',
  zh: '主页',
}

const BreadcrumbComponent: React.FC<BreadcrumbProps> = ({ items, className, locale = 'uz' }) => {
  // Get localized home label
  const homeLabel = HOME_LABELS[locale] || HOME_LABELS.uz

  // Filter valid items (don't add home yet)
  const validItems = items?.filter((item) => item?.label && item?.url && item.url !== '#') || []

  // If no valid items, don't show breadcrumbs at all
  if (validItems.length === 0) {
    return null
  }

  // Add home at the beginning
  const breadcrumbItems: BreadcrumbItem[] = [{ label: homeLabel, url: '/' }, ...validItems]

  return (
    <nav aria-label="Breadcrumb" className={cn('py-4', className)}>
      <ol className="flex items-center gap-2 text-sm flex-wrap">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1
          const isFirst = index === 0
          const isHome = index === 0

          return (
            <li key={index} className="flex items-center gap-2">
              {index > 0 && <ChevronRight className="size-4 text-muted-foreground shrink-0" />}

              {isLast && !isHome ? (
                // Only show as text if it's the last item AND not home
                <span className="text-foreground font-medium" aria-current="page">
                  {item.label}
                </span>
              ) : (
                // Show as link for home and all intermediate items
                <Link
                  href={item.url}
                  className={cn(
                    'text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5',
                  )}
                >
                  {isFirst && <Home className="size-4" />}
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

// Memoize to prevent unnecessary re-renders
export const Breadcrumb = React.memo(BreadcrumbComponent)
