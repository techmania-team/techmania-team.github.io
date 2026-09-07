import type { QuasarInitialState } from '@/boot/colada'

declare module '#q-app' {
  interface QSsrContext {
    /**
     * Serialized store payload picked up by Quasar and written to the page as
     * window.__INITIAL_STATE__. We fill it in ourselves because
     * `ssr.manualStoreSsrContextInjection` is enabled; see src/boot/colada.ts.
     */
    state?: QuasarInitialState
  }
}

declare global {
  interface Window {
    __INITIAL_STATE__?: QuasarInitialState
  }
}

export {}
