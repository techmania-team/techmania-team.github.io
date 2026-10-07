import type { MaybeRefOrGetter } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { useMeta } from 'quasar'
import { computed, toValue } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { localeOptions } from '@/i18n'
import { DEFAULT_OG_IMAGE, toAbsoluteUrl } from '@/utils/url'

/** One schema.org node, see https://schema.org */
export type JsonLd = Record<string, unknown>

export interface SeoMetaOptions {
  title: MaybeRefOrGetter<string>
  description: MaybeRefOrGetter<string>
  /** Absolute URL of the preview image, the site logo when left out */
  image?: MaybeRefOrGetter<string | undefined>
  type?: MaybeRefOrGetter<'article' | 'profile' | 'website'>
  /** Keep the page out of search results. It then gets no canonical or hreflang either. */
  noindex?: MaybeRefOrGetter<boolean>
  /** Structured data, written to the page as a JSON-LD script */
  jsonLd?: MaybeRefOrGetter<JsonLd | JsonLd[] | undefined>
}

/** og:locale wants an underscore, e.g. zh_TW */
const toOgLocale = (locale: string) => locale.replace('-', '_')

/**
 * Title, description, social previews, canonical and hreflang links for the
 * current page.
 *
 * Every locale serves the same page under its own prefix, so each page links
 * to all of its translations and to the unprefixed URL as x-default. The
 * unprefixed URL redirects by Accept-Language (see src/boot/i18n.ts), which is
 * what x-default is meant for.
 */
export function useSeoMeta(options: SeoMetaOptions) {
  const route = useRoute()
  const router = useRouter()
  const { locale } = useI18n()

  /** The query only filters or sorts what the path already shows */
  const canonical = computed(() => toAbsoluteUrl(route.path))

  const localizedUrl = (target: string) => {
    const location = {
      name: route.name,
      params: { ...route.params, locale: target },
    } as RouteLocationRaw
    return toAbsoluteUrl(router.resolve(location).path)
  }

  const alternates = computed(() => {
    const links: Record<string, { rel: string; hreflang: string; href: string }> = {}
    for (const target of localeOptions) {
      links[`alternate-${target}`] = {
        rel: 'alternate',
        hreflang: target,
        href: localizedUrl(target),
      }
    }
    links['alternate-x-default'] = {
      rel: 'alternate',
      hreflang: 'x-default',
      href: localizedUrl(''),
    }
    return links
  })

  useMeta(() => {
    const title = toValue(options.title)
    const description = toValue(options.description)
    const image = toValue(options.image) || DEFAULT_OG_IMAGE
    const noindex = toValue(options.noindex) ?? false
    const jsonLd = toValue(options.jsonLd)

    return {
      title,
      meta: {
        description: { name: 'description', content: description },
        ...(noindex && { robots: { name: 'robots', content: 'noindex' } }),
        ogType: { property: 'og:type', content: toValue(options.type) ?? 'website' },
        ogSiteName: { property: 'og:site_name', content: 'TECHMANIA' },
        ogLocale: { property: 'og:locale', content: toOgLocale(locale.value) },
        ogUrl: { property: 'og:url', content: canonical.value },
        ogTitle: { property: 'og:title', content: title },
        ogDescription: { property: 'og:description', content: description },
        ogImage: { property: 'og:image', content: image },
        // Twitter reads the og:* tags above for everything else
        twCard: { name: 'twitter:card', content: 'summary_large_image' },
      },
      link: noindex
        ? {}
        : { canonical: { rel: 'canonical', href: canonical.value }, ...alternates.value },
      script: jsonLd
        ? { ldJson: { type: 'application/ld+json', innerHTML: JSON.stringify(jsonLd) } }
        : {},
    }
  })
}
