import { createStore } from 'vuex'
import user from './user'
import tempPattern from './temp-pattern'
import tempSkin from './temp-skin'
import tempIndex from './temp-index'
import tempProfile from './temp-profile'

export default function (/* { ssrContext } */) {
  const Store = createStore({
    modules: {
      user,
      tempPattern,
      tempIndex,
      tempProfile,
      tempSkin
    },

    // enable strict mode (adds overhead!)
    // for dev mode and --debug builds only
    strict: process.env.DEBUGGING
  })

  return Store
}
