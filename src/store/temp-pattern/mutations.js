export function resetPattern (state, data) {
  state._id = ''
  state.name = ''
  state.composer = ''
  state.keysounded = ''
  state.difficulties = []
  state.link = ''
  state.previews = []
  state.image = ''
  state.description = ''
  state.submitter.name = ''
  state.submitter._id = ''
  state.comments = []
  state.myComment = { rating: 0, comment: '', replies: [], _id: '' }
  state.rating.rating = 0
  state.rating.count = 0
  state.commentsScrollDisabled = false
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
  state.rating = data.rating
  state.image = data.image
}

export function setComments (state, data) {
  state.comments = state.comments.concat(data)
}

export function setMyComment (state, data) {
  data.replies[0].user = { _id: this.state.user._id, name: this.state.user.username, avatar: this.state.user.avatar, discord: this.state.user.discord }
  state.myComment = data
}

export function setVote (state, data) {
  let ridx = -1
  let vidx = -1
  if (data.cid === state.myComment._id) {
    ridx = state.myComment.replies.findIndex(reply => reply._id === data.rid)
    if (ridx > -1) {
      vidx = state.myComment.replies[ridx].votes.findIndex(vote => vote.user === this.state.user._id)
      if (vidx > -1) {
        if (data.positive === 0) state.myComment.replies[ridx].votes.splice(vidx, 1)
        else state.myComment.replies[ridx].votes[vidx].positive = data.positive
      } else {
        state.myComment.replies[ridx].votes.push({ positive: data.positive, user: this.state.user._id })
      }
    }
  } else {
    for (const i in state.comments) {
      if (state.comments[i]._id !== data.cid) continue
      else {
        ridx = state.comments[i].replies.findIndex(reply => reply._id === data.rid)
        if (ridx > -1) {
          vidx = state.comments[i].replies[ridx].votes.findIndex(vote => vote.user === this.state.user._id)
          if (vidx > -1) {
            if (data.positive === 0) state.comments[i].replies[ridx].votes.splice(vidx, 1)
            else state.comments[i].replies[ridx].votes[vidx].positive = data.positive
          } else {
            state.comments[i].replies[ridx].votes.push({ positive: data.positive, user: this.state.user._id })
          }
        }
      }
    }
  }
}

export function setCommentsScrollDisable (state) {
  state.commentsScrollDisabled = true
}

export function editMyComment (state, data) {
  state.myComment.rating = data.rating
  state.myComment.replies[0].comment = data.comment
}

export function editReply (state, data) {
  if (state.myComment._id === data.cid) {
    const ridx = state.myComment.replies.findIndex(reply => reply._id === data.rid)
    console.log(ridx)
    if (ridx > -1) {
      state.myComment.replies[ridx].comment = data.comment
    }
  } else {
    const cidx = state.comments.findIndex(comment => comment._id === data.cid)
    console.log(cidx)
    if (cidx > -1) {
      const ridx = state.comments[cidx].replies.findIndex(reply => reply._id === data.rid)
      console.log(ridx)
      if (ridx > -1) {
        state.comments[cidx].replies[ridx].comment = data.comment
      }
    }
  }
}

export function createReply (state, data) {
  data.result.user = { _id: this.state.user._id, name: this.state.user.username, avatar: this.state.user.avatar, discord: this.state.user.discord }
  if (state.myComment._id === data.cid) {
    console.log('my')
    state.myComment.replies.push({
      ...data.result,
      comment: data.comment
    })
  } else {
    const cidx = state.comments.findIndex(comment => comment._id === data.cid)
    console.log(cidx)
    if (cidx > -1) {
      state.comments[cidx].replies.push({
        ...data.result,
        comment: data.comment
      })
    }
  }
}

export function updateRating (state, data) {
  state.rating.rating = data.rating
  state.rating.count = data.count
}
