'use client'

import { use } from 'react'
import { LocaleContext, LocaleContextValue } from './index'

export const useLocale = (): LocaleContextValue => use(LocaleContext)
