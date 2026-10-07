import type { UseQueryOptions } from '@pinia/colada'
import type { Pinia } from 'pinia'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { useQueryCache } from '@pinia/colada'
import { isAxiosError } from 'axios'
import validator from 'validator'
import { useNotFoundStore } from '@/stores/notFound'

interface PrefetchContext {
  currentRoute: RouteLocationNormalizedLoaded
  store: Pinia
}

/**
 * preFetch for a page that shows one document by id.
 *
 * Warms the same cache entry the page reads, so it is not fetched twice, and
 * refresh() reuses still-fresh data, so navigating back does not refetch.
 * When the id points at nothing, the layout renders the 404 page in place of
 * this one. Any other failure leaves the page to render and retry on the
 * client, so a hiccup in the API does not tell crawlers the page is gone.
 */
export async function prefetchById<TData, TError, TDataInitial extends TData | undefined>(
  { currentRoute, store }: PrefetchContext,
  id: string | undefined,
  query: (id: string) => UseQueryOptions<TData, TError, TDataInitial>,
): Promise<void> {
  const notFound = useNotFoundStore(store)

  if (!id || !validator.isMongoId(id)) {
    notFound.mark(currentRoute.fullPath)
    return
  }

  const queryCache = useQueryCache(store)
  try {
    await queryCache.refresh(queryCache.ensure(query(id)))
    notFound.clear()
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      notFound.mark(currentRoute.fullPath)
    }
  }
}
