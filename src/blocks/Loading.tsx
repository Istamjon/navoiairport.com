import React from 'react'

export const LoadingBlock: React.FC = () => {
  return (
    <div className="py-12 text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  )
}