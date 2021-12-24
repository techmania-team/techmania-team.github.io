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
            q-btn.q-mr-xs(v-if="skin.submitter._id === user.id" flat icon="edit" color="tech" @click="$router.push('/skins/edit/' + skin._id)") Edit
            q-btn.q-mr-xs(flat icon="download" color="tech" type="a" :href="skin.link" target="__blank") DOWNLOAD
      q-separator
      .row.q-my-md
        .col-6
          .text-h6.q-mt-md.q-mb-lg {{ $t('skin.skinData') }}
          .q-gutter-sm
            div
              q-icon(size="sm" name="upload")
              | &nbsp;{{ $t('pattern.submittedBy') }}&nbsp;
              router-link.no-underline(:to='`/users/${skin.submitter._id}/#skins`') {{ skin.submitter.name }}
            div
              q-icon(size="sm" name="star")
              | &nbsp;{{ $t('submitSkinForm.skinType') }}: {{ skinType }}
        .col-12.col-md-6.pre-line.q-my-md.q-my-md-none
          .text-h6.q-mt-md.q-mb-lg {{ $t('skin.description') }}
          p(v-html="skin.description")
      .row.justify-center
        .col-12.text-h6.text-center {{ $t('pattern.previews') }}
        .col-12.col-md-6.col-lg-4.q-pa-md.q-my-xs(v-for="(video, idx) in skin.previews" :key="idx")
          q-video(:ratio="16/9" :src="'https://www.youtube.com/embed/'+video.ytid")
</template>

<script>
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
          content: `Submitted by ${this.skin.submitter.name}.`,
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
          content: `Submitted by ${this.skin.submitter.name}.`,
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
      skin: {
        _id: '',
        name: '',
        type: 0,
        link: '',
        previews: [],
        description: '',
        submitter: { name: '', _id: '' }
      }
    }
  },
  computed: {
    backgroundImage () {
      return this.skin.previews.length > 0 ? `http://i3.ytimg.com/vi/${this.skin.previews[0].ytid}/hqdefault.jpg` : 'https://raw.githubusercontent.com/techmania-team/techmania-team.github.io/master/public/assets/Logo_black.png'
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
  created () {
    this.skin = this.$store.getters['tempSkin/getSkin']
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
