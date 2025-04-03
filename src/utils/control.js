export const controls = ['touch', 'keys', 'km']

export const CONTROL_TOUCH = 0
export const CONTROL_KEYS = 1
export const CONTROL_KM = 2

export const getControlIcon = (control) => {
  let icon = ''
  switch (control) {
    case 0:
      icon = 'touch_app'
      break
    case 1:
      icon = 'keyboard'
      break
    case 2:
      icon = 'img:/assets/icons/KM.svg'
      break
  }
  return icon
}
