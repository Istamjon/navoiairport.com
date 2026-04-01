import { cookies } from 'next/headers'
import type { TypedLocale } from 'payload'

/** Valid locale codes — must match payload.config.ts localization.locales */
export const LOCALES: TypedLocale[] = ['uz', 'ru', 'en', 'zh']
export const DEFAULT_LOCALE: TypedLocale = 'uz'

/**
 * Server-side helper: reads the `payload-locale` cookie and returns
 * the active locale code. Falls back to the default locale.
 *
 * Use in Server Components, Route Handlers, and Server Actions.
 */
export async function getLocale(): Promise<TypedLocale> {
  const cookieStore = await cookies()
  const value = cookieStore.get('payload-locale')?.value as TypedLocale | undefined
  return LOCALES.includes(value as TypedLocale) ? (value as TypedLocale) : DEFAULT_LOCALE
}
