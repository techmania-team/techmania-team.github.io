import { defineBoot } from '#q-app/wrappers'
import { formatDistanceToNow } from 'date-fns'
import { enUS, ja, ko, zhCN, zhTW } from 'date-fns/locale'

export default defineBoot(({ app }) => {
  app.config.globalProperties.$date = {
    formatDistanceToNow,
    locales: { enUS, ja, ko, zhCN, zhTW }
  }
})

