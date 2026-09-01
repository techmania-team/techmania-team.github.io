import type { ApiResponse } from '@/types/api'
import type { AxiosError } from 'axios'
import { Notify } from 'quasar'
import { getGlobal, getI18nRoute } from '@/i18n'
import { router } from '@/router'
import { useUserStore } from '@/stores/user'

export const handleError = (error: unknown) => {
  if (import.meta.env.QUASAR_DEV) {
    console.error(error)
  }

  const t = getGlobal()?.t
  if (!t) return

  Notify.create({
    icon: 'warning',
    color: 'negative',
    message: t('error.unknown'),
  })
}

/**
 * Handle form submit errors
 * @param {*} error Error object
 * @param {*} page Page name
 * @param {*} action Action name
 */
export const handleFormSubmitError = async (
  error: AxiosError<ApiResponse<undefined>>,
  page: string,
  action: 'create' | 'update' | 'delete',
) => {
  const user = useUserStore()

  const t = getGlobal()?.t
  if (!t) return

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
      await router?.push(getI18nRoute({ name: 'index' }))
      break
    case 'Invalid image URL':
      Notify.create({
        icon: 'warning',
        message: t(`${page}.result.image`),
        color: 'negative',
      })
      break
    default:
      handleError(error)
      break
  }
}
