import { Router } from 'express'
import { StatusCodes } from 'http-status-codes'
import Pattern from '../models/pattern.js'
import Setlist from '../models/setlist.js'
import Skin from '../models/skin.js'
import User from '../models/user.js'

const router = Router()

const BASE_URL = 'https://techmania-team.herokuapp.com'

// Must match localeOptions in src/i18n/index.ts
const LOCALES = ['en-US', 'zh-TW', 'zh-CN', 'ja-JP', 'ko-KR']

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

router.get('/', async (_req, res) => {
  try {
    // Fetch only _id and updatedAt for each collection
    const [patterns, skins, setlists, users] = await Promise.all([
      Pattern.find({}, { _id: 1, updatedAt: 1 }).lean(),
      Skin.find({}, { _id: 1, updatedAt: 1 }).lean(),
      Setlist.find({}, { _id: 1, updatedAt: 1 }).lean(),
      User.find({}, { _id: 1 }).lean(),
    ])

    const today = new Date().toISOString().split('T')[0]

    const staticPages = [
      buildUrls('/', today),
      buildUrls('/changelog', today),
      buildUrls('/howtoplay', today),
      buildUrls('/patterns', today),
      buildUrls('/skins', today),
      buildUrls('/setlists', today),
    ]

    const patternPages = patterns.map((p) => {
      const lastmod = p.updatedAt.toISOString().split('T')[0]
      return buildUrls(`/patterns/${p._id.toString()}`, lastmod)
    })

    const skinPages = skins.map((s) => {
      const lastmod = s.updatedAt.toISOString().split('T')[0]
      return buildUrls(`/skins/${s._id.toString()}`, lastmod)
    })

    const setlistPages = setlists.map((sl) => {
      const lastmod = sl.updatedAt.toISOString().split('T')[0]
      return buildUrls(`/setlists/${sl._id.toString()}`, lastmod)
    })

    // User model has no timestamps, so no lastmod
    // users/:id redirects to users/:id/patterns, so use the sub-pages directly
    const userPages = users.flatMap((u) => [
      buildUrls(`/users/${u._id.toString()}/patterns`),
      buildUrls(`/users/${u._id.toString()}/skins`),
      buildUrls(`/users/${u._id.toString()}/setlists`),
    ])

    const allUrls = [
      ...staticPages,
      ...patternPages,
      ...skinPages,
      ...setlistPages,
      ...userPages,
    ].join('\n')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls}
</urlset>`

    res.header('Content-Type', 'application/xml')
    res.send(xml)
  } catch (error) {
    console.error('[sitemap] Error generating sitemap:', error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Failed to generate sitemap')
  }
})

export default router
