import { formatDistanceToNow } from 'date-fns'
import { enUS, ja, ko, zhCN, zhTW } from 'date-fns/locale'
import Vue from 'vue'

Vue.prototype.$date = {
  formatDistanceToNow,
  locales: { enUS, ja, ko, zhCN, zhTW }
}
