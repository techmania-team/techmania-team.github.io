import Quasar from 'quasar'

export default function () {
  return {
    token: '',
    id: '',
    discord: '',
    username: '',
    avatar: '',
    jwt: '',
    locale: Quasar.lang.getLocale()
  }
}
