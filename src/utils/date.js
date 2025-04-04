import { formatDistanceToNow } from 'date-fns'
import parseISO from 'date-fns/fp/parseISO'
import { enUS, ja, ko, zhCN, zhTW } from 'date-fns/locale'
import { i18n } from 'src/i18n'

const locales = {
  'en-US': enUS,
  'zh-TW': zhTW,
  'zh-CN': zhCN,
  'ja-JP': ja,
  'ko-KR': ko,
}

export const toRelative = (date) => {
  if (!date || !i18n) return ''
  return formatDistanceToNow(parseISO(date), {
    locale: locales[i18n.global.locale.value],
    addSuffix: true,
  })
}

export const toLocaleString = (date) => {
  if (!date || !i18n) return ''
  return new Date(date).toLocaleString(i18n.global.locale.value)
}
