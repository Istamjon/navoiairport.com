import React from 'react'
import { Media } from '@/components/Media'

import type { TestimonialBlock as TestimonialBlockProps } from '@/payload-types'

export const TestimonialBlock: React.FC<TestimonialBlockProps> = ({
  quote,
  author,
  role,
  company,
  avatar,
  rating,
  layout = 'centered',
}) => {
  // Generate star rating
  const stars = Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={`text-xl ${i < Number(rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
      ★
    </span>
  ))

  // Layout classes
  const layoutClasses = {
    centered: 'text-center max-w-2xl mx-auto',
    left: 'text-left max-w-3xl',
    card: 'bg-white rounded-xl shadow-lg p-6 max-w-3xl mx-auto',
  }

  return (
    <div className={`py-12 ${layout === 'card' ? 'bg-gray-50 py-16' : ''}`}>
        <div className={`${layoutClasses[layout ?? 'centered']}`}>
        {/* Rating */}
        <div className="flex justify-center mb-4">{stars}</div>
        
        {/* Quote */}
        <blockquote className="text-xl italic text-gray-700 mb-6">
          &ldquo;{quote}&rdquo;
        </blockquote>
        
        {/* Author info */}
        <div className="flex items-center justify-center">
          {avatar && (
            <div className="mr-4">
              <Media
                resource={avatar}
                className="rounded-full object-cover w-12 h-12"
              />
            </div>
          )}
          <div className="text-left">
            <div className="font-bold text-gray-900">{author}</div>
            {role && <div className="text-gray-600">{role}</div>}
            {company && <div className="text-gray-500 text-sm">{company}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestimonialBlock;