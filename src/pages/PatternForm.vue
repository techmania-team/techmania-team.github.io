<template lang="pug">
q-page#patternForm
  section.q-mx-auto.padding
    .container
      .row
        .col-12.q-mx-auto
          q-form(@submit.prevent="submitForm")
            h4.text-center {{ model._id.length === 0 ? $t('submitForm.title') : $t('submitForm.editTitle') }}
            q-separator.q-my-md
            br
            q-banner.text-white.bg-red(rounded inline-actions)
              | {{ $t('submitForm.rulesTitle') }}
              ul
                li {{ $t('submitForm.rules1') }}
                li {{ $t('submitForm.rules2') }}
                li {{ $t('submitForm.rules3') }}
            br
            p.q-mb-none {{ $t('submitForm.songName') }}
            q-input.q-mb-md(v-model="model.name" dense :rules="[val => !!val || $t('submitForm.required')]")
            p.q-mb-none {{ $t('submitForm.composer') }}
            q-input.q-mb-md(v-model="model.composer" dense :rules="[val => !!val || $t('submitForm.required')]")
            p.q-mb-none {{ $t('submitForm.dlLink') }}
            q-input.q-mb-md(v-model="model.link" dense type="url" :rules="[val => !!val || $t('submitForm.required')]")
            q-toggle.q-mb-md(v-model="model.keysounded" :label="$t('pattern.keysounded')" left-label)
            p.q-mb-md {{ $t('submitForm.preview') }}
              .row.items-start.justify-between(v-for="(preview, index) in model.previews" :key="'A'+index")
                q-input.col-5(v-model="preview.name" :placeholder="$t('submitForm.name')" :rules="[val => !!val || $t('submitForm.required')]")
                q-input.col-5(v-model="preview.link" :placeholder="$t('submitForm.ytLink')" :rules="[val => ValidYouTubeLink(val) || $t('submitForm.invalidLink')]")
                .col-1.text-center.self-center
                  q-btn(flat round icon="clear" v-if="index !== 0" @click="removePreview(index)")
                  q-btn(flat round icon="add" v-else @click="addPreview")
            p.q-mb-md {{ $t('submitForm.difficulties') }}
            .row.items-start.justify-between(v-for="(difficulty, index) in model.difficulties" :key="'B'+index")
              q-select.col-2(v-model="difficulty.control" :options="controlTypes" :placeholder="$t('submitForm.control')" emit-value map-options)
              q-select.col-2(v-model="difficulty.lanes" :options="lanesOptions" :placeholder="$t('submitForm.lanes')" emit-value map-options)
              q-input.col-2(v-model="difficulty.name" :placeholder="$t('submitForm.name')" :rules="[val => !!val || $t('submitForm.required')]")
              q-input.col-2(v-model.number="difficulty.level" type="number" :placeholder="$t('submitForm.level')" :rules="[val => !!val && val > 0 || $t('submitForm.required')]")
              .col-1.text-center.self-center
                q-btn(flat round icon="clear" v-if="index !== 0" @click="removeDifficulty(index)")
                q-btn(flat round icon="add" v-else @click="addDifficulty")
            p.q-mb-md {{ $t('submitForm.description') }}
            q-editor(v-model="model.description" :toolbar="editor.toolbar")
            div(v-if="model._id.length > 0")
              hr.q-my-xl
              p.text-red {{ $t('submitForm.dangerZone') }}
              q-btn(color="red" @click="deleteConfirm") {{ $t('submitForm.delete') }}
            hr.q-my-xl
            p.text-center
              q-checkbox(v-model="model.agree")
                span(v-html="$t('submitForm.agreetos', {tosURL})")
              br
              q-btn(:label="$t('submitForm.submit')" color="tech" text-color="black" type="submit" :loading="submitting" style="width: 150px")
    q-dialog(v-model="confirm")
      q-card
        q-card-section.row.items-center
          q-avatar.q-mx-auto(icon="warning" text-color="red")
          span.q-ml-sm {{ $t('submitForm.deleteText') }}
        q-card-actions(align="right")
          q-btn(color="green" flat :label="$t('submitForm.deleteYes')" @click="deletePattern" :loading="deleting")
          q-btn(color="red" flat :label="$t('submitForm.deleteNo')" v-close-popup)
</template>

<script>
export default {
  name: 'PagePatternForm',
  meta () {
    return {
      title: this.title,
      meta: {
        color: {
          name: 'theme-color',
          content: '#E74C3C'
        },
        title: {
          name: 'title',
          content: this.title,
          'data-dynamic': true
        },
        description: {
          name: 'description',
          content: this.description,
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
          content: this.title,
          'data-dynamic': true
        },
        ogDescription: {
          property: 'og:description',
          content: this.description,
          'data-dynamic': true
        },
        ogImage: {
          property: 'og:image',
          content: 'https://raw.githubusercontent.com/techmania-team/techmania-team.github.io/master/public/assets/Logo_black.png',
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
          content: this.title,
          'data-dynamic': true
        },
        twDescription: {
          name: 'twitter:description',
          content: this.description,
          'data-dynamic': true
        },
        twImage: {
          name: 'twitter:image',
          content: 'https://raw.githubusercontent.com/techmania-team/techmania-team.github.io/master/public/assets/Logo_black.png',
          'data-dynamic': true
        }
      }
    }
  },
  data () {
    return {
      submitting: false,
      deleting: false,
      model: {
        _id: '',
        name: '',
        composer: '',
        keysounded: false,
        difficulties: [{ name: '', level: 0, control: 0, lanes: 4 }],
        link: '',
        previews: [{ link: '', name: '' }],
        description: '',
        agree: false
      },
      isedit: false,
      confirm: false,
      editor: {
        toolbar: [
          ['bold', 'italic', 'strike', 'underline', 'subscript', 'superscript'],
          ['hr', 'link'],
          ['undo', 'redo'],
          ['unordered', 'ordered'],
          ['viewsource']
        ]
      },
      tosURL: 'https://github.com/techmania-team/techmania-team.github.io/blob/master/ToS.md'
    }
  },
  preFetch ({ store, currentRoute, previousRoute, redirect, ssrContext, urlPath, publicPath }) {
    store.commit('tempPattern/resetPattern')
    if (currentRoute.params.id) return store.dispatch('tempPattern/fetchPattern', currentRoute.params.id)
    else return 0
  },
  computed: {
    title () {
      return 'TECHMANIA | ' + (this.model._id.length > 0 ? 'Edit Pattern' : 'New Pattern')
    },
    description () {
      return 'TECHMANIA | ' + (this.model._id.length > 0 ? 'Edit Pattern' : 'New Pattern')
    },
    controlTypes () {
      return [
        { label: this.$t('pattern.' + this.controls[0]), value: 0 },
        { label: this.$t('pattern.' + this.controls[1]), value: 1 },
        { label: this.$t('pattern.' + this.controls[2]), value: 2 }
      ]
    },
    lanesOptions () {
      return [
        { label: '2L', value: 2 },
        { label: '3L', value: 3 },
        { label: '4L', value: 4 }
      ]
    }
  },
  methods: {
    ValidYouTubeLink (url) {
      const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
      const match = url.match(regExp)
      return (match && match[7].length === 11)
    },
    async submitForm () {
      if (!this.model.agree) {
        this.$q.notify({
          color: 'negative',
          textColor: 'white',
          icon: 'warning',
          message: this.$t('submitForm.agreetos2'),
          position: 'top'
        })
        return
      }
      this.submitting = true
      try {
        const post = JSON.parse(JSON.stringify(this.model))
        post.previews.map(preview => {
          preview.ytid = this.GetIDFromYouTubeLink(preview.link)
          return preview
        })
        let result
        if (this.model._id.length > 0) {
          result = await this.$api.patch(`/patterns/${this.model._id}`, post, {
            headers: { Authorization: `Bearer ${this.user.jwt}` }
          })
        } else {
          result = await this.$api.post('/api/patterns', post, {
            headers: { Authorization: `Bearer ${this.user.jwt}` }
          })
        }
        if (result.data.success) {
          if (this.model._id.length > 0) {
            this.$q.notify({
              icon: 'check',
              message: this.$t('submitForm.updated'),
              color: 'positive',
              position: 'top',
              timeout: 2000
            })
            this.$router.push('/patterns/' + this.model._id)
          } else {
            this.$q.notify({
              icon: 'check',
              message: this.$t('submitForm.submitted'),
              color: 'positive',
              position: 'top',
              timeout: 2000
            })
            this.$router.push('/patterns/' + result.data.id)
          }
        } else {
          throw new Error('Server Error')
        }
      } catch (error) {
        let message = this.$t('submitForm.errorServer')
        if (error.response.data.message === 'Not in guild') {
          message = this.$t('submitForm.errorGuild')
        } else if (error.response.data.message === 'Unauthorized') {
          this.logout()
          message = this.$t('submitForm.errorUnauthorized')
        }
        this.$q.notify({
          icon: 'warning',
          message,
          color: 'negative',
          position: 'top',
          timeout: 2000
        })
      }
      this.submitting = false
    },
    addPreview () {
      this.model.previews.push({ link: '' })
    },
    removePreview (index) {
      this.model.previews.splice(index, 1)
    },
    addDifficulty () {
      this.model.difficulties.push({ name: '', level: 0, control: 0, lanes: 4 })
    },
    removeDifficulty (index) {
      this.model.difficulties.splice(index, 1)
    },
    resetDialog () {
      this.model = {
        name: '',
        composer: '',
        keysounded: false,
        difficulties: [{ name: '', level: 0, control: 0, lanes: 4 }],
        link: '',
        previews: [{ link: '', name: '' }],
        description: '',
        agree: false
      }
    },
    deleteConfirm () {
      this.confirm = true
    },
    async deletePattern () {
      this.deleting = true
      try {
        const result = await this.$api.delete(`/patterns/${this.model._id}`, {
          headers: { Authorization: `Bearer ${this.user.jwt}` }
        })
        if (result.data.success) {
          this.$q.notify({
            icon: 'check',
            message: this.$t('submitForm.deleted'),
            color: 'positive',
            position: 'top',
            timeout: 2000
          })
          this.model = {
            name: '',
            composer: '',
            keysounded: false,
            difficulties: [{ name: '', level: 0, control: 0, lanes: 4 }],
            link: '',
            previews: [{ link: '', name: '' }],
            description: '',
            agree: false
          }
          this.confirm = false
        } else {
          throw new Error('Server Error')
        }
        this.$router.push(`/users/${this.user.id}/#patterns`)
      } catch (error) {
        let message = this.$t('submitForm.errorServer')
        if (error.response.data.message === 'Not in guild') {
          message = this.$t('submitForm.errorGuild')
        } else if (error.response.data.message === 'Unauthorized') {
          this.logout()
          message = this.$t('submitForm.errorUnauthorized')
        }
        this.$q.notify({
          icon: 'warning',
          message,
          color: 'negative',
          position: 'top',
          timeout: 2000
        })
      }
      this.confirm = false
      this.deleting = false
    }
  },
  created () {
    if (this.$route.params.id) {
      const patterndata = JSON.parse(JSON.stringify(this.$store.getters['tempPattern/getPattern']))
      if (patterndata._id.length === 0 || patterndata.submitter._id !== this.user.id) {
        this.$router.push('/404')
      } else {
        patterndata.previews.map(preview => {
          preview.link = 'https://www.youtube.com/watch?v=' + preview.ytid
          return preview
        })
        this.model = { ...patterndata, agree: false }
      }
    }
  }
}
</script>
