import type { RouteLocationRaw } from 'vue-router'
import { useRouter } from 'vue-router'
import { getI18nRoute } from '@/i18n'

/** Path of a route in the current locale, for links written into meta tags and JSON-LD */
export function useLocalePath() {
  const router = useRouter()
  return (to: RouteLocationRaw) => router.resolve(getI18nRoute(to)).path
}
