'use client'
import React from 'react'
import { useRowLabel } from '@payloadcms/ui'

type SubItem = {
  link?: { label?: string | null }
}

export const SubRowLabel: React.FC = () => {
  const data = useRowLabel<SubItem>()
  const label = data?.data?.link?.label
    ? `Sub-item ${data.rowNumber !== undefined ? data.rowNumber + 1 : ''}: ${data.data.link.label}`
    : 'Sub-item'

  return <div>{label}</div>
}
