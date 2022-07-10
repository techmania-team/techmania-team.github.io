export function getSkin (state) {
  return (({ comments, ...others }) => others)(state)
}

export function getFormattedComments (state) {
  const comments = JSON.parse(JSON.stringify(state.comments))
  const myComment = JSON.parse(JSON.stringify(state.myComment))
  // Add user comment to the begining of comments array
  if (myComment._id.length > 0) comments.unshift(myComment)
  // Format comments array to fit q-tree component array format
  return comments.map(comment => {
    const cid = comment._id
    comment.cid = cid
    if (comment.replies) {
      comment.replies = comment.replies.map(reply => {
        reply.user.avatar = ((reply.user.discord?.length || 0) === 0 || (reply.user.avatar?.length || 0) === 0) ? 'https://raw.githubusercontent.com/techmania-team/techmania-team.github.io/master/public/assets/Logo_black.png' : `https://cdn.discordapp.com/avatars/${reply.user.discord}/${reply.user.avatar}.png`
        reply.cid = cid
        return reply
      })
      const first = comment.replies.shift()
      return { ...comment, ...first }
    } else return comment
  })
}
