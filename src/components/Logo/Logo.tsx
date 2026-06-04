import clsx from 'clsx'
import React from 'react'
import NextImage from 'next/image'
import logoSrc from '@/assets/logo2.svg'
import type { Media } from '@/payload-types'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
  logo?: number | Media | null
}

export const Logo = (props: Props) => {
  const { loading: loadingFromProps, priority: priorityFromProps, className, logo } = props

  const loading = loadingFromProps || 'lazy'
  const priority = priorityFromProps || 'low'

  if (logo && typeof logo === 'object') {
    const logoUrl = logo.url
    if (logoUrl) {
      return (
        <NextImage
          src={logoUrl}
          alt={logo.alt || 'Navoi International Airport'}
          width={logo.width || 193}
          height={logo.height || 34}
          loading={loading}
          className={clsx('max-w-[9.375rem] w-full h-auto object-contain', className)}
        />
      )
    }
  }

  return (
    <NextImage
      src={logoSrc}
      alt="Navoi International Airports"
      width={193}
      height={34}
      loading={loading}
      fetchPriority={priority}
      decoding="async"
      className={clsx('max-w-[9.375rem] w-full h-auto', className)}
    />
  )
}
