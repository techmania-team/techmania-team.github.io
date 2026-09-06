import type { _UseQueryEntryNodeValueSerialized } from '@pinia/colada'
import type { StateTree } from 'pinia'
import {
  hydrateQueryCache,
  PiniaColada,
  PiniaColadaSSRNoGc,
  serializeQueryCache,
  useQueryCache,
} from '@pinia/colada'
import { defineBoot } from '#q-app'

/**
 * Pinia Colada keeps its cache in Pinia stores of its own. Their state is not
 * plain data, so it cannot travel to the client the way a normal store does:
 * it has to go through serializeQueryCache()/hydrateQueryCache().
 *
 * Pinia Colada only ships an SSR module for Nuxt, so the wiring below is what
 * that module would otherwise do for us. It relies on two quasar.config.ts
 * flags, `manualStoreSsrContextInjection` and `manualStoreHydration`, which
 * hand us both ends of the transfer.
 *
 * Note: this boot file must stay FIRST in the boot list. Quasar normally
 * hydrates the store before any boot file runs; now that we do it ourselves,
 * it has to happen before another boot file (src/boot/auth.ts) instantiates a
 * store, because Pinia can only apply initial state to a store that does not
 * exist yet.
 */

/** Pinia Colada's own stores, excluded from the plain-state payload */
const COLADA_STORE_IDS = ['_pc_query', '_pc_mutation']

export interface QuasarInitialState {
  pinia: Record<string, StateTree>
  colada: Record<string, _UseQueryEntryNodeValueSerialized>
}

export default defineBoot(({ app, store, ssrContext }) => {
  app.use(PiniaColada, {
    // On the server the gc timers would both keep the process awake and hold
    // every entry alive across requests through their setTimeout closures
    plugins: import.meta.env.QUASAR_SERVER ? [PiniaColadaSSRNoGc()] : [],
  })

  // Compile-time constant, so the client branch below (and its `window`
  // reference) is dropped from the server bundle entirely
  if (import.meta.env.QUASAR_SERVER) {
    // Runs after renderToString, so the cache already holds whatever the
    // queries resolved to, and before Quasar turns ssrContext.state into the
    // window.__INITIAL_STATE__ script tag
    ssrContext?.onRendered(() => {
      const pinia = { ...store.state.value }
      for (const id of COLADA_STORE_IDS) {
        delete pinia[id]
      }

      ssrContext.state = {
        pinia,
        colada: serializeQueryCache(useQueryCache(store)),
      } satisfies QuasarInitialState
    })

    return
  }

  const initialState = window.__INITIAL_STATE__

  if (initialState !== undefined) {
    store.state.value = initialState.pinia
    hydrateQueryCache(useQueryCache(store), initialState.colada)

    // Same reasoning as Quasar's own hydration step
    delete window.__INITIAL_STATE__
  }
})
