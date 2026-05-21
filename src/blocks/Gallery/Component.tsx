import React from 'react'
import { Media } from '@/components/Media'

import type { GalleryBlock as GalleryBlockProps } from '@/payload-types'

export const GalleryBlock: React.FC<GalleryBlockProps> = ({
  title,
  subtitle,
  images,
  layout = 'grid',
  columns = '3',
  enableLightbox = true,
  showCaptions = true,
}) => {
  // Column classes based on number of columns
  const columnClasses: Record<string, string> = {
    '2': 'grid-cols-2',
    '3': 'grid-cols-3',
    '4': 'grid-cols-4',
    '5': 'grid-cols-5',
  }

  // Masonry style classes
  const masonryClasses: Record<string, string> = {
    '2': 'columns-2',
    '3': 'columns-3',
    '4': 'columns-4',
    '5': 'columns-5',
  }

  const resolvedColumns = columns ?? '3';
  const gridColumnClass = columnClasses[resolvedColumns] || 'grid-cols-3';
  const masonryColumnClass = masonryClasses[resolvedColumns] || 'columns-3';

  return (
    <div className="py-12">
      {/* Title and subtitle */}
      {(title || subtitle) && (
        <div className="text-center mb-10">
          {title && <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>}
          {subtitle && <p className="text-lg text-gray-600">{subtitle}</p>}
        </div>
      )}

      {/* Gallery container */}
      <div 
        className={
          layout === 'masonry' 
            ? `${masonryColumnClass} space-y-4` 
            : `grid ${gridColumnClass} gap-6`
        }
      >
        {images?.map((item, index) => (
          <div 
            key={index} 
            className={
              layout === 'masonry' 
                ? 'break-inside-avoid break-after-auto' 
                : ''
            }
          >
            <div className="overflow-hidden rounded-lg shadow-md">
              {item?.image && (
                <div 
                  onClick={() => enableLightbox && console.log(`Opening lightbox for image ${index + 1}`)}
                  className={enableLightbox ? 'cursor-pointer' : ''}
                >
                  <Media
                    resource={item.image}
                    className="w-full h-auto object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              )}
              
              {showCaptions && (item?.caption || item?.description) && (
                <div className="p-4 bg-white">
                  {item?.caption && <h3 className="font-semibold text-gray-900">{item.caption}</h3>}
                  {item?.description && <p className="text-gray-600 text-sm mt-1">{item.description}</p>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default GalleryBlock;