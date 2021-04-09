<template lang="pug">
  div
    q-dialog(v-model="openModal")
      q-card(style="width: 700px; max-width: 80vw;")
        q-form(@submit.prevent="submitForm")
          q-card-section
            .text-h6 Submit New Pattern
          q-card-section
            q-banner.text-white.bg-red(inline-actions)
              | Please read the rules before you submit your pattern.
              ul
                li Patterns must be for TECHMANIA only. We will delete any submissions that are for other rhythm games.
                li Patterns made for/from DJMAX and DJMAX Technika Original tracks are not allowed to be posted.
                li Pattens must be your own. Please do not upload other peoples work.
          q-card-section
            p.q-mb-none Song Name
            q-input.q-mb-md(v-model="model.name" dense :rules="[val => !!val || 'Field is required']")
            p.q-mb-none Composer
            q-input.q-mb-md(v-model="model.composer" dense :rules="[val => !!val || 'Field is required']")
            p.q-mb-none Download Link
            q-input.q-mb-md(v-model="model.link" dense type="url" :rules="[val => !!val || 'Field is required']")
            q-toggle.q-mb-md(v-model="model.keysounded" label="Keysound" left-label)
            p.q-mb-none YouTube Preview
              .q-mb-md
                .row.items-start(v-for="(preview, index) in model.previews" :key="'A'+index")
                  q-input.col-5(v-model="preview.name" placeholder="Name" :rules="[val => !!val || 'Field is required']")
                  .col-1
                  q-input.col-5(v-model="preview.link" placeholder="YouTube Link" :rules="[val => ValidYouTubeLink(val) || 'Please enter a valid URL']")
                  .col-1.text-center
                    q-btn(flat round icon="clear" v-if="index !== 0" @click="removePreview(index)")
                    q-btn(flat round icon="add" v-else @click="addPreview")
            p.q-mb-none Difficulties
              .q-mb-md
                .row.items-start(v-for="(difficulty, index) in model.difficulties" :key="'B'+index")
                  q-select.col-3(v-model="difficulty.control" :options="controlTypes" placeholder="Control" emit-value map-options)
                  .col-1
                  q-input.col-3(v-model="difficulty.name" placeholder="Name" :rules="[val => !!val || 'Field is required']")
                  .col-1
                  q-input.col-3(v-model.number="difficulty.level" type="number" placeholder="Level" :rules="[val => !!val || 'Field is required']")
                  .col-1
                    q-btn(flat round icon="clear" v-if="index !== 0" @click="removeDifficulty(index)")
                    q-btn(flat round icon="add" v-else @click="addDifficulty")
            p.mb-none Description
              q-input.q-mb-md(v-model="model.description" type="textarea" autogrow)
          q-card-section(v-if="model.id")
            p.text-red DANGER ZONE
            q-btn(color="red" @click="deleteConfirm") DELETE THIS PATTERN
          q-card-actions(align="right")
            q-btn(flat label="Submit" color="tech" type="submit" :loading="submitting")
    q-dialog(v-model="confirm")
      q-card
        q-card-section.row.items-center
          q-avatar.q-mx-auto(icon="warning" text-color="red")
          span.q-ml-sm DO YOU REALLY WANT TO DELETE THIS PATTERN?
        q-card-actions(align="right")
          q-btn(color="green" flat label="YES, DELETE IT" @click="deletePattern" :loading="deleting")
          q-btn(color="red" flat label="NO, CANCEL" v-close-popup)
</template>

<script>
export default {
  name: 'NewPatternDialog',
  data () {
    return {
      submitting: false,
      deleting: false,
      model: {
        id: '',
        name: '',
        composer: '',
        keysounded: false,
        difficulties: [{ name: '', level: 0, control: 0 }],
        link: '',
        previews: [{ link: '', name: '' }],
        description: ''
      },
      controlTypes: [
        { label: 'Touch', value: 0 },
        { label: 'Keys', value: 1 },
        { label: 'KM', value: 2 }
      ],
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
    }
  },
  watch: {
    patterndata () {
      if (Object.keys(this.patterndata).length === 0) {
        this.model = {
          id: '',
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
        patterndata.keysounded = patterndata.keysounded === '1'
        patterndata.previews.map(preview => {
          preview.link = 'https://www.youtube.com/watch?v=' + preview.link
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
        const result = await this.$axios.post(new URL('/api/patterns', process.env.HOST_URL), post, {
          headers: { Authorization: `Bearer ${this.user.jwt}` }
        })
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
        }
      } catch (error) {
        let message = ''
        if (error.response.data.message === 'Not in guild') {
          message = 'You must join our discord to submit new pattern.'
        }
        if (error.response.data.message === 'Unauthorized') {
          message = 'Unauthorized.'
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
        const result = await this.$axios.post(process.env.BACK_URL + '?action=delete', { id: this.model.id }, { withCredentials: true })
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
          let message = ''
          if (result.data.message === 'Not in guild') {
            message = 'You must join our discord to submit new pattern.'
          }
          if (result.data.message === 'Unauthorized') {
            message = 'Unauthorized.'
          }
          throw new Error(message)
        }
      } catch (error) {
        this.$q.notify({
          icon: 'warning',
          message: error.message,
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
