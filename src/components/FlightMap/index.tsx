'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { StickyTrigger } from './StickyTrigger'
import { MapDrawer } from './MapDrawer'

export const GlobalFlightMap = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return createPortal(
    <>
      <StickyTrigger isOpen={isOpen} onClick={() => setIsOpen(true)} />
      <MapDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>,
    document.body,
  )
}
