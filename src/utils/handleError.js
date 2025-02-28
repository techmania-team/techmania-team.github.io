import { Notify } from 'quasar'

export default (error) => {
  if (process.env.DEBUGGING) {
    console.error(error)
  }

  Notify.create({
    icon: 'warning',
    color: 'negative',
    message: 'Server Error, please try again.',
  })
}
