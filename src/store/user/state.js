import Quasar from 'quasar'

export default function () {
  return {
    token: '',
    id: '',
    discord: '',
    username: '',
    avatar: '',
    jwt: '',
    jwtReceived: 0,
    locale: Quasar.lang.getLocale()
  }
}
