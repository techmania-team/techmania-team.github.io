import Vue from 'vue'
import Vuex from 'vuex'
import user from './user'
import tempPattern from './temp-pattern'
import tempSkin from './temp-skin'
import tempIndex from './temp-index'
import tempProfile from './temp-profile'

Vue.use(Vuex)

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default function ({ ssrContext }) {
  const Store = new Vuex.Store({
    modules: {
      user,
      tempPattern,
      tempIndex,
      tempProfile,
      tempSkin
    },
    // enable strict mode (adds overhead!)
    // for dev mode only
    strict: process.env.DEBUGGING
  })

  return Store
}
