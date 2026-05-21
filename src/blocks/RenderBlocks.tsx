import type { Page } from '@/payload-types'
import { inclusionsCondition } from '@/utilities/conditionals'

import ArchiveBlock from './ArchiveBlock/Component'
import CallToAction from './CallToAction/Component'
import Carousel from './Carusel/Component'
import Content from './Content/Component'
import FlightsTable from './FlightsTable/Component'
import Form from './Form/Component'
import InfoCards from './InfoCards/Component'
import LatestNews from './LatestNews/Component'
import LogoCarousel from './LogoCarousel/Component'
import MediaBlock from './MediaBlock/Component'
import TestimonialBlock from './TestimonialBlock/Component'
import GalleryBlock from './Gallery/Component'
import ContactBlock from './ContactBlock/Component'
import FAQBlock from './FAQ/Component'

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
