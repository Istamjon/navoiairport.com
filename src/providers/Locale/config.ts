export const LOCALES = ['uz', 'ru', 'en', 'zh'] as const
export type LocaleCode = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: LocaleCode = 'uz'
export const COOKIE_NAME = 'payload-locale'
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export const isLocaleCode = (v: unknown): v is LocaleCode =>
  typeof v === 'string' && (LOCALES as readonly string[]).includes(v)

export const readLocaleFromCookie = (): LocaleCode => {
  if (typeof document === 'undefined') return DEFAULT_LOCALE
  const match = document.cookie.split('; ').find((row) => row.startsWith(`${COOKIE_NAME}=`))
  const value = match?.split('=')[1]
  return isLocaleCode(value) ? value : DEFAULT_LOCALE
}

export const writeLocaleCookie = (code: LocaleCode): void => {
  if (typeof document === 'undefined') return
  document.cookie = `${COOKIE_NAME}=${code}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
}
