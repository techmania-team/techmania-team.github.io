import { Router } from 'express'
import { StatusCodes } from 'http-status-codes'
import Pattern from '../models/pattern.js'
import Setlist from '../models/setlist.js'
import Skin from '../models/skin.js'

const router = Router()

// Must match the canonical links the pages print, see src/utils/url.ts
const BASE_URL = new URL(import.meta.env.QCLI_HOST_URL || 'http://localhost').origin

// Must match localeOptions in src/i18n/index.ts
const LOCALES = ['en-US', 'zh-TW', 'zh-CN', 'ja-JP', 'ko-KR']

/** How long a generated sitemap stays valid before it is rebuilt */
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

/** Generate <url> entries for a path with all locale prefix variants */
function buildUrls(path: string, lastmod?: string): string {
  const lastmodTag = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''
  const entries: string[] = []

  for (const locale of LOCALES) {
    entries.push(`  <url>
    <loc>${BASE_URL}/${locale}${path}</loc>${lastmodTag}
  </url>`)
  }

  return entries.join('\n')
}

/** Format a timestamp as YYYY-MM-DD, the granularity <lastmod> needs */
function toLastmod(date: Date): string | undefined {
  return date instanceof Date ? date.toISOString().split('T')[0] : undefined
}

const TIMESTAMPED = { _id: 1, updatedAt: 1 } as const

interface TimestampedDoc {
  _id: { toString: () => string }
  updatedAt: Date
}

/** Drain a cursor of timestamped documents into <url> entries */
async function appendDocUrls(
  chunks: string[],
  prefix: string,
  cursor: AsyncIterable<TimestampedDoc>,
): Promise<void> {
  for await (const doc of cursor) {
    chunks.push(buildUrls(`${prefix}/${doc._id.toString()}`, toLastmod(doc.updatedAt)))
  }
}

/**
 * Build the whole sitemap.
 *
 * Every collection is walked with a cursor rather than materialised through
 * `.find().lean()`: the previous version held four full collections, an array
 * of per-document string fragments and the joined result in the heap at the
 * same time, which is a sizeable spike whenever a crawler shows up.
 */
async function buildSitemap(): Promise<string> {
  const chunks: string[] = ['<?xml version="1.0" encoding="UTF-8"?>']
  chunks.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')

  // No lastmod: these change with every upload, and a date that is always
  // today teaches crawlers to ignore lastmod for the whole file. The home page
  // is '' so it matches the canonical /en-US rather than /en-US/.
  for (const path of ['', '/changelog', '/howtoplay', '/patterns', '/skins', '/setlists']) {
    chunks.push(buildUrls(path))
  }

  await appendDocUrls(chunks, '/patterns', Pattern.find({}, TIMESTAMPED).lean().cursor())
  await appendDocUrls(chunks, '/skins', Skin.find({}, TIMESTAMPED).lean().cursor())
  await appendDocUrls(chunks, '/setlists', Setlist.find({}, TIMESTAMPED).lean().cursor())

  // Only the profile tabs that have something on them. Most accounts only
  // ever log in to comment, and an empty tab is a thin page in every locale.
  // users/:id redirects to users/:id/patterns, so use the sub-pages directly.
  // User model has no timestamps, so no lastmod.
  const tabs: [string, Promise<unknown[]>][] = [
    ['patterns', Pattern.distinct('submitter').exec()],
    ['skins', Skin.distinct('submitter').exec()],
    ['setlists', Setlist.distinct('submitter').exec()],
  ]
  for (const [tab, submitters] of tabs) {
    for (const id of await submitters) {
      chunks.push(buildUrls(`/users/${String(id)}/${tab}`))
    }
  }

  chunks.push('</urlset>')

  return chunks.join('\n')
}

let cachedXml: string | null = null
let cachedAt = 0
/**
 * Crawlers arrive in bursts. Without this, N concurrent requests each start
 * their own full scan of every collection; they now share one build.
 */
let inFlight: Promise<string> | null = null

async function getSitemap(): Promise<string> {
  if (cachedXml !== null && Date.now() - cachedAt < CACHE_TTL) {
    return cachedXml
  }

  inFlight ??= buildSitemap()
    .then((xml) => {
      cachedXml = xml
      cachedAt = Date.now()
      return xml
    })
    .finally(() => {
      inFlight = null
    })

  return inFlight
}

router.get('/', async (_req, res) => {
  try {
    const xml = await getSitemap()

    res.header('Content-Type', 'application/xml')
    res.header('Cache-Control', `public, max-age=${CACHE_TTL / 1000}`)
    res.send(xml)
  } catch (error) {
    console.error('[sitemap] Error generating sitemap:', error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Failed to generate sitemap')
  }
})

export default router
