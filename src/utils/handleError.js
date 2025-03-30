import { Notify } from 'quasar'
import { i18n } from 'src/i18n'

export default (error) => {
  if (process.env.DEBUGGING) {
    console.error(error)
  }

  Notify.create({
    icon: 'warning',
    color: 'negative',
    message: i18n.global.t('error.unknown'),
  })
}
