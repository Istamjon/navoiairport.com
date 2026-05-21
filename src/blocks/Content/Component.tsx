import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'
import { Media } from '@/components/Media'

import type { ContentBlock as ContentBlockProps } from '@/payload-types'

import { CMSLink } from '../../components/Link'

export const ContentBlock: React.FC<ContentBlockProps> = (props) => {
  const { columns } = props

  const colsSpanClasses = {
    full: '12',
    half: '6',
    oneThird: '4',
    twoThirds: '8',
  }

  const getPaddingClass = (padding: string) => {
    switch (padding) {
      case 'none':
        return 'p-0';
      case 'small':
        return 'p-2 sm:p-4';
      case 'medium':
        return 'p-4 sm:p-6';
      case 'large':
        return 'p-6 sm:p-8';
      default:
        return 'p-4 sm:p-6';
    }
  };

  const getBackgroundClass = (backgroundColor: string) => {
    switch (backgroundColor) {
      case 'white':
        return 'bg-white';
      case 'gray':
        return 'bg-gray-100';
      case 'blue':
        return 'bg-blue-50';
      case 'green':
        return 'bg-green-50';
      default:
        return 'bg-white';
    }
  };

  const getImageWidthClass = (width: string) => {
    switch (width) {
      case 'full':
        return 'w-full';
      case 'half':
        return 'w-1/2';
      case 'one-third':
        return 'w-1/3';
      case 'two-thirds':
        return 'w-2/3';
      default:
        return 'w-full';
    }
  };

  return (
    <div className="container  ">
      <div className="grid grid-cols-4 lg:grid-cols-12 gap-y-8 gap-x-16">
        {columns &&
          columns.length > 0 &&
          columns.map((col, index) => {
            const { 
              enableLink, 
              link, 
              richText,
              size, 
              image, 
              imagePosition = 'top', 
              imageWidth = 'full', 
              imageCaption,
              backgroundColor = 'white',
              padding = 'medium'
            } = col

            const imageWidthClass = getImageWidthClass(imageWidth ?? 'full');
            const paddingClass = getPaddingClass(padding ?? 'medium');
            const backgroundClass = getBackgroundClass(backgroundColor ?? 'white');
            
            // Determine layout classes based on image position
            let containerClass = '';
            if (image && (imagePosition === 'left' || imagePosition === 'right')) {
              containerClass = `flex ${imagePosition === 'left' ? 'flex-row' : 'flex-row-reverse'} items-center`;
            } else {
              containerClass = 'flex flex-col';
            }

            return (
              <div
                className={cn(`${backgroundClass} ${paddingClass} col-span-4 lg:col-span-${colsSpanClasses[size!]}`, {
                  'md:col-span-2': size !== 'full',
                })}
                key={index}
              >
                <div className={containerClass}>
                  {/* Image rendering */}
                  {image && (imagePosition === 'top' || imagePosition === 'left') && (
                    <div className={imageWidthClass}>
                      <Media resource={image} />
                      {imageCaption && <p className="mt-2 text-sm text-gray-600">{imageCaption}</p>}
                    </div>
                  )}

                  {/* RichText rendering - now includes image support via global configuration */}
                  {(richText || (!image && enableLink)) && (
                    <div className={image && (imagePosition === 'left' || imagePosition === 'right') ? 'flex-1' : ''}>
                      {richText && <RichText data={richText} enableGutter={false} />}
                      
                      {enableLink && <CMSLink {...link} />}
                    </div>
                  )}

                  {/* Image rendering for bottom/right positions */}
                  {image && (imagePosition === 'bottom' || imagePosition === 'right') && (
                    <div className={imageWidthClass}>
                      <Media resource={image} />
                      {imageCaption && <p className="mt-2 text-sm text-gray-600">{imageCaption}</p>}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}

export default ContentBlock;