import { formatDistanceToNow } from 'date-fns'
import parseISO from 'date-fns/fp/parseISO'
import { enUS, ja, ko, zhCN, zhTW } from 'date-fns/locale'
import { useI18n } from 'vue-i18n'

const locales = {
  'en-US': enUS,
  'zh-TW': zhTW,
  'zh-CN': zhCN,
  'ja-JP': ja,
  'ko-KR': ko,
}

export const toRelative = (date) => {
  const { locale } = useI18n()
  return formatDistanceToNow(parseISO(date), {
    locale: locales[locale.value],
    addSuffix: true,
  })
}

export const toLocaleString = (date) => {
  const { locale } = useI18n()
  return new Date(date).toLocaleString(locale.value)
}
