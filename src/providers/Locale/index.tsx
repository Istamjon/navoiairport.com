'use client'

import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  COOKIE_NAME,
  DEFAULT_LOCALE,
  LocaleCode,
  readLocaleFromCookie,
  writeLocaleCookie,
} from './config'

export type { LocaleCode } from './config'

export interface LocaleContextValue {
  locale: LocaleCode
  setLocale: (code: LocaleCode) => void
}

const initialContext: LocaleContextValue = {
  locale: DEFAULT_LOCALE,
  setLocale: () => undefined,
}

const LocaleContext = createContext<LocaleContextValue>(initialContext)

export const LocaleProvider: React.FC<{ children: React.ReactNode; initial?: LocaleCode }> = ({
  children,
  initial = DEFAULT_LOCALE,
}) => {
  const router = useRouter()
  const [locale, setLocaleState] = useState<LocaleCode>(initial)
  const isInternalUpdate = useRef(false)

  // Hydrate from cookie after mount
  useEffect(() => {
    setLocaleState(readLocaleFromCookie())
  }, [])

  // Cross-tab sync: listen for cookie changes from other tabs/windows
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== COOKIE_NAME) return
      // If we wrote the cookie ourselves in another handler, ignore
      if (isInternalUpdate.current) {
        isInternalUpdate.current = false
        return
      }
      setLocaleState(readLocaleFromCookie())
      router.refresh()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [router])

  // Same-tab visibility change: if cookie was changed elsewhere, sync
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        const fromCookie = readLocaleFromCookie()
        if (fromCookie !== locale) {
          setLocaleState(fromCookie)
          router.refresh()
        }
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [locale, router])

  const setLocale = useCallback(
    (code: LocaleCode) => {
      if (code === locale) return
      isInternalUpdate.current = true
      setLocaleState(code)
      writeLocaleCookie(code)
      // Re-render all server components in the new locale
      router.refresh()
    },
    [locale, router],
  )

  const value = useMemo<LocaleContextValue>(() => ({ locale, setLocale }), [locale, setLocale])

  return <LocaleContext value={value}>{children}</LocaleContext>
}

export { LocaleContext }
