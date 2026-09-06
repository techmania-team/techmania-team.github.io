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
              .q-mt-md.row.justify-center
                cf-turnstile(
                  v-model="turnstileTokenMain"
                  action="comment-create"
                )
              .q-mt-md.text-center
                q-btn(:label="$t('commentList.commentForm.submit')" color="tech" text-color="black" type="submit" :loading="form.isSubmitting.value" style="width: 150px" :disable="!turnstileTokenMain")
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
                      @click="voteReply({ cid: comment._id, rid: reply._id, voted: reply.votes.voted, value: 1 })"
                    )
                    span {{ reply.votes.sum }}
                    q-btn(
                      flat round dense color="tech" size="sm"
                      :icon="reply.votes.voted != -1 ? 'keyboard_arrow_down' : 'arrow_drop_down'"
                      :disable="!user.isLogin"
                      @click="voteReply({ cid: comment._id, rid: reply._id, voted: reply.votes.voted, value: -1 })"
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
                        @click="deleteMyReply({ cid: comment._id, rid: reply._id })"
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
          .row.justify-center.q-my-md
            cf-turnstile(
              v-model="turnstileTokenDialog"
              :action="dialogTurnstileAction"
              :key="editDialog.mode"
            )
          q-separator
          q-card-actions(align="around")
            q-btn(flat :label="$t('commentList.dialog.cancel')" color="red" :loading="form.isSubmitting.value" v-close-popup )
            q-btn(flat :label="$t('commentList.dialog.submit.' + editDialog.mode)" color="green" :loading="form.isSubmitting.value" @click="onDialogSubmit" :disable="!turnstileTokenDialog")
</template>

<script setup lang="ts">
import type { CommentQueryParams, CommentTarget } from '@/queries/comment'
import type { ICommentReply } from '@/types/comment'
import { useMutation, useQuery, useQueryCache } from '@pinia/colada'
import { useQuasar } from 'quasar'
import { useForm } from 'vee-validate'
import { computed, nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import * as yup from 'yup'
import DiscordAvatar from '@/components/DiscordAvatar.vue'
import { getI18nRoute } from '@/i18n'
import { commentsQuery, EMPTY_COMMENT, myCommentQuery } from '@/queries/comment'
import * as commentService from '@/services/comment'
import { useUserStore } from '@/stores/user'
import * as date from '@/utils/date'
import { handleError } from '@/utils/handleError'
import CfTurnstile from './CfTurnstile.vue'

const $q = useQuasar()
const user = useUserStore()
const { t } = useI18n()

const turnstileTokenMain = ref('')
const turnstileTokenDialog = ref('')

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

const queryCache = useQueryCache()

const commentParams = (): CommentQueryParams => ({
  target: props.type as CommentTarget,
  id: props.id,
})

/**
 * Both comment queries are client only.
 *
 * Server-side calls travel over loopback without the session cookie, so the
 * API answers them as anonymous. That changes what comes back: it stops
 * leaving out the reader's own comment, which this component then adds back
 * from the query below and renders twice, and it reports every vote as not
 * cast. The endpoint for the reader's own comment cannot answer at all
 * without a session, and used to 401. Fetching after hydration, with the
 * cookie, is what this component did before.
 */
const { data: otherCommentsData, isPending } = useQuery(() => ({
  ...commentsQuery(commentParams()),
  enabled: import.meta.env.QUASAR_CLIENT,
}))

const { data: myCommentData } = useQuery(() => ({
  ...myCommentQuery(commentParams()),
  enabled: user.isLogin && import.meta.env.QUASAR_CLIENT,
}))

const otherComments = computed(() => otherCommentsData.value ?? [])
const myComment = computed(() => myCommentData.value ?? EMPTY_COMMENT)
const loaded = computed(() => !isPending.value)

/**
 * Writing a comment changes more than this list: the profile's comment tab,
 * and the target's own rating, which the API derives from its comments.
 */
const invalidateComments = () =>
  Promise.all([
    queryCache.invalidateQueries({ key: ['comments'] }),
    queryCache.invalidateQueries({ key: [`${props.type}s`] }),
  ])

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

const dialogTurnstileAction = computed(() => {
  switch (editDialog.value.mode) {
    case DIALOG_MODE.REPLY:
      return 'comment-createReply'
    case DIALOG_MODE.EDIT_MY_COMMENT:
      return 'comment-updateMyComment'
    case DIALOG_MODE.EDIT_MY_REPLY:
      return 'comment-updateMyReply'
    default:
      return ''
  }
})

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

const { mutate: submitDialog } = useMutation({
  mutation: async (values: { comment: string; rating: number }) => {
    const token = turnstileTokenDialog.value
    const { cid, rid, mode } = editDialog.value

    if (mode === DIALOG_MODE.REPLY) {
      await commentService.createReply(cid, {
        comment: values.comment,
        'cf-turnstile-response': token,
      })
    } else if (mode === DIALOG_MODE.EDIT_MY_COMMENT) {
      await commentService.updateMyComment(cid, {
        comment: values.comment,
        rating: values.rating,
        'cf-turnstile-response': token,
      })
    } else if (mode === DIALOG_MODE.EDIT_MY_REPLY) {
      await commentService.updateMyReply(cid, rid, {
        comment: values.comment,
        'cf-turnstile-response': token,
      })
    }
  },
  onSuccess: async () => {
    // Refetching replaces the index juggling the local copies used to need
    await invalidateComments()
    editDialog.value.open = false
  },
  onError: (error: unknown) => {
    handleError(error)
    turnstileTokenDialog.value = ''
  },
})

const onDialogSubmit = form.handleSubmit((values) => {
  if (!turnstileTokenDialog.value) {
    $q.notify({
      icon: 'warning',
      message: t('commentList.turnstile.error.required'),
      color: 'warning',
      position: 'top',
      timeout: 2000,
    })
    return
  }

  submitDialog({ comment: values.comment, rating: values.rating })
})

const { mutate: submitComment } = useMutation({
  mutation: (values: { comment: string; rating: number }) =>
    commentService.create({
      comment: values.comment,
      rating: values.rating,
      [props.type]: props.id,
      'cf-turnstile-response': turnstileTokenMain.value,
    }),
  onSuccess: () => invalidateComments(),
  onError: (error: unknown) => {
    handleError(error)
    turnstileTokenMain.value = ''
  },
})

const onCommentSubmit = form.handleSubmit((values) => {
  if (!turnstileTokenMain.value) {
    $q.notify({
      icon: 'warning',
      message: t('commentList.turnstile.error.required'),
      color: 'warning',
      position: 'top',
      timeout: 2000,
    })
    return
  }

  submitComment({ comment: values.comment, rating: values.rating })
})

/**
 * Vote a reply
 * @param cid Comment id
 * @param rid Reply id
 * @param voted Current vote value
 * @param value Vote value to set, 0 = No vote, 1 = Upvote, -1 = Downvote
 */
const { mutate: voteReply } = useMutation({
  mutation: ({
    cid,
    rid,
    voted,
    value,
  }: {
    cid: string
    rid: string
    voted: number
    value: number
  }) =>
    // Clicking the vote you already cast clears it
    commentService.updateReplyVote(cid, rid, { vote: voted === value ? 0 : value }),
  onSuccess: () => invalidateComments(),
  onError: (error: unknown) => handleError(error),
})

/**
 * Delete a reply, or the whole comment when it is the first one
 * @param cid Comment id
 * @param rid Reply id
 */
const { mutate: deleteMyReply } = useMutation({
  mutation: ({ cid, rid }: { cid: string; rid: string }) => commentService.deleteMyReply(cid, rid),
  onSuccess: () => invalidateComments(),
  onError: (error: unknown) => handleError(error),
})
</script>
