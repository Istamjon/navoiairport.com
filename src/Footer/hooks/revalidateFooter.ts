import type { GlobalAfterChangeHook } from 'payload'
import { revalidateTag } from 'next/cache'
import { LOCALES } from '@/utilities/getLocale'

export const revalidateFooter: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating footer (all locales)`)

    // Invalidate the shared tag + every per-locale tag so all cached
    // variants are cleared when an editor saves the footer in any locale.
    revalidateTag('global_footer')
    LOCALES.forEach((locale) => revalidateTag(`global_footer_${locale}`))
  }

  return doc
}
