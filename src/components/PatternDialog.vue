<template lang="pug">
  div
    q-dialog(v-model="openModal")
      q-card(style="width: 700px; max-width: 80vw;")
        q-form(@submit.prevent="submitForm")
          q-card-section
            .text-h6 {{ model._id && model._id.length === 0 ? $t('submitForm.title') : $t('submitForm.editTitle') }}
          q-card-section
            q-banner.text-white.bg-red(inline-actions)
              | {{ $t('submitForm.rulesTitle') }}
              ul
                li {{ $t('submitForm.rules1') }}
                li {{ $t('submitForm.rules2') }}
                li {{ $t('submitForm.rules3') }}
          q-card-section
            p.q-mb-none {{ $t('submitForm.songName') }}
            q-input.q-mb-md(v-model="model.name" dense :rules="[val => !!val || $t('submitForm.required')]")
            p.q-mb-none {{ $t('submitForm.composer') }}
            q-input.q-mb-md(v-model="model.composer" dense :rules="[val => !!val || $t('submitForm.required')]")
            p.q-mb-none {{ $t('submitForm.dlLink') }}
            q-input.q-mb-md(v-model="model.link" dense type="url" :rules="[val => !!val || $t('submitForm.required')]")
            q-toggle.q-mb-md(v-model="model.keysounded" :label="$t('pattern.keysounded')" left-label)
            p.q-mb-none {{ $t('submitForm.preview') }}
              .q-mb-md
                .row.items-start(v-for="(preview, index) in model.previews" :key="'A'+index")
                  q-input.col-5(v-model="preview.name" :placeholder="$t('submitForm.name')" :rules="[val => !!val || $t('submitForm.required')]")
                  .col-1
                  q-input.col-5(v-model="preview.link" :placeholder="$t('submitForm.ytLink')" :rules="[val => ValidYouTubeLink(val) || $t('submitForm.invalidLink')]")
                  .col-1.text-center
                    q-btn(flat round icon="clear" v-if="index !== 0" @click="removePreview(index)")
                    q-btn(flat round icon="add" v-else @click="addPreview")
            p.q-mb-none {{ $t('submitForm.difficulties') }}
              .q-mb-md
                .row.items-start(v-for="(difficulty, index) in model.difficulties" :key="'B'+index")
                  q-select.col-3(v-model="difficulty.control" :options="controlTypes" :placeholder="$t('submitForm.control')" emit-value map-options)
                  .col-1
                  q-input.col-3(v-model="difficulty.name" :placeholder="$t('submitForm.name')" :rules="[val => !!val || $t('submitForm.required')]")
                  .col-1
                  q-input.col-3(v-model.number="difficulty.level" type="number" :placeholder="$t('submitForm.level')" :rules="[val => !!val && val > 0 || $t('submitForm.required')]")
                  .col-1
                    q-btn(flat round icon="clear" v-if="index !== 0" @click="removeDifficulty(index)")
                    q-btn(flat round icon="add" v-else @click="addDifficulty")
            p.mb-none {{ $t('submitForm.description') }}
              q-input.q-mb-md(v-model="model.description" type="textarea" autogrow)
          q-card-section(v-if="model._id")
            p.text-red {{ $t('submitForm.dangerZone') }}
            q-btn(color="red" @click="deleteConfirm") {{ $t('submitForm.delete') }}
          q-card-actions(align="right")
            q-btn(flat :label="$t('submitForm.submit')" color="tech" type="submit" :loading="submitting")
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
  name: 'NewPatternDialog',
  data () {
    return {
      submitting: false,
      deleting: false,
      model: {
        _id: '',
        name: '',
        composer: '',
        keysounded: false,
        difficulties: [{ name: '', level: 0, control: 0 }],
        link: '',
        previews: [{ link: '', name: '' }],
        description: ''
      },
      isedit: false,
      confirm: false
    }
  },
  props: {
    open: Boolean,
    patterndata: Object
  },
  computed: {
    openModal: {
      get () {
        return this.open
      },
      set (value) {
        this.$emit('model', value)
      }
    },
    controlTypes () {
      return [
        { label: this.$t('pattern.' + this.controls[0]), value: 0 },
        { label: this.$t('pattern.' + this.controls[1]), value: 1 },
        { label: this.$t('pattern.' + this.controls[2]), value: 2 }
      ]
    }
  },
  watch: {
    patterndata () {
      if (Object.keys(this.patterndata).length === 0) {
        this.model = {
          _id: '',
          name: '',
          composer: '',
          keysounded: false,
          difficulties: [{ name: '', level: 0, control: 0 }],
          link: '',
          previews: [{ link: '', name: '' }],
          description: ''
        }
      } else {
        const patterndata = JSON.parse(JSON.stringify(this.patterndata))
        patterndata.previews.map(preview => {
          preview.link = 'https://www.youtube.com/watch?v=' + preview.ytid
          return preview
        })
        this.model = patterndata
      }
    }
  },
  methods: {
    ValidYouTubeLink (url) {
      const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
      const match = url.match(regExp)
      return (match && match[7].length === 11)
    },
    async submitForm () {
      this.submitting = true
      try {
        const post = JSON.parse(JSON.stringify(this.model))
        post.previews.map(preview => {
          preview.ytid = this.GetIDFromYouTubeLink(preview.link)
          return preview
        })
        let result
        if (this.model._id) {
          result = await this.$axios.patch(new URL(`/api/patterns/${this.model._id}`, process.env.HOST_URL), post, {
            headers: { Authorization: `Bearer ${this.user.jwt}` }
          })
        } else {
          result = await this.$axios.post(new URL('/api/patterns', process.env.HOST_URL), post, {
            headers: { Authorization: `Bearer ${this.user.jwt}` }
          })
        }
        if (result.data.success) {
          this.$q.notify({
            icon: 'check',
            message: 'Submitted.',
            color: 'positive',
            position: 'top',
            timeout: 2000
          })
          this.model = {
            name: '',
            composer: '',
            keysounded: false,
            difficulties: [{ name: '', level: 0, control: 0 }],
            link: '',
            previews: [{ link: '', name: '' }],
            description: ''
          }
          this.$emit('refreshPattern')
          this.openModal = false
        } else {
          throw new Error('Server Error')
        }
      } catch (error) {
        let message = this.$t('submitForm.errorServer')
        if (error.response.data.message === 'Not in guild') {
          message = this.$t('submitForm.errorGuild')
        } else if (error.response.data.message === 'Unauthorized') {
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
      this.model.difficulties.push({ name: '', level: 0, control: 0 })
    },
    removeDifficulty (index) {
      this.model.difficulties.splice(index, 1)
    },
    resetDialog () {
      this.model = {
        name: '',
        composer: '',
        keysounded: false,
        difficulties: [{ name: '', level: 0, control: 0 }],
        link: '',
        previews: [{ link: '', name: '' }],
        description: ''
      }
    },
    deleteConfirm () {
      this.confirm = true
    },
    async deletePattern () {
      this.deleting = true
      try {
        const result = await this.$axios.delete(new URL(`/api/patterns/${this.model._id}`, process.env.HOST_URL), {
          headers: { Authorization: `Bearer ${this.user.jwt}` }
        })
        if (result.data.success) {
          this.$q.notify({
            icon: 'check',
            message: 'Deleted.',
            color: 'positive',
            position: 'top',
            timeout: 2000
          })
          this.model = {
            name: '',
            composer: '',
            keysounded: false,
            difficulties: [{ name: '', level: 0, control: 0 }],
            link: '',
            previews: [{ link: '', name: '' }],
            description: ''
          }
          this.$emit('refreshPattern')
          this.confirm = false
          this.openModal = false
        } else {
          throw new Error('Server Error')
        }
      } catch (error) {
        let message = this.$t('submitForm.errorServer')
        if (error.response.data.message === 'Not in guild') {
          message = this.$t('submitForm.errorGuild')
        } else if (error.response.data.message === 'Unauthorized') {
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
  }
}
</script>
