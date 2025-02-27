import { defineRouter } from '#q-app/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import { useStore } from 'vuex'
import routes from './routes'
import gtm from '../components/gtm.js'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  Router.afterEach((to) => {
    if (process.env.CLIENT) {
      document.title = to.meta.title
      gtm.logPage(to.path)
    }
  })

  Router.beforeEach((to, from, next) => {
    const store = useStore()
    if (to.meta.login && store.user.getters.getUserData._id.length === 0) {
      next('/')
    } else {
      next()
    }
  })

  return Router
})
