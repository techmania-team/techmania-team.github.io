import { formatDistanceToNow } from 'date-fns'
import { enUS, ja, ko, zhCN, zhTW } from 'date-fns/locale'

export default {
  formatDistanceToNow,
  locales: {
    'en-US': enUS,
    'zh-TW': zhTW,
    'zh-CN': zhCN,
    'ja-JP': ja,
    'ko-KR': ko,
  },
}
