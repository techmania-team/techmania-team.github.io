export function cleanPattern (state, data) {
  state._id = ''
  state.name = ''
  state.type = 0
  state.link = ''
  state.previews = [{ link: '', name: '' }]
  state.description = ''
  state.submitter = { name: '', _id: '' }
}

export function setPattern (state, data) {
  state._id = data._id
  state.name = data.name
  state.type = data.type
  state.link = data.link
  state.previews = data.previews
  state.description = data.description
  state.submitter = data.submitter
}
