export function getLocaleFromCookie(): string {
  if (typeof document === 'undefined') return 'uz'
  const match = document.cookie.match(/payload-locale=([^;]+)/)
  return match ? match[1] : 'uz'
}
