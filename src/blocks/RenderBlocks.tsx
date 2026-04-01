import React, { Fragment } from 'react'

import type { Page } from '@/payload-types'

import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { FlightsTableBlock } from '@/blocks/FlightsTable/Component'
import { CarouselBlock } from '@/blocks/Carusel/Component'
import { LatestNewsServer } from '@/blocks/LatestNews/ServerComponent'
import { InfoCardsComponent } from '@/blocks/InfoCards/Component'
import { LogoCarouselComponent } from '@/blocks/LogoCarousel/Component'

const blockComponents = {
  archive: ArchiveBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
  flightsTable: FlightsTableBlock,
  carousel: CarouselBlock,
  latestNews: LatestNewsServer,
  infoCards: InfoCardsComponent,
  logoCarousel: LogoCarouselComponent,
}

export const RenderBlocks = async (props: { blocks: Page['layout'][0][] }) => {
  const { blocks } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              return (
                <div className=" " key={index}>
                  <Block {...(block as any)} disableInnerContainer />
                </div>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
