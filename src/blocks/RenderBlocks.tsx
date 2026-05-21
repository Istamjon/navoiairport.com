import React, { lazy } from 'react'
import type { Page } from '@/payload-types'
import { inclusionsCondition } from '@/utilities/conditionals'

const ArchiveBlock = lazy(() => import('./ArchiveBlock/Component'))
const CallToAction = lazy(() => import('./CallToAction/Component'))
const Carousel = lazy(() => import('./Carusel/Component'))
const Content = lazy(() => import('./Content/Component'))
const FlightsTable = lazy(() => import('./FlightsTable/Component'))
const Form = lazy(() => import('./Form/Component'))
const InfoCards = lazy(() => import('./InfoCards/Component'))
const LatestNews = lazy(() => import('./LatestNews/Component'))
const LogoCarousel = lazy(() => import('./LogoCarousel/Component'))
const MediaBlock = lazy(() => import('./MediaBlock/Component'))
const TestimonialBlock = lazy(() => import('./TestimonialBlock/Component'))
const GalleryBlock = lazy(() => import('./Gallery/Component'))
const ContactBlock = lazy(() => import('./ContactBlock/Component'))
const FAQBlock = lazy(() => import('./FAQ/Component'))

import { LoadingBlock } from './Loading'

export const RenderBlocks: React.FC<{
  blocks: NonNullable<Page['layout']>
}> = (props) => {
  const { blocks } = props

  const blocksToRender = blocks?.filter(inclusionsCondition)

  if (!blocksToRender || !blocksToRender.length) {
    return null
  }

  return (
    <div>
      {blocksToRender.map((block, index) => {
        const { blockType } = block

        switch (blockType) {
          case 'archive':
            return <ArchiveBlock key={index} {...block} />
          case 'cta':
            return <CallToAction key={index} {...block} />
          case 'carousel':
            return <Carousel key={index} {...block} />
          case 'content':
            return <Content key={index} {...block} />
          case 'flightsTable':
            return <FlightsTable key={index} {...block} />
          case 'formBlock':
            return <Form key={index} {...block as unknown as Parameters<typeof Form>[0]} />
          case 'infoCards':
            return <InfoCards key={index} {...block} />
          case 'latestNews':
            return <LatestNews key={index} {...block} />
          case 'logoCarousel':
            return <LogoCarousel key={index} {...block} />
          case 'mediaBlock':
            return <MediaBlock key={index} {...block} />
          case 'testimonial':
            return <TestimonialBlock key={index} {...block} />
          case 'gallery':
            return <GalleryBlock key={index} {...block} />
          case 'contact':
            return <ContactBlock key={index} {...block} />
          case 'faq':
            return <FAQBlock key={index} {...block} />
          default:
            return <LoadingBlock key={index} />
        }
      })}
    </div>
  )
}

export const RenderBlock: React.FC<{
  block: (NonNullable<Page['layout']>)[number]
}> = (props) => {
  const { block } = props
  const { blockType } = block

  if (!inclusionsCondition(block)) {
    return null
  }

  switch (blockType) {
    case 'archive':
      return <ArchiveBlock {...block} />
    case 'cta':
      return <CallToAction {...block} />
    case 'carousel':
      return <Carousel {...block} />
    case 'content':
      return <Content {...block} />
    case 'flightsTable':
      return <FlightsTable {...block} />
    case 'formBlock':
      return <Form {...block as unknown as Parameters<typeof Form>[0]} />
    case 'infoCards':
      return <InfoCards {...block} />
    case 'latestNews':
      return <LatestNews {...block} />
    case 'logoCarousel':
      return <LogoCarousel {...block} />
    case 'mediaBlock':
      return <MediaBlock {...block} />
    case 'testimonial':
      return <TestimonialBlock {...block} />
    case 'gallery':
      return <GalleryBlock {...block} />
    case 'contact':
      return <ContactBlock {...block} />
    case 'faq':
      return <FAQBlock {...block} />
    default:
      return <LoadingBlock />
  }
}
