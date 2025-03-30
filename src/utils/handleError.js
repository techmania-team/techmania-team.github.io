import { Notify } from 'quasar'
import { useI18n } from 'vue-i18n'

export default (error) => {
  if (process.env.DEBUGGING) {
    console.error(error)
  }

  const { t } = useI18n()

  Notify.create({
    icon: 'warning',
    color: 'negative',
    message: t('error.unknown'),
  })
}
