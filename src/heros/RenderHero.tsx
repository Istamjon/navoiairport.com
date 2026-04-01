import React from 'react'

import type { Page } from '@/payload-types'
import type { BreadcrumbItem } from '@/utilities/generateBreadcrumbs'

import { HighImpactHero } from '@/heros/HighImpact'
import { LowImpactHero } from '@/heros/LowImpact'
import { MediumImpactHero } from '@/heros/MediumImpact'
import { NiaHero } from '@/heros/Nia'

const heroes = {
  nia: NiaHero,
  highImpact: HighImpactHero,
  lowImpact: LowImpactHero,
  mediumImpact: MediumImpactHero,
}

type RenderHeroProps = Page['hero'] & {
  breadcrumbs?: BreadcrumbItem[]
  locale?: string
}

export const RenderHero: React.FC<RenderHeroProps> = (props) => {
  const { type } = props || {}

  if (!type || type === 'none') return null

  const HeroToRender = heroes[type]

  if (!HeroToRender) return null

  return <HeroToRender {...(props as any)} />
}
