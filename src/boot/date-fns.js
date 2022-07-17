import { boot } from 'quasar/wrappers'
import { formatDistanceToNow } from 'date-fns'
import { enUS, ja, ko, zhCN, zhTW } from 'date-fns/locale'

const datePlugin = {
  install: (app, options) => {
    app.config.globalProperties.$date = {
      formatDistanceToNow,
      locales: { enUS, ja, ko, zhCN, zhTW }
    }
  }
}
export default boot(({ app }) => {
  // Set i18n instance on app
  app.use(datePlugin)
})
