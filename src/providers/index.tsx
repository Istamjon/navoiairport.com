import React from 'react'

import { HeaderThemeProvider } from './HeaderTheme'
import { LocaleProvider, type LocaleCode } from './Locale'
import { ThemeProvider } from './Theme'

export const Providers: React.FC<{
  children: React.ReactNode
  initialLocale?: LocaleCode
}> = ({ children, initialLocale }) => {
  return (
    <ThemeProvider>
      <HeaderThemeProvider>
        <LocaleProvider initial={initialLocale}>{children}</LocaleProvider>
      </HeaderThemeProvider>
    </ThemeProvider>
  )
}
