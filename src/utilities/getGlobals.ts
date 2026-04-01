import type { Config } from 'src/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { TypedLocale } from 'payload'
import { unstable_cache } from 'next/cache'
import { getLocale } from '@/utilities/getLocale'

type Global = keyof Config['globals']

async function getGlobal(slug: Global, depth: number, locale: TypedLocale) {
  const payload = await getPayload({ config: configPromise })

  return payload.findGlobal({
    slug,
    depth,
    locale,
  })
}

/**
 * Returns a locale-aware cached global.
 * Each [slug + locale] pair gets its own cache entry, so switching language
 * does NOT return stale data from a different locale.
 *
 * Tags: `global_<slug>` (broad) + `global_<slug>_<locale>` (narrow)
 * — revalidateHeader/Footer use both to invalidate correctly.
 */
export const getCachedGlobal = (slug: Global, depth = 0, locale: TypedLocale) =>
  unstable_cache(
    () => getGlobal(slug, depth, locale),
    // ← locale is baked into the key array so each locale = separate cache entry
    [slug, locale],
    {
      tags: [`global_${slug}`, `global_${slug}_${locale}`],
    },
  )

/**
 * Convenience wrapper: reads the current locale from cookie then returns
 * the locale-keyed cached global.  Use this in Server Components.
 */
export async function getLocalizedGlobal(slug: Global, depth = 0) {
  const locale = await getLocale()
  return getCachedGlobal(slug, depth, locale)()
}
