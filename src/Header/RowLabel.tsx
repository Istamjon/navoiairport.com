'use client'
import React from 'react'
import { useRowLabel } from '@payloadcms/ui'

type NavItemData = {
  link?: { label?: string | null }
  subItems?: { id?: string }[] | null
}

export const RowLabel: React.FC = () => {
  const data = useRowLabel<NavItemData>()
  const label = data?.data?.link?.label
    ? `Nav item ${data.rowNumber !== undefined ? data.rowNumber + 1 : ''}: ${data.data.link.label}`
    : 'Row'
  const subCount = data?.data?.subItems?.length ?? 0

  return (
    <div className="flex items-center gap-4">
      <span>{label}</span>
      {subCount > 0 && (
        <span className="text-xs text-blue-900 -foreground">({subCount} sub-items)</span>
      )}
    </div>
  )
}
