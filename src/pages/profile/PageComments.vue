<template lang="pug">
#profile-comments
  .text-center.text-body1(v-if="comments.length === 0 && scrollCommentDisable") {{ $t('comment.noComment') }}
  q-infinite-scroll.row.q-my-md(v-else @load="loadCommentScroll" :offset="200" :disable="scrollCommentDisable")
    q-tree(:nodes="comments" node-key="_id" default-expand-all :no-nodes-label="$t('comment.noComment')")
      template.no-padding(#default-header="prop")
        .row.q-gutter-x-sm.items-center
          .col-auto.text-weight-bold
            router-link.no-underline(:to="'/patterns/'+prop.node.pattern._id")
              .text-subtitle {{ prop.node.pattern.name }}
          .col-auto(v-if="prop.node.rating")
            q-rating(v-model="prop.node.rating" readonly)
          .col-auto.text-weight-bold {{ formatDate(prop.node.date) }}
            q-tooltip(anchor="top middle" self="bottom middle" content-style="background: #000")
              | {{ formatTime(prop.node.date) }}
      template(#default-body="prop")
        p.text-white.comment {{ prop.node.comment }}
</template>

<script>
import parseISO from 'date-fns/fp/parseISO'

export default {
  data () {
    return {
      comments: [],
      scrollCommentDisable: false
    }
  },
  methods: {
    async fetchComments (start = 0) {
      try {
        const result = await this.$api.get(
          `/comments/user/${this.$route.params.id}?start=${start}&limit=12`
        )
        if (result.data.success) {
          if (result.data.result.length > 0) this.comments = this.comments.concat(result.data.result)
          else this.scrollCommentDisable = true
        } else {
          throw new Error('Error')
        }
      } catch (_) {
        this.error = true
        this.scrollCommentDisable = true
      }
    },
    async loadCommentScroll (index, done) {
      await this.fetchComments((index - 1) * 12)
      done()
    },
    formatDate (date) {
      return this.$date.formatDistanceToNow(parseISO(date), { locale: this.$date.locales[this.user.locale2], addSuffix: true })
    },
    formatTime (date) {
      return new Date(date).toLocaleString(this.user.locale)
    }
  }
}
</script>
