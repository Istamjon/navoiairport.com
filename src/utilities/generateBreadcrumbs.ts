import type { Header, Page, Post } from '@/payload-types'

export interface BreadcrumbItem {
  label: string
  url: string
}

type NavLink = {
  type?: 'reference' | 'custom' | null
  url?: string | null
  label?: string | null
  newTab?: boolean | null
  reference?:
    | {
        relationTo: 'pages'
        value: number | Page
      }
    | {
        relationTo: 'posts'
        value: number | Post
      }
    | null
}

/**
 * Generate breadcrumbs from navigation structure
 * Finds the current page in the navigation hierarchy and builds breadcrumbs path
 */
export function generateBreadcrumbsFromNav(
  currentSlug: string,
  currentTitle: string,
  header: Header | null,
): BreadcrumbItem[] {
  if (!header?.navItems || header.navItems.length === 0) {
    return []
  }

  const breadcrumbs: BreadcrumbItem[] = []

  // Search through navigation items
  for (const navItem of header.navItems) {
    if (!navItem?.link) continue

    const navLabel = navItem.link.label || ''
    const navUrl = getNavItemUrl(navItem.link)

    // Check if current page matches this nav item
    if (matchesCurrentPage(navUrl, currentSlug)) {
      // This is a top-level nav item
      breadcrumbs.push({
        label: navLabel,
        url: navUrl,
      })
      return breadcrumbs
    }

    // Check sub-items
    if (navItem.subItems && navItem.subItems.length > 0) {
      for (const subItem of navItem.subItems) {
        if (!subItem?.link) continue

        const subLabel = subItem.link.label || ''
        const subUrl = getNavItemUrl(subItem.link)

        if (matchesCurrentPage(subUrl, currentSlug)) {
          // Found in sub-items, add parent first
          breadcrumbs.push({
            label: navLabel,
            url: navUrl,
          })
          // Then add current item
          breadcrumbs.push({
            label: subLabel,
            url: subUrl,
          })
          return breadcrumbs
        }
      }
    }
  }

  // If not found in navigation, return empty
  return breadcrumbs
}

/**
 * Get URL from navigation link
 */
function getNavItemUrl(link: NavLink): string {
  if (!link) return '#'

  if (link.type === 'custom' && link.url) {
    return link.url
  }

  if (link.type === 'reference' && link.reference) {
    const ref = link.reference.value

    // If value is an object (populated), get slug
    if (typeof ref === 'object' && ref !== null && 'slug' in ref) {
      return `/${ref.slug}`
    }
  }

  return '#'
}

/**
 * Check if navigation URL matches current page
 */
function matchesCurrentPage(navUrl: string, currentSlug: string): boolean {
  if (navUrl === '#') return false

  // Normalize URLs for comparison
  const normalizedNavUrl = navUrl.replace(/^\//, '').replace(/\/$/, '')
  const normalizedSlug = currentSlug.replace(/^\//, '').replace(/\/$/, '')

  return normalizedNavUrl === normalizedSlug
}
