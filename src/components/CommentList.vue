<template lang="pug">
q-no-ssr.row.q-gutter-y-lg
  //- Rate form
  .col-12(v-if="myComment._id === '' && user.isLogin && loaded")
    q-list
      q-item-label.text-h6.text-tech(header) {{ $t('commentList.commentForm.title.' + type) }}
      q-separator.q-mb-md(inset)
      q-item
        q-item-section
            q-form(@submit.prevent="onCommentSubmit")
              q-input(
                type="textarea"
                outlined square color="tech"
                v-model="commentField"
                :error-message="form.errors.value.comment"
                :error="!!form.errors.value.comment"
              )
              .text-center
                q-rating(
                  :max="5"
                  v-model="ratingField"
                  icon="star" size="2em"
                )
              .text-center.text-negative(v-if="!!form.errors.value.rating") {{ form.errors.value.rating }}
              .q-mt-md.text-center
                q-btn(:label="$t('commentList.commentForm.submit')" color="tech" text-color="black" type="submit" :loading="form.isSubmitting.value" style="width: 150px")
  //- Comments
  .col-12
    q-list
      q-item-label.text-h6.text-tech(header) {{ $t('commentList.comments.title') }}
      q-separator.q-mb-md(inset)
      template(v-if="!loaded")
        .text-center
          q-spinner(color="white" size="3em")
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
                      DiscordAvatar(:avatar="reply.user.avatar")
                    .col-auto
                      //- User name
                      router-link.no-underline(:to="getI18nRoute({ name: 'profile', params: { tab: 'comments', id: reply.user._id }})") {{ reply.user.name }}
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
                      @click="voteReply(comment._id, reply._id, cidx, ridx, reply.votes.voted, 1)"
                    )
                    span {{ reply.votes.sum }}
                    q-btn(
                      flat round dense color="tech" size="sm"
                      :icon="reply.votes.voted != -1 ? 'keyboard_arrow_down' : 'arrow_drop_down'"
                      :disable="!user.isLogin"
                      @click="voteReply(comment._id, reply._id, cidx, ridx, reply.votes.voted, -1)"
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
      p.text-center(v-if="comments.length === 0 && loaded") {{ $t('commentList.comments.notFound') }}
  //- Edit dialog
  q-dialog(v-model="editDialog.open" persistent)
    q-card(rounded style="width: 700px; max-width: 80vw;")
        q-form(@submit.prevent="onDialogSubmit")
          q-card-section.text-center.text-h6
            | {{ $t('commentList.dialog.title.' + editDialog.mode) }}
          q-card-section
            q-input(
              type="textarea"
              outlined square color="tech"
              v-model="commentField"
              :error-message="form.errors.value.comment"
              :error="!!form.errors.value.comment"
            )
            template(v-if="editDialog.mode == DIALOG_MODE.EDIT_MY_COMMENT")
              .text-center
                q-rating(
                  :max="5"
                  v-model="ratingField"
                  icon="star" size="2em"
                )
              .text-center.text-negative(v-if="!!form.errors.value.rating") {{ form.errors.value.rating }}
          q-separator
          q-card-actions(align="around")
            q-btn(flat :label="$t('commentList.dialog.cancel')" color="red" :loading="form.isSubmitting.value" v-close-popup )
            q-btn(flat :label="$t('commentList.dialog.submit.' + editDialog.mode)" color="green" :loading="form.isSubmitting.value" @click="onDialogSubmit")
</template>

<script setup lang="ts">
import type { IComment, ICommentReply } from '@/types/comment'
import { AxiosError } from 'axios'
import { useForm } from 'vee-validate'
import { computed, nextTick, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useReCaptcha } from 'vue-recaptcha-v3'
import * as yup from 'yup'
import DiscordAvatar from '@/components/DiscordAvatar.vue'
import { getI18nRoute } from '@/i18n'
import { useUserStore } from '@/stores/user'
import api from '@/utils/api'
import * as date from '@/utils/date'
import { handleError } from '@/utils/handleError'

const user = useUserStore()
const recaptcha = useReCaptcha()
const { t } = useI18n()

const loaded = ref(false)

// Props
const props = defineProps({
  // type, pattern or skin
  type: {
    type: String,
    required: true,
    validator(value: string) {
      return ['pattern', 'skin', 'setlist'].includes(value)
    },
  },
  // id of the pattern or skin
  id: {
    type: String,
    required: true,
  },
})

// Other users' comments
const otherComments = ref<IComment[]>([])
// Current user's comment
const myComment = ref<IComment>({
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

// Form
const schema = yup.object({
  comment: yup.string().required(() => t('commentList.commentForm.comment.error.required')),
  rating: yup
    .number()
    .nullable()
    .when([], {
      // rating is not required in reply mode
      is: () => editDialog.value.mode === DIALOG_MODE.REPLY,
      then: (schema) => schema.optional().nullable(),
      otherwise: (schema) =>
        schema
          .typeError(() => t('commentList.commentForm.rating.error.required'))
          .required(() => t('commentList.commentForm.rating.error.required'))
          .min(1, () => t('commentList.commentForm.rating.error.min'))
          .max(5, () => t('commentList.commentForm.rating.error.max')),
    }),
})

const form = useForm({
  validationSchema: schema,
  initialValues: {
    comment: '',
    rating: 0,
  },
})
const [commentField] = form.defineField('comment')
const [ratingField] = form.defineField('rating')

enum DIALOG_MODE {
  // Edit my comment
  EDIT_MY_COMMENT = 'comment',
  // Reply to a comment
  REPLY = 'reply',
  // Edit a reply
  EDIT_MY_REPLY = 'edit',
}

const editDialog = ref({
  // Open or close dialog
  open: false,
  // Dialog mode
  mode: DIALOG_MODE.EDIT_MY_COMMENT,
  cid: '',
  rid: '',
  cidx: -1,
  ridx: -1,
})

const openDialog = async (reply: ICommentReply, cidx: number, ridx: number, mode: DIALOG_MODE) => {
  // Set dialog values
  editDialog.value.mode = mode
  editDialog.value.open = true
  editDialog.value.cid = comments.value[cidx]!._id
  editDialog.value.rid = reply._id
  editDialog.value.cidx = cidx
  editDialog.value.ridx = ridx

  // Wait for the dialog to open to get the form ref
  await nextTick()

  // Reset the form
  form.resetForm()

  // Set the form values
  // Note:
  // rating is not needed in reply,
  // but i'm too lazy to split forms, make rating field optional, or solve typescript errors.
  // that's why i set 5 here as a simple workaround
  form.setFieldValue('rating', 5)

  if (mode === DIALOG_MODE.REPLY) {
    form.setFieldValue('comment', '')
  } else if (mode === DIALOG_MODE.EDIT_MY_COMMENT) {
    form.setFieldValue('comment', myComment.value.replies[0]!.comment)
    form.setFieldValue('rating', myComment.value.rating)
  } else if (mode === DIALOG_MODE.EDIT_MY_REPLY) {
    form.setFieldValue('comment', myComment.value.replies[ridx]!.comment)
  }
}

const onDialogSubmit = form.handleSubmit(async (values) => {
  try {
    if (editDialog.value.mode === DIALOG_MODE.REPLY) {
      // Send reply request
      const token = await recaptcha?.executeRecaptcha('reply')
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
        otherComments.value[cidx]!.replies.push(comment)
      }
    } else if (editDialog.value.mode === DIALOG_MODE.EDIT_MY_COMMENT) {
      // Send edit comment request
      const token = await recaptcha?.executeRecaptcha('editMyComment')
      await api.patch(`/comments/${editDialog.value.cid}`, {
        comment: values.comment,
        rating: values.rating,
        'g-recaptcha-response': token,
      })
      // Update the comment
      myComment.value.replies[0]!.comment = values.comment
      myComment.value.rating = values.rating
    } else if (editDialog.value.mode === DIALOG_MODE.EDIT_MY_REPLY) {
      // Send edit reply request
      const token = await recaptcha?.executeRecaptcha('editMyReply')
      await api.patch(`/comments/${editDialog.value.cid}/replies/${editDialog.value.rid}`, {
        comment: values.comment,
        'g-recaptcha-response': token,
      })
      // Update the reply
      const cidx = myComment.value._id === '' ? editDialog.value.cidx : editDialog.value.cidx - 1
      if (editDialog.value.cid === myComment.value._id) {
        myComment.value.replies[editDialog.value.ridx]!.comment = values.comment
      } else {
        otherComments.value[cidx]!.replies[editDialog.value.ridx]!.comment = values.comment
      }
    }
    editDialog.value.open = false
  } catch (error) {
    handleError(error)
  }
})

const onCommentSubmit = form.handleSubmit(async (values) => {
  try {
    // Send comment request
    const token = await recaptcha?.executeRecaptcha('comment')
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
    handleError(error)
  }
})

/**
 * Vote a reply
 * @param cid Comment id
 * @param rid Reply id
 * @param cidx Comment index
 * @param ridx Reply index
 * @param voted Current vote value
 * @param value Vote value to set, 0 = No vote, 1 = Upvote, -1 = Downvote
 */
const voteReply = async (
  cid: string,
  rid: string,
  cidx: number,
  ridx: number,
  voted: number,
  value: number,
) => {
  try {
    // Send vote request
    const token = await recaptcha?.executeRecaptcha('vote')
    const newValue = voted === value ? 0 : value
    await api.patch(`/comments/${cid}/replies/${rid}/votes`, {
      vote: newValue,
      'g-recaptcha-response': token,
    })

    // Update value
    if (cid === myComment.value._id) {
      myComment.value.replies[ridx]!.votes.voted = newValue
      myComment.value.replies[ridx]!.votes.sum += newValue - voted
    } else {
      otherComments.value[cidx]!.replies[ridx]!.votes.voted = newValue
      otherComments.value[cidx]!.replies[ridx]!.votes.sum += newValue - voted
    }
  } catch (error) {
    handleError(error)
  }
}

/**
 * Delete a comment
 * @param commentId Comment id
 * @param replyId Reply id
 */
const deleteMyReply = async (cid: string, rid: string, cidx: number, ridx: number) => {
  try {
    // Send delete request
    const token = await recaptcha?.executeRecaptcha('deleteReply')
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
      otherComments.value[realCidx]?.replies?.splice(ridx, 1)
    }
  } catch (error) {
    handleError(error)
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
    // Don't need to show error if the comment is not found
    // Maybe this pattern, skin or setlist doesn't have any comments
    if (error instanceof AxiosError && error?.response?.status !== 404) {
      handleError(error)
    }
  }

  loaded.value = true
})
</script>
