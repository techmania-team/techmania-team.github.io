import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from 'src/utils/api'
import { useUserStore } from './user'
import handleError from 'src/utils/handleError'

export const useTempPatternStore = defineStore('temp-pattern', () => {
  const _id = ref('')
  const name = ref('')
  const composer = ref('')
  const keysounded = ref('')
  const difficulties = ref([])
  const link = ref('')
  const previews = ref([])
  const image = ref('')
  const description = ref('')
  const submitter = ref({ name: '', _id: '' })
  const comments = ref([])
  const myComment = ref({ rating: 0, comment: '', replies: [], _id: '' })
  const rating = ref({
    rating: 0,
    count: 0,
  })
  const commentsScrollDisabled = ref(false)

  const user = useUserStore()

  const getFormattedComments = () => {
    const comments = comments.value
    const myComment = myComment.value
    // Add user comment to the begining of comments array
    if (myComment._id.length > 0) comments.unshift(myComment)
    // Format comments array to fit q-tree component array format
    return comments.map((comment) => {
      const cid = comment._id
      comment.cid = cid
      if (comment.replies) {
        comment.replies = comment.replies.map((reply) => {
          reply.cid = cid
          return reply
        })
        const first = comment.replies.shift()
        return { ...comment, ...first }
      } else return comment
    })
  }

  const setPattern = (data) => {
    _id.value = data._id
    name.value = data.name
    composer.value = data.composer
    keysounded.value = data.keysounded
    difficulties.value = data.difficulties
    link.value = data.link
    previews.value = data.previews
    description.value = data.description
    submitter.value.name.value = data.submitter.name
    submitter.value._id.value = data.submitter._id
    rating.value = data.rating
    image.value = data.image
  }

  const setComments = (data) => {
    comments.value = comments.value.concat(data)
  }

  const setMyComment = (data) => {
    data.replies[0].user = {
      _id: user._id,
      name: user.username,
      avatar: user.avatar,
    }
    myComment.value = data
  }

  const setVote = (data) => {
    let ridx = -1
    let vidx = -1
    if (data.cid === myComment.value._id) {
      ridx = myComment.value.replies.findIndex((reply) => reply._id === data.rid)
      if (ridx > -1) {
        vidx = myComment.value.replies[ridx].votes.findIndex((vote) => vote.user === user._id)
        if (vidx > -1) {
          if (data.positive === 0) myComment.value.replies[ridx].votes.splice(vidx, 1)
          else myComment.value.replies[ridx].votes[vidx].positive = data.positive
        } else {
          myComment.value.replies[ridx].votes.push({
            positive: data.positive,
            user: user._id,
          })
        }
      }
    } else {
      for (const i in comments.value) {
        if (comments.value[i]._id !== data.cid) continue
        else {
          ridx = comments.value[i].replies.findIndex((reply) => reply._id === data.rid)
          if (ridx > -1) {
            vidx = comments.value[i].replies[ridx].votes.findIndex((vote) => vote.user === user._id)
            if (vidx > -1) {
              if (data.positive === 0) comments.value[i].replies[ridx].votes.splice(vidx, 1)
              else comments.value[i].replies[ridx].votes[vidx].positive = data.positive
            } else {
              comments.value[i].replies[ridx].votes.push({
                positive: data.positive,
                user: user._id,
              })
            }
          }
        }
      }
    }
  }

  const setCommentsScrollDisable = () => {
    commentsScrollDisabled.value = true
  }

  const editMyComment = (data) => {
    myComment.value.rating = data.rating
    myComment.value.replies[0].comment = data.comment
  }

  const editReplyData = (data) => {
    if (myComment.value._id === data.cid) {
      const ridx = myComment.value.replies.findIndex((reply) => reply._id === data.rid)
      if (ridx > -1) {
        if (data.comment) {
          myComment.value.replies[ridx].comment = data.comment
        }
        if (data.deleted !== undefined) {
          myComment.value.replies[ridx].deleted = data.deleted
        }
      }
    } else {
      const cidx = comments.value.findIndex((comment) => comment._id === data.cid)
      if (cidx > -1) {
        const ridx = comments.value[cidx].replies.findIndex((reply) => reply._id === data.rid)
        if (ridx > -1) {
          if (data.comment) {
            comments.value[cidx].replies[ridx].comment = data.comment
          }
          if (data.deleted !== undefined) {
            comments.value[cidx].replies[ridx].deleted = data.deleted
          }
        }
      }
    }
  }

  const createReply = (data) => {
    data.result.user = {
      _id: user._id,
      name: user.username,
      avatar: user.avatar,
      discord: user.discord,
    }
    if (myComment.value._id === data.cid) {
      myComment.value.replies.push({
        ...data.result,
        comment: data.comment,
      })
    } else {
      const cidx = comments.value.findIndex((comment) => comment._id === data.cid)
      if (cidx > -1) {
        comments.value[cidx].replies.push({
          ...data.result,
          comment: data.comment,
        })
      }
    }
  }

  const fetchPattern = (id) => {
    return api.get(`/patterns/${id}`).then(
      ({ data }) => {
        setPattern(data.result)
      },
      () => {},
    )
  }

  const fetchComments = ({ id, start }) => {
    return api.get(`/comments/patterns/${id}?skip=${start}`).then(
      ({ data }) => {
        // If user is logged in, remove user's comment
        if (user.jwt.length > 0) {
          data.result = data.result.filter((comment) => {
            return comment.replies[0].user._id !== user._id
          })
        }
        if (data.result.length === 0) setCommentsScrollDisable()
        else setComments(data.result)
      },
      () => {
        setCommentsScrollDisable()
      },
    )
  }

  const fetchMyComment = (id) => {
    if (user.jwt.length === 0) return
    return api
      .get(`/comments/patterns/${id}/my`, {
        headers: { Authorization: `Bearer ${user.jwt}` },
      })
      .then(
        ({ data }) => {
          if (data.result.length > 0) setMyComment(data.result[0])
        },
        () => {},
      )
  }

  const submitComment = async (data) => {
    try {
      const response = await api.post(
        '/comments/',
        {
          rating: data.rating,
          comment: data.comment,
          pattern: _id.value,
          'g-recaptcha-response': data.token,
        },
        { headers: { Authorization: `Bearer ${user.jwt}` } },
      )
      setMyComment({ ...response.data.result })
      await updateRating()
    } catch (error) {
      handleError(error)
    }
  }

  const vote = async (data) => {
    try {
      await api.patch(
        `/comments/${data.cid}/replies/${data.rid}/votes`,
        { positive: data.positive },
        { headers: { Authorization: `Bearer ${user.jwt}` } },
      )
      setVote(data)
    } catch (error) {
      handleError(error)
    }
  }

  const updateRating = async () => {
    try {
      const { data } = await api.get(`/comments/patterns/${_id.value}/rating`)
      rating.value.rating.value = data.result.rating
      rating.value.count.value = data.result.count
    } catch (error) {
      handleError(error)
    }
  }

  const reply = async (data) => {
    try {
      const { data: result } = await api.post(
        `/comments/${data.cid}/replies`,
        { comment: data.comment, 'g-recaptcha-response': data.token },
        {
          headers: { Authorization: `Bearer ${user.jwt}` },
        },
      )
      createReply({ result: result.result, cid: data.cid, comment: data.comment })
    } catch (error) {
      handleError(error)
    }
  }

  const editComment = async (data) => {
    try {
      await api.patch(
        `/comments/${data.cid}`,
        { rating: data.rating, comment: data.comment, 'g-recaptcha-response': data.token },
        { headers: { Authorization: `Bearer ${user.jwt}` } },
      )
      editMyComment({ rating: data.rating, comment: data.comment })
      await updateRating()
    } catch (error) {
      handleError(error)
    }
  }

  const editReply = async (data) => {
    try {
      await api.patch(
        `/comments/${data.cid}/replies/${data._id}`,
        { comment: data.comment, 'g-recaptcha-response': data.token },
        { headers: { Authorization: `Bearer ${user.jwt}` } },
      )
      editReplyData({ cid: data.cid, rid: data._id, comment: data.comment })
    } catch (error) {
      handleError(error)
    }
  }

  const deleteMyComment = async (data) => {
    try {
      await api.delete(`/comments/${data.cid}`, {
        headers: { Authorization: `Bearer ${user.jwt}` },
      })
      myComment.value._id = ''
      myComment.value.rating = 0
      myComment.value.comment = ''
      myComment.value.replies = []
      updateRating()
    } catch (error) {
      handleError(error)
    }
  }

  const deleteReply = async (data) => {
    try {
      await api.patch(
        `/comments/${data.cid}/replies/${data._id}`,
        { deleted: true, 'g-recaptcha-response': data.token },
        {
          headers: { Authorization: `Bearer ${user.jwt}` },
        },
      )
      editReplyData({ cid: data.cid, rid: data._id, deleted: true })
    } catch (error) {
      handleError(error)
    }
  }

  const clearData = () => {
    _id.value = ''
    name.value = ''
    composer.value = ''
    keysounded.value = ''
    difficulties.value = []
    link.value = ''
    previews.value = []
    image.value = ''
    description.value = ''
    submitter.value = { name: '', _id: '' }
    comments.value = []
    myComment.value = { rating: 0, comment: '', replies: [], _id: '' }
    rating.value = {
      rating: 0,
      count: 0,
    }
    commentsScrollDisabled.value = false
  }

  return {
    _id,
    name,
    composer,
    keysounded,
    difficulties,
    link,
    previews,
    image,
    description,
    submitter,
    comments,
    myComment,
    rating,
    commentsScrollDisabled,
    getFormattedComments,
    setPattern,
    setComments,
    setMyComment,
    setVote,
    setCommentsScrollDisable,
    editMyComment,
    editReplyData,
    createReply,
    fetchPattern,
    fetchComments,
    fetchMyComment,
    submitComment,
    vote,
    updateRating,
    reply,
    editComment,
    editReply,
    deleteMyComment,
    deleteReply,
    clearData,
  }
})
