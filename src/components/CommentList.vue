<template lang="pug">
q-no-ssr.row.q-gutter-y-lg
  //- Rate form
  .col-12(v-if="myComment._id === '' && user.isLogin")
    q-list
      q-item-label.text-h6.text-tech(header) {{ $t('commentList.commentForm.title.' + type) }}
      q-separator.q-mb-md(inset)
      q-item
        q-item-section
          Form(v-slot="{ isSubmitting, handleSubmit }" :validation-schema="rateSchema" :initial-values="rateInitialValues" ref="commentFormRef" as="")
            q-form(@submit.prevent="handleSubmit($event, onCommentSubmit)")
              Field(name="comment" v-slot="{ field, errorMessage }")
                q-input(
                  type="textarea"
                  outlined square color="tech"
                  :model-value="field.value"
                  @update:model-value="field.onChange($event)"
                  @blur="field.onBlur($event)"
                  :error-message="errorMessage"
                  :error="!!errorMessage"
                )
              Field(name="rating" v-slot="{ field, errorMessage }")
                .text-center
                  q-rating(
                    :max="5"
                    :model-value="field.value"
                    @update:model-value="field.onChange($event)"
                    icon="star" size="2em"
                  )
                .text-center.text-negative(v-if="!!errorMessage") {{ errorMessage }}
              .q-mt-md.text-center
                q-btn(:label="$t('commentList.commentForm.submit')" color="tech" text-color="black" type="submit" :loading="isSubmitting" style="width: 150px")
  //- Comments
  .col-12
    q-list
      q-item-label.text-h6.text-tech(header) {{ $t('commentList.comments.title') }}
      q-separator.q-mb-md(inset)
      //- Loop all comments
      template(v-for="(comment, cidx) in comments" :key="comment._id")
        //- Loop all replies
        template(v-for="(reply, ridx) in comment.replies" :key="reply._id")
          q-item(:inset-level="ridx === 0 ? 0 : 1")
            q-item-section.no-wrap
              .row.q-col-gutter-y-sm
                .col-12
                  .row.q-col-gutter-x-md.items-center
                    .col-auto
                      //- Avatar
                      q-avatar
                        q-img(:src="reply.user.avatar" error-src="/assets/Logo_black.png")
                    .col-auto
                      //- User name
                      router-link.no-underline(:to="getI18nRoute({ name: 'profile-comments', params: { id: reply.user._id }})") {{ reply.user.name }}
                      //- Rating
                      template(v-if="ridx === 0")
                        br
                        q-rating(v-model="comment.rating" readonly)
                .col-12
                  //- Comment
                  p.q-my-sm {{ reply.comment }}
                .col-12
                  //- Date
                  small.text-grey
                    | {{ date.toRelative(reply.updatedAt) }}
                    q-tooltip.bg-black(anchor="top middle" self="bottom middle")
                      | {{ date.toLocaleString(reply.updatedAt) }}
                  //- Votes
                  span.q-ml-sm.q-gutter-x-sm
                    q-btn(
                      flat round dense color="tech" size="sm"
                      :icon="reply.votes.voted != 1 ? 'keyboard_arrow_up' : 'arrow_drop_up'"
                      :disable="!user.isLogin"
                      @click="voteReply(comment._id, reply._id, reply.votes.voted, 1)"
                    )
                    span {{ reply.votes.sum }}
                    q-btn(
                      flat round dense color="tech" size="sm"
                      :icon="reply.votes.voted != -1 ? 'keyboard_arrow_down' : 'arrow_drop_down'"
                      :disable="!user.isLogin"
                      @click="voteReply(comment._id, reply._id, reply.votes.voted, -1)"
                    )
                  //- Other actions
                  template(v-if="user.isLogin")
                    span.q-ml-sm.q-gutter-x-sm
                      q-btn(
                        flat round dense color="tech" size="sm" icon="reply"
                        @click="openDialog(reply, cidx, ridx, DIALOG_MODE.REPLY)"
                      )
                      q-btn(
                        flat round dense color="tech" size="sm" icon="edit"
                        v-if="reply.user._id === user._id"
                        @click="openDialog(reply, cidx, ridx, ridx === 0 ? DIALOG_MODE.EDIT_MY_COMMENT : DIALOG_MODE.EDIT_MY_REPLY)"
                      )
                      q-btn(
                        flat round dense color="tech" size="sm" icon="delete"
                        v-if="reply.user._id === user._id"
                        @click="deleteMyReply(comment._id, reply._id, cidx, ridx)"
                      )
      p.text-center(v-if="comments.length === 0") {{ $t('commentList.comments.notFound') }}
  //- Edit dialog
  q-dialog(v-model="editDialog.open" persistent)
    q-card(rounded style="width: 700px; max-width: 80vw;")
      Form(
        :validation-schema="editDialog.mode === DIALOG_MODE.EDIT_MY_COMMENT ? rateSchema : replySchema"
        :initial-values="editDialog.mode === DIALOG_MODE.EDIT_MY_COMMENT ? rateInitialValues : replyInitialValues"
        ref="dialogFormRef" as=""
        v-slot="{ handleSubmit, isSubmitting }"
      )
        q-form(@submit.prevent="handleSubmit($event, onCommentSubmit)")
          q-card-section.text-center.text-h6
            | {{ $t('commentList.dialog.title.' + editDialog.mode) }}
          q-card-section
            Field(name="comment" v-slot="{ field, errorMessage }")
              q-input(
                type="textarea"
                outlined square color="tech"
                :model-value="field.value"
                @update:model-value="field.onChange($event)"
                @blur="field.onBlur($event)"
                :error-message="errorMessage"
                :error="!!errorMessage"
              )
            Field(
              name="rating" v-slot="{ field, errorMessage }"
              v-if="editDialog.mode === DIALOG_MODE.EDIT_MY_COMMENT"
            )
              .text-center
                q-rating(
                  :max="5"
                  :model-value="field.value"
                  @update:model-value="field.onChange($event)"
                  icon="star" size="2em"
                )
              .text-center.text-negative(v-if="!!errorMessage") {{ errorMessage }}
          q-separator
          q-card-actions(align="around")
            q-btn(flat :label="$t('commentList.dialog.cancel')" color="red" :loading="isSubmitting" v-close-popup )
            q-btn(flat :label="$t('commentList.dialog.submit.' + editDialog.mode)" color="green" :loading="isSubmitting" @click="handleSubmit($event, onDialogSubmit)")
</template>

<script setup>
import { ref, computed, onMounted, useTemplateRef, nextTick } from 'vue'
import { Form, Field } from 'vee-validate'
import * as yup from 'yup'
import { useI18n } from 'vue-i18n'
import { useReCaptcha } from 'vue-recaptcha-v3'
import * as date from 'src/utils/date'
import api from 'src/utils/api'
import { useUserStore } from 'src/stores/user'
import { getI18nRoute } from 'src/i18n'

const user = useUserStore()
const recaptcha = useReCaptcha()
const { t } = useI18n()

// Props
const props = defineProps({
  // type, pattern or skin
  type: {
    type: String,
    required: true,
    validator(value) {
      return ['pattern', 'skin'].includes(value)
    },
  },
  // id of the pattern or skin
  id: {
    type: String,
    required: true,
  },
})

// Other users' comments
const otherComments = ref([])
// Current user's comment
const myComment = ref({
  _id: '',
  rating: 0,
  replies: [],
})
// All comments for the pattern
const comments = computed(() => {
  if (myComment.value._id === '') {
    return otherComments.value
  }
  return [myComment.value, ...otherComments.value]
})

// Form refs
const commentFormRef = useTemplateRef('commentFormRef')
const dialogFormRef = useTemplateRef('dialogFormRef')
// Rate form validation schema
const rateSchema = yup.object({
  comment: yup.string().required(() => t('commentList.commentForm.comment.error.required')),
  rating: yup
    .number()
    .typeError(() => t('commentList.commentForm.rating.error.required'))
    .required(() => t('commentList.commentForm.rating.error.required'))
    .min(1, () => t('commentList.commentForm.rating.error.min'))
    .max(5, () => t('commentList.commentForm.rating.error.max')),
})
// Rate form initial values
const rateInitialValues = {
  comment: '',
  rating: 0,
}
// Reply form validation schema
const replySchema = yup.object({
  comment: yup.string().required(() => t('commentList.replyForm.comment.error.required')),
})
// Reply form initial values
const replyInitialValues = {
  comment: '',
}

const DIALOG_MODE = {
  // Edit my comment
  EDIT_MY_COMMENT: 'comment',
  // Reply to a comment
  REPLY: 'reply',
  // Edit a reply
  EDIT_MY_REPLY: 'edit',
}
const editDialog = ref({
  // Open or close dialog
  open: false,
  // Dialog mode
  mode: DIALOG_MODE.COMMENT,
  cid: '',
  rid: '',
  cidx: '',
  ridx: '',
})

const openDialog = async (reply, cidx, ridx, mode) => {
  // Set dialog values
  editDialog.value.mode = mode
  editDialog.value.open = true
  editDialog.value.cid = comments.value[cidx]._id
  editDialog.value.rid = reply._id
  editDialog.value.cidx = cidx
  editDialog.value.ridx = ridx

  // Wait for the dialog to open to get the form ref
  await nextTick()

  // Reset the form
  dialogFormRef.value.resetForm()

  // Set the form values
  if (mode === DIALOG_MODE.REPLY) {
    dialogFormRef.value.setFieldValue('comment', '')
  } else if (mode === DIALOG_MODE.EDIT_MY_COMMENT) {
    dialogFormRef.value.setFieldValue('comment', myComment.value.replies[0].comment)
    dialogFormRef.value.setFieldValue('rating', myComment.value.rating)
  } else if (mode === DIALOG_MODE.EDIT_MY_REPLY) {
    dialogFormRef.value.setFieldValue('comment', myComment.value.replies[ridx].comment)
  }
}

const onDialogSubmit = async (values) => {
  try {
    if (editDialog.value.mode === DIALOG_MODE.REPLY) {
      // Send reply request
      const token = await recaptcha.executeRecaptcha('reply')
      const { data } = await api.post(`/comments/${editDialog.value.cid}/replies`, {
        comment: values.comment,
        'g-recaptcha-response': token,
      })
      // Update the comment
      const comment = {
        _id: data.result._id,
        comment: values.comment,
        user: {
          _id: user._id,
          name: user.name,
          avatar: user.avatar,
        },
        updatedAt: data.result.updatedAt,
        createdAt: data.result.createdAt,
        votes: { voted: 0, sum: 0 },
      }
      if (editDialog.value.cid === myComment.value._id) {
        myComment.value.replies.push(comment)
      } else {
        const cidx = myComment.value._id === '' ? editDialog.value.cidx : editDialog.value.cidx - 1
        otherComments.value[cidx].replies.push(comment)
      }
    } else if (editDialog.value.mode === DIALOG_MODE.EDIT_MY_COMMENT) {
      // Send edit comment request
      const token = await recaptcha.executeRecaptcha('editMyComment')
      await api.patch(`/comments/${editDialog.value.cid}`, {
        comment: values.comment,
        rating: values.rating,
        'g-recaptcha-response': token,
      })
      // Update the comment
      myComment.value.replies[0].comment = values.comment
      myComment.value.rating = values.rating
    } else if (editDialog.value.mode === DIALOG_MODE.EDIT_MY_REPLY) {
      // Send edit reply request
      const token = await recaptcha.executeRecaptcha('editMyReply')
      await api.patch(`/comments/${editDialog.value.cid}/replies/${editDialog.value.rid}`, {
        comment: values.comment,
        'g-recaptcha-response': token,
      })
      // Update the reply
      const cidx = myComment.value._id === '' ? editDialog.value.cidx : editDialog.value.cidx - 1
      if (editDialog.value.cid === myComment.value._id) {
        myComment.value.replies[editDialog.value.ridx].comment = values.comment
      } else {
        otherComments[cidx].replies[editDialog.value.ridx].comment = values.comment
      }
    }
    editDialog.value.open = false
  } catch (error) {
    console.error(error)
  }
}

const onCommentSubmit = async (values) => {
  try {
    // Send comment request
    const token = await recaptcha.executeRecaptcha('comment')
    const { data } = await api.post(`/comments`, {
      comment: values.comment,
      rating: values.rating,
      [props.type]: props.id,
      'g-recaptcha-response': token,
    })
    // Set my comment
    myComment.value._id = data.result._id
    myComment.value.rating = data.result.rating
    myComment.value.replies = data.result.replies
  } catch (error) {
    console.error(error)
  }
}

/**
 * Vote a reply
 * @param commentId Comment id
 * @param replyId Reply id
 * @param voted Current vote value
 * @param value Vote value to set, 0 = No vote, 1 = Upvote, -1 = Downvote
 */
const voteReply = async (cid, rid, voted, value) => {
  try {
    // Send vote request
    const token = await recaptcha.executeRecaptcha('vote')
    const newValue = voted === value ? 0 : value
    await api.patch(`/comments/${cid}/replies/${rid}/votes`, {
      vote: newValue,
      'g-recaptcha-response': token,
    })

    // Update value
    if (cid === myComment.value._id) {
      const idx = myComment.value.replies.findIndex((reply) => reply._id === rid)
      myComment.value.replies[idx].votes.voted = newValue
      myComment.value.replies[idx].votes.sum += newValue - voted
    } else {
      const comment = otherComments.value.find((comment) => comment._id === cid)
      const idx = comment.replies.findIndex((reply) => reply._id === rid)
      comment.replies[idx].votes.voted = newValue
      comment.replies[idx].votes.sum += newValue - voted
    }
  } catch (error) {
    console.error(error)
  }
}

/**
 * Delete a comment
 * @param commentId Comment id
 * @param replyId Reply id
 */
const deleteMyReply = async (cid, rid, cidx, ridx) => {
  try {
    // Send delete request
    const token = await recaptcha.executeRecaptcha('deleteReply')
    await api.patch(`/comments/${cid}/replies/${rid}`, {
      deleted: true,
      'g-recaptcha-response': token,
    })
    // Update the comment
    if (cid === myComment.value._id) {
      if (ridx === 0) {
        myComment.value.replies = []
        myComment.value.rating = 0
        myComment.value._id = ''
      } else {
        myComment.value.replies.splice(ridx, 1)
      }
    } else {
      const realCidx = myComment.value._id === '' ? cidx : cidx - 1
      otherComments.value[realCidx].replies.splice(ridx, 1)
    }
  } catch (error) {
    console.error(error)
  }
}

onMounted(async () => {
  try {
    // Fetch other comments
    const { data } = await api.get(`/comments/${props.type}/${props.id}`)
    // Set other comments
    otherComments.value = data.result

    // Fetch my comment if user is logged in
    if (user.isLogin) {
      const { data } = await api.get(`/comments/${props.type}/${props.id}/my`)
      myComment.value._id = data.result._id
      myComment.value.rating = data.result.rating
      myComment.value.replies = data.result.replies
    }
  } catch (error) {
    console.error(error)
  }
})
</script>
