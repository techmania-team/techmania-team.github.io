export const controls = ['touch', 'keys', 'km']
export const controls_capitalize = ['Touch', 'Keys', 'KM']

export enum CONTROLTYPE {
  TOUCH = 0,
  KEYS,
  KM,
}

export const getControlIcon = (control: CONTROLTYPE) => {
  switch (control) {
    case CONTROLTYPE.TOUCH:
      return 'touch_app'
    case CONTROLTYPE.KEYS:
      return 'keyboard'
    case CONTROLTYPE.KM:
      return 'img:/assets/icons/KM.svg'
  }
}
