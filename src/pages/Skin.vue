<template lang="pug">
q-page#skin
  section.bg(:style="{backgroundImage: `url(${this.backgroundImage})`}")
  section.q-mx-auto.padding
    .container
      .row
        .col-6.q-mx-auto
          h4 {{ skin.name }}
        q-no-ssr.col-6.text-right
          h4
            q-btn.q-mr-xs(v-if="skin.submitter._id === user._id" flat icon="edit" color="tech" @click="$router.push('/skins/edit/' + skin._id)") {{ $t('pattern.edit') }}
            q-btn.q-mr-xs(flat icon="download" color="tech" type="a" :href="skin.link" target="__blank") {{ $t('pattern.download') }}
      q-separator
      .row.q-my-md
        .col-12.col-md-6
          .text-h6.q-mt-md.q-mb-lg {{ $t('skin.skinData') }}
          .q-gutter-sm
            div
              q-rating(v-model="skin.rating.rating" readonly icon="star" icon-half="star_half")
              | &nbsp; {{ skin.rating.rating.toFixed(2) }} / {{ $t('pattern.ratingCount', {count: skin.rating.count}) }}
            div
              q-icon(size="sm" name="upload")
              | &nbsp;{{ $t('pattern.submittedBy') }}&nbsp;
              router-link.no-underline(:to='`/users/${skin.submitter._id}/skins`') {{ skin.submitter.name }}
            div
              q-icon(size="sm" name="star")
              | &nbsp;{{ $t('submitSkinForm.skinType') }}: {{ skinType }}
        .col-12.col-md-6.pre-line.q-my-md.q-my-md-none
          .text-h6.q-mt-md.q-mb-lg {{ $t('skin.description') }}
          .q-gutter-sm
            p(v-html="skin.description" v-if="skin.description")
            p(v-else) {{ $t('pattern.noDescription') }}
      .row.q-my-md
        .col-12
          .text-h6.q-mt-md.q-mb-lg.text-md-center {{ $t('pattern.previews') }}
          .q-gutter-sm
            .row.w-100.justify-center
              .col-12.col-md-6.col-lg-4.q-pa-md.q-my-xs(v-for="(video, idx) in skin.previews" :key="idx")
                q-video(:ratio="16/9" :src="'https://www.youtube.com/embed/'+video.ytid")
              p.text-center(v-if='skin.previews.length === 0') {{ $t('pattern.noPreview') }}
      q-separator(v-if="user.isLogin && $store.state.tempSkin.myComment._id.length === 0")
      .row.q-my-md(v-if="user.isLogin && $store.state.tempSkin.myComment._id.length === 0")
        .col-12
          .text-h6.q-mt-md.q-mb-lg.text-center {{ $t('skin.rateThisSkin') }}
          q-form(@submit.prevent="submitComment").q-gutter-sm
            div
              q-input(v-model="comment.comment" type="textarea" outlined :placeholder="$t('pattern.commentPlaceholder')")
            .text-center
              q-rating(v-model="comment.rating" :max="5" icon="star" size="3em")
            .text-center
              q-btn(:label="$t('submitForm.submit')" color="tech" text-color="black" type="submit" :loading="comment.submitting" style="width: 150px")
      q-separator
      .row.q-my-md
        .col-12
          .text-h6.q-mt-md.q-mb-lg.text-center {{ $t('comment.comments') }}
          q-infinite-scroll.q-gutter-sm(@load="loadScroll" :offset="200" :disable="commentsScrollDisabled")
            q-tree(ref="tree" :nodes="formattedComments" node-key="_id" children-key="replies" default-expand-all :no-nodes-label="$t('comment.noComment')")
              template(#default-header="prop")
                .row.q-gutter-x-sm.items-center
                  .col-auto
                    q-avatar
                      img(:src="prop.node.user.avatar")
                  .col-auto.text-weight-bold {{ prop.node.user.name }}
                  .col-auto(v-if="prop.node.rating")
                    q-rating(v-model="prop.node.rating" readonly)
                  .col-auto.text-weight-bold {{ formatDate(prop.node.date) }}
                    q-tooltip(anchor="top middle" self="bottom middle" content-style="background: #000")
                      | {{ formatTime(prop.node.date) }}
              template(#default-body="prop")
                p.text-white.comment.text-strike.text-weight-light.text-grey-5(v-if="prop.node.deleted") {{ $t('comment.deleted') }}
                p.text-white.comment(v-else) {{ prop.node.comment }}
                p.text-white.comment-actions
                  q-btn(flat round color="tech" icon="thumb_up" v-if="isVoted(prop.node.votes, 1)" :disable="!user.isLogin" @click="vote(prop.node.cid, prop.node._id, 0)")
                  q-btn(flat round color="tech" icon="thumb_up_off_alt" v-else :disable="!user.isLogin" @click="vote(prop.node.cid, prop.node._id, 1)")
                  | &nbsp;{{ reduceVote(1, prop.node.votes) }}&nbsp;
                  q-btn(flat round color="tech" icon="thumb_down" v-if="isVoted(prop.node.votes, -1)" :disable="!user.isLogin" @click="vote(prop.node.cid, prop.node._id, 0)")
                  q-btn(flat round color="tech" icon="thumb_down_off_alt" v-else :disable="!user.isLogin" @click="vote(prop.node.cid, prop.node._id, -1)")
                  | &nbsp;{{ reduceVote(-1, prop.node.votes) }}&nbsp;
                  q-btn(flat round color="tech" v-if="prop.node.user._id === user._id && !prop.node.deleted" icon="edit" @click="editReply(prop.node)")
                  q-btn(flat round color="tech" v-if="prop.node.user._id === user._id && !prop.node.deleted" icon="delete" @click="deleteReply(prop.node, prop.node.replies ? 0 : 1)")
                  q-btn(flat round color="tech" v-if="prop.node.user._id === user._id && prop.node.deleted" icon="undo" @click="recoverReply(prop.node)")
                    //- Only header has replies array
                  q-btn(flat round color="tech" v-if="prop.node.replies && user.isLogin && (prop.node.user._id === user._id || pattern.submitter._id === user._id)" icon="reply" @click="reply(prop.node)")
  q-dialog(v-model="replyModal.open" @hide="resetReplyModal")
    q-card(style="width: 700px; max-width: 80vw;")
      q-form(@submit.prevent="submitModal")
        q-card-section
          .text-h6(v-if="replyModal.mode === 0") {{ $t('comment.editComment') }}
          .text-h6(v-else-if="replyModal.mode === 1") {{ $t('comment.editReply') }}
          .text-h6(v-else-if="replyModal.mode === 2") {{ $t('comment.reply') }}
        q-card-section
          .q-gutter-sm
            div
              q-input(v-model="replyModal.comment" type="textarea" outlined :placeholder="$t('pattern.commentPlaceholder')")
            .text-center(v-if="replyModal.mode === 0")
              q-rating(v-model="replyModal.rating" :max="5" icon="star" size="3em")
            .text-center
              q-btn(:label="$t('submitForm.submit')" color="tech" text-color="black" type="submit" :loading="replyModal.submitting" style="width: 150px")
  q-dialog(v-model="deleteReplyDialog.confirm")
    q-card
      q-card-section.row.items-center
        q-avatar.q-mx-auto(icon="warning" text-color="red")
        span.q-ml-sm {{ deleteReplyDialog.mode === 0 ? $t('comment.deleteCommentConfirm') : $t('comment.deleteReplyConfirm') }}
      q-card-actions(align="right")
        q-btn(color="green" flat :label="$t('submitForm.deleteYes')" @click="confirmDeleteReply" :loading="deleteReplyDialog.deleting")
        q-btn(color="red" flat :label="$t('submitForm.deleteNo')" v-close-popup)
</template>

<script>
import parseISO from 'date-fns/fp/parseISO'

export default {
  name: 'PageSkin',
  meta () {
    return {
      title: `TECHMANIA | ${this.skin.name}`,
      meta: {
        color: {
          name: 'theme-color',
          content: '#E74C3C'
        },
        title: {
          name: 'title',
          content: `${this.skin.name}`,
          'data-dynamic': true
        },
        description: {
          name: 'description',
          content: `Submitted by ${this.skin.submitter.name}.`,
          'data-dynamic': true
        },
        ogType: {
          property: 'og:type',
          content: 'website',
          'data-dynamic': true
        },
        ogUrl: {
          property: 'og:url',
          content: new URL(this.$route.fullPath, process.env.HOST_URL).toString(),
          'data-dynamic': true
        },
        ogTitle: {
          property: 'og:title',
          content: `TECHMANIA | ${this.skin.name}`,
          'data-dynamic': true
        },
        ogDescription: {
          property: 'og:description',
          content: `Composed by ${this.skin.composer}. Submitted by ${this.skin.submitter.name}.`,
          'data-dynamic': true
        },
        ogImage: {
          property: 'og:image',
          content: this.backgroundImage,
          'data-dynamic': true
        },
        twCard: {
          name: 'twitter:card',
          content: 'summary_large_image',
          'data-dynamic': true
        },
        twUrl: {
          name: 'twitter:url',
          content: new URL(this.$route.fullPath, process.env.HOST_URL).toString(),
          'data-dynamic': true
        },
        twTitle: {
          name: 'twitter:title',
          content: `TECHMANIA | ${this.skin.name}`,
          'data-dynamic': true
        },
        twDescription: {
          name: 'twitter:description',
          content: `Composed by ${this.skin.composer}. Submitted by ${this.skin.submitter.name}.`,
          'data-dynamic': true
        },
        twImage: {
          name: 'twitter:image',
          content: this.backgroundImage,
          'data-dynamic': true
        }
      }
    }
  },
  preFetch ({ store, currentRoute, previousRoute, redirect, ssrContext, urlPath, publicPath }) {
    store.commit('tempSkin/resetSkin')
    return store.dispatch('tempSkin/fetchSkin', currentRoute.params.id)
  },
  data () {
    return {
      comment: {
        rating: 0,
        comment: '',
        submitting: false
      },
      replyModal: {
        // 0 = edit comment
        // 1 = edit reply
        // 2 = reply
        mode: 0,
        comment: '',
        rating: 0,
        submitting: false,
        open: false,
        cid: '',
        _id: ''
      },
      deleteReplyDialog: {
        mode: 0,
        confirm: false,
        deleting: false,
        _id: '',
        cid: '',
        root: false
      }
    }
  },
  computed: {
    backgroundImage () {
      return this.skin.image?.length > 0 ? this.skin.image : this.skin.previews.length > 0 ? this.getYouTubeThumbnail(this.skin.previews[0].ytid) : 'https://raw.githubusercontent.com/techmania-team/techmania-team.github.io/master/public/assets/Logo_black.png'
    },
    skin () {
      return this.$store.getters['tempSkin/getSkin']
    },
    formattedComments () {
      return this.$store.getters['tempSkin/getFormattedComments']
    },
    commentsScrollDisabled () {
      return this.$store.state.tempSkin.commentsScrollDisabled
    },
    skinType () {
      let result = ''
      switch (this.skin.type) {
        case 0:
          result = this.$t('skin.note')
          break
        case 1:
          result = this.$t('skin.vfx')
          break
        case 2:
          result = this.$t('skin.combo')
          break
        case 3:
          result = this.$t('skin.gameUI')
          break
      }
      return result
    }
  },
  methods: {
    async loadScroll (index, done) {
      await this.$store.dispatch('tempSkin/fetchComments', { id: this.$route.params.id, start: (index - 1) * 10 })
      done()
      this.$refs.tree.expandAll()
    },
    formatDate (date) {
      return this.$date.formatDistanceToNow(parseISO(date), { locale: this.$date.locales[this.user.locale2], addSuffix: true })
    },
    formatTime (date) {
      return new Date(date).toLocaleString(this.user.locale)
    },
    reduceVote (value, votes) {
      return (!votes || votes.length === 0) ? 0 : votes.filter(vote => vote.positive === value).length
    },
    isVoted (votes, positive) {
      return votes ? votes.some(vote => vote.user === this.user._id && vote.positive === positive) : 0
    },
    vote (cid, rid, positive) {
      this.$store.dispatch('tempSkin/vote', { cid, rid, positive })
    },
    async submitComment () {
      if (this.comment.comment.length === 0 || this.comment.rating === 0) {
        this.$q.notify({
          icon: 'warning',
          color: 'negative',
          message: this.$t('submitForm.required')
        })
        return
      }
      try {
        this.comment.submitting = true
        await this.$recaptchaLoaded()
        const token = await this.$recaptcha('skinComment')
        await this.$store.dispatch('tempSkin/submitComment', { rating: this.comment.rating, comment: this.comment.comment, token })
        this.comment.rating = 0
        this.comment.comment = ''
      } catch (error) {
        this.$q.notify({
          icon: 'warning',
          color: 'negative',
          message: this.$t('submitForm.errorServer')
        })
      }
      this.comment.submitting = false
    },
    reply (node) {
      this.replyModal.mode = 2
      this.replyModal.comment = ''
      this.replyModal._id = ''
      this.replyModal.open = true
      this.replyModal.submitting = false
      this.replyModal.open = true
      this.replyModal.cid = node.cid
    },
    editReply (node) {
      if (node.replies) {
        this.replyModal.rating = node.rating
        this.replyModal.mode = 0
      } else this.replyModal.mode = 1
      this.replyModal.comment = node.comment
      this.replyModal._id = node._id
      this.replyModal.open = true
      this.replyModal.submitting = false
      this.replyModal.open = true
      this.replyModal.cid = node.cid
    },
    deleteReply (node, mode) {
      this.deleteReplyDialog.mode = mode
      this.deleteReplyDialog.root = 'replies' in node
      this.deleteReplyDialog._id = node._id
      this.deleteReplyDialog.cid = node.cid
      this.deleteReplyDialog.confirm = true
      this.deleteReplyDialog.deleting = false
    },
    async recoverReply (node) {
      try {
        await this.$recaptchaLoaded()
        const token = await this.$recaptcha('skinRecoverComment')
        await this.$api.patch(
      `/comments/${node.cid}/replies/${node._id}`,
      { deleted: false, 'g-recaptcha-response': token },
      {
        headers: { Authorization: `Bearer ${this.user.jwt}` }
      }
        )
        this.$store.commit('tempSkin/editReply', { cid: node.cid, rid: node._id, deleted: false })
      } catch (error) {
        this.$q.notify({
          icon: 'warning',
          color: 'negative',
          message: 'Server Error, please try again.'
        })
      }
    },
    async confirmDeleteReply () {
      if (this.deleteReplyDialog._id === '' || this.deleteReplyDialog.cid === '') return
      this.deleteReplyDialog.deleting = true
      try {
        await this.$recaptchaLoaded()
        let token = ''
        if (this.deleteReplyDialog.root) {
          token = await this.$recaptcha('skinDeleteMyComment')
          await this.$store.dispatch('tempSkin/deleteMyComment', { ...this.deleteReplyDialog, token })
        } else {
          token = await this.$recaptcha('skinDeleteReply')
          this.$store.dispatch('tempSkin/deleteReply', { ...this.deleteReplyDialog, token })
        }
      } catch (error) {
        this.$q.notify({
          icon: 'warning',
          color: 'negative',
          message: 'Server Error, please try again.'
        })
      }
      this.deleteReplyDialog.deleting = false
      this.deleteReplyDialog.confirm = false
    },
    resetReplyModal () {
      this.replyModal = {
        mode: 0,
        comment: '',
        rating: 0,
        submitting: false,
        open: false,
        cid: '',
        _id: ''
      }
    },
    async submitModal () {
      try {
        this.replyModal.submitting = true
        // 0 = edit comment
        // 1 = edit reply
        // 2 = reply
        if (this.replyModal.mode === 0) {
          if (this.replyModal.rating === 0 || this.replyModal.comment.length === 0) {
            throw new Error('Validate Fail')
          }
          await this.$recaptchaLoaded()
          const token = await this.$recaptcha('skinEditComment')
          await this.$store.dispatch('tempSkin/editComment', { token, ...this.replyModal })
        } else if (this.replyModal.mode === 1) {
          if (this.replyModal.comment.length === 0) {
            throw new Error('Validate Fail')
          }
          await this.$recaptchaLoaded()
          const token = await this.$recaptcha('skinEditReply')
          await this.$store.dispatch('tempSkin/editReply', { token, ...this.replyModal })
        } else {
          if (this.replyModal.comment.length === 0) {
            throw new Error('Validate Fail')
          }
          await this.$recaptchaLoaded()
          const token = await this.$recaptcha('skinReply')
          this.$store.dispatch('tempSkin/reply', { token, ...this.replyModal })
        }
        this.replyModal.open = false
      } catch (error) {
        if (error.message === 'Validate Fail') {
          this.$q.notify({
            icon: 'warning',
            color: 'negative',
            message: this.$t('submitForm.required')
          })
        }
      }
      this.replyModal.submitting = false
    }
  },
  async created () {
    await this.$store.dispatch('tempSkin/fetchMyComment', this.$route.params.id)
    if (this.skin._id.length === 0) {
      this.$router.push('/404')
    } else {
      if (process.env.CLIENT) {
        document.title = `TECHMANIA | ${this.skin.name}`
      }
    }
  }
}
</script>
