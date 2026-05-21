'use client'

import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { FAQBlock } from '@/payload-types'

export const FAQBlockComponent: React.FC<FAQBlock> = ({ title, description, questions }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(
    questions?.findIndex((q) => q.defaultOpen) ?? null,
  )

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="py-12">
      {(title || description) && (
        <div className="text-center mb-10">
          {title && <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>}
          {description && <p className="text-lg text-gray-600 max-w-2xl mx-auto">{description}</p>}
        </div>
      )}

      {questions && questions.length > 0 && (
        <div className="max-w-3xl mx-auto space-y-2">
          {questions.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between px-6 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900 pr-4">{item.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-200 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`transition-all duration-200 overflow-hidden ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 pb-4 text-gray-600 leading-relaxed">{item.answer}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FAQBlockComponent
