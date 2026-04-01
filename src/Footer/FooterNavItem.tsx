'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { CMSLink } from '@/components/Link'
import type { Header } from '@/payload-types'

interface FooterNavItemProps {
  navItem: NonNullable<Header['navItems']>[number]
}

export const FooterNavItem: React.FC<FooterNavItemProps> = ({ navItem }) => {
  const hasSubItems = navItem?.subItems && navItem.subItems.length > 0

  return (
    <motion.div
      className="flex flex-col gap-3 px-4 first:pl-0 last:pr-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {navItem?.link && (
        <motion.div
          whileHover={{ x: 5, color: 'rgba(147, 197, 253, 0.9)' }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <CMSLink
            className="text-white font-semibold text-lg transition-colors inline-block"
            {...navItem.link}
          />
        </motion.div>
      )}

      {hasSubItems && (
        <ul className="flex flex-col gap-2 ml-0">
          {navItem.subItems?.map((subItem: any, j: number) => (
            <motion.li
              key={j}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: j * 0.05 }}
            >
              {subItem?.link && (
                <motion.div
                  whileHover={{ x: 5, color: '#FFFFFF' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <CMSLink
                    className="text-white/70 transition-colors text-sm inline-block"
                    {...subItem.link}
                  />
                </motion.div>
              )}
            </motion.li>
          ))}
        </ul>
      )}
    </motion.div>
  )
}
