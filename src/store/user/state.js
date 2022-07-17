import { Quasar } from 'quasar'

export default function () {
  return {
    token: '',
    _id: '',
    discord: '',
    username: '',
    avatar: '',
    jwt: '',
    jwtReceived: 0,
    locale: Quasar.lang.getLocale()
  }
}
