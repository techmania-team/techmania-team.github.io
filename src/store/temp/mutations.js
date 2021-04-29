export function cleanPattern (state, data) {
  state.pattern = {
    _id: '',
    name: '',
    composer: '',
    keysounded: '',
    difficulties: [],
    link: '',
    previews: [],
    description: '',
    submitter: { name: '', _id: '' }
  }
}

export function setPattern (state, data) {
  state.pattern = data
}
