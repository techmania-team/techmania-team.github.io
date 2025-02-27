import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Lang } from 'quasar'
import { useRouter } from 'vue-router'
import api from 'src/utils/api'
import axios from 'axios'
import handleError from 'src/utils/handleError'

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref('')
    const _id = ref('')
    const username = ref('')
    const avatar = ref('')
    const jwt = ref('')
    const locale = ref(Lang.getLocale())

    const router = useRouter()

    const verify = async (query) => {
      if (process.env.CLIENT) {
        try {
          if (query.jwt) {
            jwt.value = query.jwt
            router.replace({ query: {} })
          }

          if (jwt.value.length > 0) {
            const { data: loginData } = await api.get('/users/verify', {
              headers: {
                Authorization: `Bearer ${jwt.value}`,
              },
            })
            username.value = loginData.resultusername
            avatar.value = loginData.resultavatar
            _id.value = loginData.result_id
            token.value = loginData.resulttoken
            const { data } = await axios.get('https://discord.com/api/users/@me', {
              headers: {
                Authorization: `Bearer ${token.value}`,
              },
            })
            username.value = data.username
            avatar.value = data.avatar
          }
        } catch (error) {
          console.log(error)
          clearData()
        }
      }
    }

    const logout = async () => {
      try {
        if (jwt.value.length > 0) {
          await api.delete('/users/logout', {
            headers: { Authorization: `Bearer ${jwt.value}` },
          })
        }
      } catch (error) {
        handleError(error)
      }
      clearData()
      router.push('/')
    }

    const clearData = () => {
      token.value = ''
      _id.value = ''
      username.value = ''
      avatar.value = ''
      jwt.value = ''
    }

    return {
      token,
      _id,
      username,
      avatar,
      jwt,
      locale,
      verify,
      logout,
      clearData,
    }
  },
  {
    persist: true,
    pick: ['locale', 'jwt'],
    key: 'techmania-v2',
  },
)
