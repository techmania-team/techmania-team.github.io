import { acceptHMRUpdate, defineStore } from 'pinia'
import { shallowRef } from 'vue'

/**
 * Which URL turned out to point at nothing, e.g. a pattern that was deleted.
 *
 * preFetch finds this out before the page renders, and the layout then shows
 * the 404 page in its place. It cannot redirect to the 404 route instead: the
 * response would be a 302 to a page that answers 200, which search engines
 * treat as a soft 404. Keyed by path, so navigating anywhere else clears it.
 */
export const useNotFoundStore = defineStore('notFound', () => {
  const path = shallowRef('')

  const mark = (fullPath: string) => {
    path.value = fullPath
  }

  const clear = () => {
    path.value = ''
  }

  return {
    path,
    mark,
    clear,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useNotFoundStore, import.meta.hot))
}
