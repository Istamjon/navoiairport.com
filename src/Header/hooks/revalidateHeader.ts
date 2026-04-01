import type { GlobalAfterChangeHook } from 'payload'
import { revalidateTag } from 'next/cache'
import { LOCALES } from '@/utilities/getLocale'

export const revalidateHeader: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating header (all locales)`)

    // Invalidate the shared tag + every per-locale tag so all cached
    // variants are cleared when an editor saves the header in any locale.
    revalidateTag('global_header')
    LOCALES.forEach((locale) => revalidateTag(`global_header_${locale}`))
  }

  return doc
}
