<template lang="pug">
q-page#pattern
  section.bg(:style="{backgroundImage: `url(${this.backgroundImage})`}")
  section.q-mx-auto.padding
    .container
      .row
        .col-6.q-mx-auto
          h4 {{ pattern.name }}
        q-no-ssr.col-6.text-right
          h4
            q-btn.q-mr-xs(v-if="pattern.submitter._id === user.id" flat icon="edit" color="tech" @click="$router.push('/patterns/edit/' + pattern._id)") {{ $t('pattern.edit') }}
            q-btn.q-mr-xs(flat icon="download" color="tech" type="a" :href="pattern.link" target="__blank") {{ $t('pattern.download') }}
      q-separator
      .row.q-my-md
        .col-12.col-md-6
          .text-h6.q-mt-md.q-mb-lg {{ $t('pattern.patternData') }}
          .q-gutter-sm
            div
              q-rating(v-model="pattern.rating.rating" readonly icon="star" icon-half="star_half")
              | &nbsp; {{ pattern.rating.rating.toFixed(2) }} / {{ $t('pattern.ratingCount', {count: pattern.rating.count}) }}
            div
              q-icon(size="sm" name="person")
              | &nbsp;{{ $t('pattern.composer') }} {{ pattern.composer }}
            div
              q-icon(size="sm" name="upload")
              | &nbsp;{{ $t('pattern.submittedBy') }}&nbsp;
              router-link.no-underline(:to='`/users/${pattern.submitter._id}/#patterns`') {{ pattern.submitter.name }}
            div(:class="[{'text-red': !pattern.keysounded, 'text-positive': pattern.keysounded}]")
              q-icon(size="sm" :name="!pattern.keysounded ? 'close' : 'check'")
              | &nbsp;{{ $t('pattern.keysounded') }}
            .q-gutter-sm
              div.inline-block.q-mx-md(v-for="(difficulty, index) in pattern.difficulties" :key="'D'+index")
                q-icon(size="sm" :name="`img:./assets/icons/${difficulty.lanes}L.png`" :class="getLevelFilter(difficulty.level)")
                q-icon.text-black(size="sm" :name="getControlIcon(difficulty.control, difficulty.level)" :class="getLevelFilter(difficulty.level)")
                span(:class="getLevelColor(difficulty.level)") &nbsp;{{ difficulty.name }} Lv.{{ difficulty.level }}
        .col-12.col-md-6.pre-line.q-my-md.q-my-md-none
          .text-h6.q-mt-md.q-mb-lg {{ $t('pattern.description') }}
          .q-gutter-sm
            p(v-html="pattern.description" v-if="pattern.description")
            p(v-else) {{ $t('pattern.noDescription') }}
      .row.q-my-md
        .col-12
          .text-h6.q-mt-md.q-mb-lg.text-md-center {{ $t('pattern.previews') }}
          .q-gutter-sm
            .row.w-100.justify-center
              .col-12.col-md-6.col-lg-4.q-pa-md.q-my-xs(v-for="(video, idx) in pattern.previews" :key="idx")
                q-video(:ratio="16/9" :src="'https://www.youtube.com/embed/'+video.ytid")
      q-no-ssr
        q-separator(v-if="isLogin && $store.state.tempPattern.myComment._id.length === 0")
        .row.q-my-md(v-if="isLogin && $store.state.tempPattern.myComment._id.length === 0")
          .col-12
            .text-h6.q-mt-md.q-mb-lg.text-center {{ $t('pattern.rateThisPattern') }}
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
  name: 'PagePattern',
  meta () {
    return {
      title: `TECHMANIA | ${this.pattern.name}`,
      meta: {
        color: {
          name: 'theme-color',
          content: '#E74C3C'
        },
        title: {
          name: 'title',
          content: `${this.pattern.name}`,
          'data-dynamic': true
        },
        description: {
          name: 'description',
          content: `Composed by ${this.pattern.composer}. Submitted by ${this.pattern.submitter.name}.`,
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
          content: `TECHMANIA | ${this.pattern.name}`,
          'data-dynamic': true
        },
        ogDescription: {
          property: 'og:description',
          content: `Composed by ${this.pattern.composer}. Submitted by ${this.pattern.submitter.name}.`,
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
          content: `TECHMANIA | ${this.pattern.name}`,
          'data-dynamic': true
        },
        twDescription: {
          name: 'twitter:description',
          content: `Composed by ${this.pattern.composer}. Submitted by ${this.pattern.submitter.name}.`,
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
    store.commit('tempPattern/resetPattern')
    return store.dispatch('tempPattern/fetchPattern', currentRoute.params.id)
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
      return this.pattern.previews.length > 0 ? this.getYouTubeThumbnail(this.pattern.previews[0].ytid) : 'https://raw.githubusercontent.com/techmania-team/techmania-team.github.io/master/public/assets/Logo_black.png'
    },
    pattern () {
      return this.$store.getters['tempPattern/getPattern']
    },
    formattedComments () {
      return this.$store.getters['tempPattern/getFormattedComments']
    },
    commentsScrollDisabled () {
      return this.$store.state.tempPattern.commentsScrollDisabled
    }
  },
  methods: {
    async loadScroll (index, done) {
      await this.$store.dispatch('tempPattern/fetchComments', { id: this.$route.params.id, start: (index - 1) * 10 })
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
        this.$store.commit('tempPattern/setVote', { cid, rid, positive })
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
          { rating: this.comment.rating, comment: this.comment.comment, pattern: this.pattern._id },
          { headers: { Authorization: `Bearer ${this.user.jwt}` } }
        )
        this.$store.commit(
          'tempPattern/setMyComment', { ...response.data.result }
        )
        response = await this.$api.get(`/comments/patterns/${this.pattern._id}/rating`)
        this.$store.commit(
          'tempPattern/updateRating', { ...response.data.result }
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
          this.$store.commit('tempPattern/editMyComment', { rating: this.replyModal.rating, comment: this.replyModal.comment })
          const { data } = await this.$api.get(`/comments/patterns/${this.pattern._id}/rating`)
          this.$store.commit(
            'tempPattern/updateRating', { ...data.result }
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
          this.$store.commit('tempPattern/editReply', { cid: this.replyModal.cid, rid: this.replyModal._id, comment: this.replyModal.comment })
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
          this.$store.commit('tempPattern/createReply', { result: data.result, cid: this.replyModal.cid, comment: this.replyModal.comment })
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
    await this.$store.dispatch('tempPattern/fetchMyComment', this.$route.params.id)
    if (this.pattern._id.length === 0) {
      this.$router.push('/404')
    } else {
      if (process.env.CLIENT) {
        document.title = `TECHMANIA | ${this.pattern.name}`
      }
    }
  }
}
</script>
