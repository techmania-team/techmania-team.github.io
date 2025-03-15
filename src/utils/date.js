import { formatDistanceToNow } from 'date-fns'
import parseISO from 'date-fns/fp/parseISO'
import { enUS, ja, ko, zhCN, zhTW } from 'date-fns/locale'
import { useSettingsStore } from 'src/stores/settings'

const locales = {
  'en-US': enUS,
  'zh-TW': zhTW,
  'zh-CN': zhCN,
  'ja-JP': ja,
  'ko-KR': ko,
}

export const toRelative = (date) => {
  const settings = useSettingsStore()
  return formatDistanceToNow(parseISO(date), {
    locale: locales[settings.locale],
    addSuffix: true,
  })
}

export const toLocaleString = (date) => {
  const settings = useSettingsStore()
  return new Date(date).toLocaleString(settings.locale)
}
