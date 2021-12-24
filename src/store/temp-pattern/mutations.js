export function resetPattern (state, data) {
  state._id = ''
  state.name = ''
  state.composer = ''
  state.keysounded = ''
  state.difficulties = []
  state.link = ''
  state.previews = []
  state.description = ''
  state.submitter.name = ''
  state.submitter._id = ''
}

export function setPattern (state, data) {
  state._id = data._id
  state.name = data.name
  state.composer = data.composer
  state.keysounded = data.keysounded
  state.difficulties = data.difficulties
  state.link = data.link
  state.previews = data.previews
  state.description = data.description
  state.submitter.name = data.submitter.name
  state.submitter._id = data.submitter._id
}
