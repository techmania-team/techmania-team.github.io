import type { ApiResponse } from '@/types/api'
import type { AxiosError } from 'axios'
import { Notify } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { getI18nRoute } from '@/i18n'
import { useUserStore } from '@/stores/user'

export const handleError = (error: unknown) => {
  if (import.meta.env.QUASAR_DEBUG) {
    console.error(error)
  }

  const i18n = useI18n()

  Notify.create({
    icon: 'warning',
    color: 'negative',
    message: i18n.t('error.unknown'),
  })
}

/**
 * Handle form submit errors
 * @param {*} error Error object
 * @param {*} page Page name
 * @param {*} action Action name
 * @param {*} noLoginRedirectRoute Route to redirect to if user is not logged in
 */
export const handleFormSubmitError = async (
  error: AxiosError<ApiResponse<undefined>>,
  page: string,
  action: string,
) => {
  const user = useUserStore()
  const router = useRouter()
  const i18n = useI18n()
  const { t } = i18n
  switch (error.response?.data?.message) {
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
      await router.push(getI18nRoute({ name: 'index' }))
      break
    default:
      handleError(error)
      break
  }
}
