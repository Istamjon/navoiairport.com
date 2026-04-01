import { getLocalizedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'
import type { Header } from '@/payload-types'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { Logo } from '@/components/Logo/Logo'
import { FooterNavItem } from './FooterNavItem'

export async function Footer() {
  const headerData: Header = await getLocalizedGlobal('header', 2)

  const navItems = headerData?.navItems || []

  return (
    <footer className="mt-auto border-t-2 border-blue-300 bg-primary text-white">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row md:justify-between gap-8 mb-8">
          <Link className="flex items-center" href="/">
            {/* <Logo /> */}
          </Link>
          {/* <ThemeSelector /> */}
        </div>

        <nav className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 divide-x divide-white/20">
          {navItems.map((navItem, i) => (
            <FooterNavItem key={i} navItem={navItem} />
          ))}
        </nav>
      </div>

      <div className="container border-t border-t-blue-300/50 py-4">
        <p className="text-left text-white/50 text-sm">
          Navoi International Airopot Inc. &copy; {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  )
}
