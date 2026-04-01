import React from 'react'

import type { Page } from '@/payload-types'
import type { BreadcrumbItem } from '@/utilities/generateBreadcrumbs'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { Breadcrumb } from '@/components/Breadcrumb'

const MediumImpactHeroComponent: React.FC<
  Page['hero'] & { breadcrumbs?: BreadcrumbItem[]; locale?: string }
> = ({ links, media, richText, breadcrumbs, locale }) => {
  return (
    <div className="">
      <div className="container mb-8">
        <Breadcrumb items={breadcrumbs} locale={locale} />
        {richText && <RichText className="mb-6" data={richText} enableGutter={false} />}

        {Array.isArray(links) && links.length > 0 && (
          <ul className="flex gap-4">
            {links.map(({ link }, i) => {
              return (
                <li key={i}>
                  <CMSLink {...link} />
                </li>
              )
            })}
          </ul>
        )}
      </div>
      <div className="container ">
        {media && typeof media === 'object' && (
          <div>
            <Media
              className="-mx-4 md:-mx-8 2xl:-mx-16"
              imgClassName=""
              priority
              resource={media}
            />
            {media?.caption && (
              <div className="mt-3">
                <RichText data={media.caption} enableGutter={false} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Memoize to prevent unnecessary re-renders
export const MediumImpactHero = React.memo(MediumImpactHeroComponent)
