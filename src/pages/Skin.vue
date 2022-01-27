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
            q-btn.q-mr-xs(v-if="skin.submitter._id === user.id" flat icon="edit" color="tech" @click="$router.push('/skins/edit/' + skin._id)") {{ $t('pattern.edit') }}
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
              router-link.no-underline(:to='`/users/${skin.submitter._id}/#skins`') {{ skin.submitter.name }}
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
              p.text-center(v-if='skin.previews.length === 0') {{ $t('pattern.noPreviews') }}
      q-no-ssr
        q-separator(v-if="isLogin && $store.state.tempSkin.myComment._id.length === 0")
        .row.q-my-md(v-if="isLogin && $store.state.tempSkin.myComment._id.length === 0")
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
            .text-h6.q-mt-md.q-mb-lg.text-center Comments
            q-infinite-scroll.q-gutter-sm(@load="loadScroll" :offset="200" :disable="commentsScrollDisabled")
              q-tree(:nodes="formattedComments" node-key="_id" children-key="replies" default-expand-all :no-nodes-label="$t('pattern.noComments')")
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
                  p.text-white.comment {{ prop.node.comment }}
                  p.text-white.comment-actions
                    q-btn(flat round color="tech" icon="thumb_up" v-if="isVoted(prop.node.votes, 1)" :disable="!isLogin" @click="vote(prop.node.cid, prop.node._id, 0)")
                    q-btn(flat round color="tech" icon="thumb_up_off_alt" v-else :disable="!isLogin" @click="vote(prop.node.cid, prop.node._id, 1)")
                    | &nbsp;{{ reduceVote(1, prop.node.votes) }}&nbsp;
                    q-btn(flat round color="tech" icon="thumb_down" v-if="isVoted(prop.node.votes, -1)" :disable="!isLogin" @click="vote(prop.node.cid, prop.node._id, 0)")
                    q-btn(flat round color="tech" icon="thumb_down_off_alt" v-else :disable="!isLogin" @click="vote(prop.node.cid, prop.node._id, -1)")
                    | &nbsp;{{ reduceVote(-1, prop.node.votes) }}&nbsp;
                    q-btn(flat round color="tech" v-if="prop.node.user._id === user.id" icon="edit" :disable="!isLogin" @click="editReply(prop.node)")
                    q-btn(flat round color="tech" v-if="prop.node.replies && isLogin" icon="reply" :disable="!isLogin" @click="reply(prop.node)")
  q-dialog(v-model="replyModal.open" @hide="resetReplyModal")
    q-card(style="width: 700px; max-width: 80vw;")
      q-form(@submit.prevent="submitModal")
        q-card-section
          .text-h6(v-if="replyModal.mode === 0") Edit Comment
          .text-h6(v-else-if="replyModal.mode === 1") Edit Reply
          .text-h6(v-else-if="replyModal.mode === 2") Reply
        q-card-section
          .q-gutter-sm
            div
              q-input(v-model="replyModal.comment" type="textarea" outlined :placeholder="$t('pattern.commentPlaceholder')")
            .text-center(v-if="replyModal.mode === 0")
              q-rating(v-model="replyModal.rating" :max="5" icon="star" size="3em")
            .text-center
              q-btn(:label="$t('submitForm.submit')" color="tech" text-color="black" type="submit" :loading="replyModal.submitting" style="width: 150px")
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
      return votes ? votes.some(vote => vote.user === this.user.id && vote.positive === positive) : 0
    },
    async vote (cid, rid, positive) {
      try {
        await this.$api.patch(`/comments/${cid}/replies/${rid}/votes`, { positive }, { headers: { Authorization: `Bearer ${this.user.jwt}` } })
        this.$store.commit('tempSkin/setVote', { cid, rid, positive })
      } catch (error) {
        console.log(error)
      }
    },
    async submitComment () {
      if (this.comment.comment.length === 0 || this.comment.rating === 0) {
        this.$q.notify({
          icon: 'warning',
          color: 'negative',
          message: 'Please fill out the form.'
        })
        return
      }
      try {
        this.comment.submitting = true
        let response = await this.$api.post(
          '/comments/',
          { rating: this.comment.rating, comment: this.comment.comment, skin: this.skin._id },
          { headers: { Authorization: `Bearer ${this.user.jwt}` } }
        )
        this.$store.commit(
          'tempSkin/setMyComment', { ...response.data.result }
        )
        response = await this.$api.get(`/comments/skins/${this.skin._id}/rating`)
        this.$store.commit(
          'tempSkin/updateRating', { ...response.data.result }
        )
      } catch (error) {
        this.$q.notify({
          icon: 'warning',
          color: 'negative',
          message: 'Server error, please try again.'
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
          await this.$api.patch(
            `/comments/${this.replyModal.cid}`,
            { rating: this.replyModal.rating, comment: this.replyModal.comment },
            {
              headers: { Authorization: `Bearer ${this.user.jwt}` }
            }
          )
          this.$store.commit('tempSkin/editMyComment', { rating: this.replyModal.rating, comment: this.replyModal.comment })
          const { data } = await this.$api.get(`/comments/skins/${this.skin._id}/rating`)
          this.$store.commit(
            'tempSkin/updateRating', { ...data.result }
          )
        } else if (this.replyModal.mode === 1) {
          if (this.replyModal.comment.length === 0) {
            throw new Error('Validate Fail')
          }
          await this.$api.patch(
            `/comments/${this.replyModal.cid}/replies/${this.replyModal._id}`,
            { comment: this.replyModal.comment },
            {
              headers: { Authorization: `Bearer ${this.user.jwt}` }
            }
          )
          this.$store.commit('tempSkin/editReply', { cid: this.replyModal.cid, rid: this.replyModal._id, comment: this.replyModal.comment })
        } else {
          if (this.replyModal.comment.length === 0) {
            throw new Error('Validate Fail')
          }
          const { data } = await this.$api.post(
            `/comments/${this.replyModal.cid}/replies`,
            { comment: this.replyModal.comment },
            {
              headers: { Authorization: `Bearer ${this.user.jwt}` }
            }
          )
          this.$store.commit('tempSkin/createReply', { result: data.result, cid: this.replyModal.cid, comment: this.replyModal.comment })
        }
        this.replyModal.open = false
      } catch (error) {
        console.log(error)
        if (error.message === 'Validate Fail') {
          this.$q.notify({
            icon: 'warning',
            color: 'negative',
            message: 'Please fill out the form.'
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
