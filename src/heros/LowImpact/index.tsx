import React from 'react'

import type { Page } from '@/payload-types'

import RichText from '@/components/RichText'
import { Breadcrumb } from '@/components/Breadcrumb'
import type { BreadcrumbItem } from '@/utilities/generateBreadcrumbs'

type LowImpactHeroType =
  | {
      children?: React.ReactNode
      richText?: never
      breadcrumbs?: never
      locale?: never
    }
  | (Omit<Page['hero'], 'richText'> & {
      children?: never
      richText?: Page['hero']['richText']
      breadcrumbs?: BreadcrumbItem[]
      locale?: string
    })

const LowImpactHeroComponent: React.FC<LowImpactHeroType> = ({
  children,
  richText,
  breadcrumbs,
  locale,
}) => {
  return (
    <div className="bg-blue-300/10">
      <div className="container  pt-2">
        <Breadcrumb items={breadcrumbs} locale={locale} />
        {children || (richText && <RichText data={richText} enableGutter={false} />)}
      </div>
    </div>
  )
}

// Memoize to prevent unnecessary re-renders
export const LowImpactHero = React.memo(LowImpactHeroComponent)
