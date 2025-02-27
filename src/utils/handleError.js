import { Notify } from 'quasar'

export default (error) => {
  console.error(error)
  Notify.create({
    icon: 'warning',
    color: 'negative',
    message: 'Server Error, please try again.',
  })
}
