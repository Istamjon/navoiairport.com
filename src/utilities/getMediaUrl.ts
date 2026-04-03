import { getClientSideURL } from '@/utilities/getURL'

/**
 * Processes media resource URL to ensure proper formatting
 * @param url The original URL from the resource
 * @param cacheTag Optional cache tag to append to the URL
 * @returns Properly formatted URL with cache tag if provided
 */
export const getMediaUrl = (url: string | null | undefined, cacheTag?: string | null): string => {
  if (!url) return ''

  // Encode cache tag
  if (cacheTag && cacheTag !== '') {
    cacheTag = encodeURIComponent(cacheTag)
  }

  // Check if URL already has http/https protocol
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return cacheTag ? `${url}?${cacheTag}` : url
  }

  // Split URL into path segments and encode each segment
  // This handles filenames with spaces and special characters
  const urlParts = url.split('/')
  const encodedParts = urlParts.map((part) => {
    // Don't encode empty parts or query strings
    if (!part || part.includes('?')) return part
    return encodeURIComponent(part)
  })
  const encodedUrl = encodedParts.join('/')

  // Otherwise prepend client-side URL
  const baseUrl = getClientSideURL()
  return cacheTag ? `${baseUrl}${encodedUrl}?${cacheTag}` : `${baseUrl}${encodedUrl}`
}
