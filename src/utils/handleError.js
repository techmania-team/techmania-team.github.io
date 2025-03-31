import { Notify } from 'quasar'
import { i18n } from 'src/i18n'
import { useUserStore } from 'src/stores/user'
import { getI18nRoute } from 'src/i18n'
import { useRouter } from 'vue-router'

export const handleError = (error) => {
  if (process.env.DEBUGGING) {
    console.error(error)
  }

  Notify.create({
    icon: 'warning',
    color: 'negative',
    message: i18n.global.t('error.unknown'),
  })
}

/**
 * Handle form submit errors
 * @param {*} error Error object
 * @param {*} page Page name
 * @param {*} action Action name
 * @param {*} noLoginRedirectRoute Route to redirect to if user is not logged in
 */
export const handleFormSubmitError = (error, page, action, noLoginRedirectRoute) => {
  const user = useUserStore()
  const router = useRouter()
  const { t } = i18n.global
  switch (error.response.data.message) {
    case 'Not in guild':
      Notify.create({
        icon: 'warning',
        message: t(`${page}.result.${action}NotInGuild`),
        color: 'negative',
      })
      break
    case 'Permission':
      Notify.create({
        icon: 'warning',
        message: t(`${page}.result.${action}Permission`),
        color: 'negative',
      })
      break
    case 'Unauthorized':
      Notify.create({
        icon: 'warning',
        message: t(`${page}.result.${action}Unauthorized`),
        color: 'negative',
      })
      user.clearData()
      router.push(getI18nRoute({ name: noLoginRedirectRoute }))
      break
    default:
      handleError(error)
      break
  }
}
