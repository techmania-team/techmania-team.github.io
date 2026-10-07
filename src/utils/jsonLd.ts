import type { JsonLd } from '@/composables/useSeoMeta'
import { DEFAULT_OG_IMAGE, toAbsoluteUrl } from '@/utils/url'

/** The game every page on this site is about */
export const GAME: JsonLd = {
  '@type': 'VideoGame',
  name: 'TECHMANIA',
  url: toAbsoluteUrl('/'),
}

/** The game's official pages elsewhere, the same ones the footer links to */
export const SOCIAL_LINKS = [
  'https://www.youtube.com/channel/UCoHxk7shdAKf7W3yqUJlDaA',
  'https://discord.gg/K4Nf7AnAZt',
  'https://github.com/techmania-team/techmania',
  'https://www.reddit.com/r/TechMania/',
]

export interface Breadcrumb {
  name: string
  path: string
}

export const toBreadcrumbList = (items: Breadcrumb[]): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: toAbsoluteUrl(item.path),
  })),
})

interface Submission {
  name: string
  description: string
  image?: string
  path: string
  submitter: { name: string; path: string }
  createdAt: string
  updatedAt: string
  rating: { count: number; avg: number }
}

/** A pattern, skin or setlist someone uploaded */
export const toCreativeWork = (work: Submission): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  name: work.name,
  description: work.description,
  image: work.image || DEFAULT_OG_IMAGE,
  url: toAbsoluteUrl(work.path),
  author: {
    '@type': 'Person',
    name: work.submitter.name,
    url: toAbsoluteUrl(work.submitter.path),
  },
  dateCreated: work.createdAt,
  dateModified: work.updatedAt,
  about: GAME,
  ...(work.rating.count > 0 && {
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: Number(work.rating.avg.toFixed(2)),
      ratingCount: work.rating.count,
      bestRating: 5,
      worstRating: 1,
    },
  }),
})
