import { formatDistanceToNow } from 'date-fns'
import { parseISO } from 'date-fns/fp/parseISO'
import { enUS, ja, ko, zhCN, zhTW } from 'date-fns/locale'
import { useI18n } from 'vue-i18n'

const locales = {
  'en-US': enUS,
  'zh-TW': zhTW,
  'zh-CN': zhCN,
  'ja-JP': ja,
  'ko-KR': ko,
}

export const toRelative = (date: string) => {
  const i18n = useI18n()
  if (!date || !i18n) return ''

  const currentLocale = i18n.locale.value as keyof typeof locales

  return formatDistanceToNow(parseISO(date), {
    locale: locales[currentLocale],
    addSuffix: true,
  })
}

export const toLocaleString = (date: string) => {
  const i18n = useI18n()
  if (!date || !i18n) return ''
  return new Date(date).toLocaleString(i18n.locale.value)
}
