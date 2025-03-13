<template lang="pug">
q-page#patternForm
  //- Header
  q-parallax.header-parallax(:height="200" :class="{ 'header-blur': backgroundImage != '/assets/header-pattern.png' }")
    //- Header image background
    template(#media)
      img(:src="backgroundImage")
    //- Header content
    template(#content)
      .column.items-center.q-mb-md
        .text-h4.text-center {{ pattern._id.length === 0 ? $t('submitForm.title') : $t('submitForm.editTitle') }}
  //- Content
  section.q-mx-auto.padding
    .container
      .row
        .col-12
          //- Form
          Form(v-slot="{ handleSubmit }" :validation-schema="schema" :initial-values="initialValues" ref="form" as="")
            q-form(@submit.prevent="handleSubmit($event, onSubmit)")
              //- Rules
              q-card.text-white.bg-red.q-my-lg(rounded)
                q-card-section
                  p {{ $t('submitForm.rulesTitle') }}
                  ul.q-mb-none
                    li {{ $t('submitForm.rules1') }}
                    li {{ $t('submitForm.rules2') }}
                    li {{ $t('submitForm.rules3') }}
              //- Basic informations
              q-list.q-mb-lg
                //- List header
                q-item-label.text-h6.text-tech(header) Basic informations
                q-separator.q-mb-md(inset)
                //- Field - Song name
                //- NOTE:
                //- QItem has a hardcoded no-wrap class
                //- so we need to wrap it in a div to make it wrap
                q-item.q-py-lg.q-py-md-md
                  q-item-section
                    .row.justify-center.items-center
                      .col-12.col-md-2.q-mb-md.q-mb-md-none {{ $t('submitForm.songName') }}
                      .col-12.col-md-10
                        Field(name="name" v-slot="{ field, errorMessage }")
                          q-input.q-pb-none(
                            outlined square color="tech"
                            :model-value="field.value"
                            @update:model-value="field.onChange($event)"
                            @blur="field.onBlur($event)"
                            :error-message="errorMessage"
                            :error="!!errorMessage"
                          )
                //- Field - Composer
                q-item.q-py-lg.q-py-md-md
                  q-item-section
                    .row.justify-center.items-center
                      .col-12.col-md-2.q-mb-md.q-mb-md-none {{ $t('submitForm.composer') }}
                      .col-12.col-md-10
                        Field(name="composer" v-slot="{ field, errorMessage }")
                          q-input.q-pb-none(
                            outlined square color="tech"
                            :model-value="field.value"
                            @update:model-value="field.onChange($event)"
                            @blur="field.onBlur($event)"
                            :error-message="errorMessage"
                            :error="!!errorMessage"
                          )
                //- Field - Download link
                q-item.q-py-lg.q-py-md-md
                  q-item-section
                    .row.justify-center.items-center
                      .col-12.col-md-2.q-mb-md.q-mb-md-none {{ $t('submitForm.dlLink') }}
                      .col-12.col-md-10
                        Field(name="link" v-slot="{ field, errorMessage }")
                          q-input.q-pb-none(
                            outlined square color="tech" type="url"
                            :model-value="field.value"
                            @update:model-value="field.onChange($event)"
                            @blur="field.onBlur($event)"
                            :error-message="errorMessage"
                            :error="!!errorMessage"
                          )
                //- Field - Keysounded
                q-item.q-py-lg.q-py-md-md
                  q-item-section
                    .row.justify-center.items-center
                      .col-2 {{ $t('pattern.keysounded') }}
                      .col-10
                        Field(name="keysounded" v-slot="{ field, errorMessage }")
                          q-field.q-pb-none(
                            borderless color="white"
                            :error-message="errorMessage"
                            :error="!!errorMessage"
                          )
                            q-checkbox(
                              keep-color color="tech"
                              :true-value="true" :false-value="false"
                              :model-value="field.value"
                              @update:model-value="field.onChange($event)"
                            )
                //- Field - Image link
                q-item.q-py-lg.q-py-md-md
                  q-item-section
                    .row.justify-center.items-center
                      .col-12.col-md-2.q-mb-md.q-mb-md-none {{ $t('submitForm.image') }}
                      .col-12.col-md-10
                        Field(name="image" v-slot="{ field, errorMessage }")
                          q-input.q-pb-none(
                            outlined square color="tech"
                            :model-value="field.value"
                            @update:model-value="field.onChange($event)"
                            @blur="field.onBlur($event)"
                            :error-message="errorMessage"
                            :error="!!errorMessage"
                          )
              //- Previews
              q-list.q-my-lg
                q-item-label.text-h6.text-tech(header) {{ $t('submitForm.preview')}}
                q-separator.q-mb-md(inset)
                q-item
                  q-item-section
                    .row.items-start.justify-between.q-col-gutter-y-xl
                      FieldArray(name="previews" v-slot="{ fields, push, remove }")
                        template(v-for="(field, idx) in fields" :key="field.key")
                          .col-12
                            .row
                              .col-10.col-md-11
                                .row.q-col-gutter-x-md.q-col-gutter-y-lg
                                  //- Name
                                  .col-12.col-md-3
                                    Field(:name="`previews[${idx}].name`" v-slot="{ field, errorMessage }")
                                      q-input.q-pb-none(
                                        outlined square color="tech"
                                        :model-value="field.value"
                                        @update:model-value="field.onChange($event)"
                                        @blur="field.onBlur($event)"
                                        :error-message="errorMessage"
                                        :error="!!errorMessage"
                                        :placeholder="$t('submitForm.name')"
                                      )
                                  //- Link
                                  .col-12.col-md-9
                                    Field(:name="`previews[${idx}].link`" v-slot="{ field, errorMessage }")
                                      q-input.q-pb-none(
                                        outlined square color="tech" type="url"
                                        :model-value="field.value"
                                        @update:model-value="field.onChange($event)"
                                        @blur="field.onBlur($event)"
                                        :error-message="errorMessage"
                                        :error="!!errorMessage"
                                        :placeholder="$t('submitForm.ytLink')"
                                      )
                              //- Action buttons
                              .col-2.col-md-1.text-center.self-center.q-py-none
                                q-btn(
                                  flat round icon="delete" color="tech"
                                  v-if="idx !== 0"
                                  @click="remove(idx)"
                                )
                                q-btn(
                                  flat round icon="add" color="tech"
                                  v-else
                                  @click="push({ name: '', link: '' })"
                                )
              //- Difficulties
              q-list.q-my-lg
                q-item-label.text-h6.text-tech(header) {{ $t('submitForm.difficulties') }}
                q-separator.q-mb-md(inset)
                q-item
                  q-item-section
                    .row.items-start.justify-between.q-col-gutter-y-xl
                      FieldArray(name="difficulties" v-slot="{ fields, push, remove }")
                        template(v-for="(field, idx) in fields" :key="field.key")
                          .col-12
                            .row
                              .col-10.col-md-11
                                .row.q-col-gutter-x-md.q-col-gutter-y-md
                                  //- Control
                                  .col-6.col-md-2
                                    Field(:name="`difficulties[${idx}].control`" v-slot="{ field, errorMessage }")
                                      q-select.q-pb-none(
                                        outlined square color="tech"
                                        :model-value="field.value"
                                        @update:model-value="field.onChange($event)"
                                        @blur="field.onBlur($event)"
                                        :error-message="errorMessage"
                                        :error="!!errorMessage"
                                        :options="controlTypes" :placeholder="$t('submitForm.control')"
                                        emit-value map-options
                                      )
                                  //- Lanes
                                  .col-6.col-md-2
                                    Field(:name="`difficulties[${idx}].lanes`" v-slot="{ field, errorMessage }")
                                      q-select.q-pb-none(
                                        outlined square color="tech"
                                        :model-value="field.value"
                                        @update:model-value="field.onChange($event)"
                                        @blur="field.onBlur($event)"
                                        :error-message="errorMessage"
                                        :error="!!errorMessage"
                                        :options="lanesOptions" :placeholder="$t('submitForm.lanes')"
                                        emit-value map-options
                                      )
                                  //- Name
                                  .col-6.col-md-6
                                    Field(:name="`difficulties[${idx}].name`" v-slot="{ field, errorMessage }")
                                      q-input.q-pb-none(
                                        outlined square color="tech"
                                        :model-value="field.value"
                                        @update:model-value="field.onChange($event)"
                                        @blur="field.onBlur($event)"
                                        :error-message="errorMessage"
                                        :error="!!errorMessage"
                                        :placeholder="$t('submitForm.name')"
                                      )
                                  //- Level
                                  .col-6.col-md-2
                                    Field(:name="`difficulties[${idx}].level`" v-slot="{ field, errorMessage }")
                                      q-input.q-pb-none(
                                        outlined square color="tech" type="number"
                                        :model-value="field.value"
                                        @update:model-value="field.onChange($event)"
                                        @blur="field.onBlur($event)"
                                        :error-message="errorMessage"
                                        :error="!!errorMessage"
                                        :placeholder="$t('submitForm.level')"
                                        min="1"
                                      )
                              //- Action buttons
                              .col-2.col-md-1.text-center.self-center.q-py-none
                                q-btn(
                                  flat round icon="delete" color="tech"
                                  v-if="idx !== 0"
                                  @click="remove(idx)"
                                )
                                q-btn(
                                  flat round icon="add" color="tech"
                                  v-else
                                  @click="push({ name: '', level: undefined, control: 0, lanes: 4 })"
                                )
              //- Description
              q-list.q-my-lg
                q-item-label.text-h6.text-tech(header) {{ $t('submitForm.description') }}
                q-separator.q-mb-md(inset)
                q-item
                  q-item-section
                    Field(name="description" v-slot="{ field }")
                      q-editor(
                        outlined
                        @update:model-value="field.onChange($event)"
                        :model-value="field.value"
                        :toolbar="toolbar"
                        toolbar-toggle-color="tech"
                      )
              //- Field - Danger Zone
              q-list.q-my-lg(v-if="pattern._id.length > 0")
                //- List header
                q-item-label.text-h6.text-red(header) {{ $t('submitForm.dangerZone') }}
                q-separator.q-mb-md(inset)
                q-item
                  q-item-section
                    .row.justify-center.items-center
                      .col-12.col-md-2.q-mb-md.q-mb-md-none {{ $t('submitForm.delete') }}
                      .col-12.col-md-10
                        q-btn(outline color="red" @click="openDeleteDialog") {{ $t('submitForm.delete') }}
              //- Terms of Service
              .q-mt-xl.q-mx-auto.text-center
                Field(name="agree" v-slot="{ field, errorMessage }")
                  q-checkbox(
                    keep-color color="tech"
                    :model-value="field.value"
                    @update:model-value="field.onChange($event)"
                  )
                  span(v-html="$t('submitForm.agreetos', {tosURL})")
                  template(v-if="!!errorMessage")
                    .text-negative {{ errorMessage }}
                br
                //- Submit button
                q-btn.q-my-md(:label="$t('submitForm.submit')" color="tech" text-color="black" type="submit" style="width: 150px")
    //- Delete confirmation dialog
    q-dialog(v-model="deleteDialog" persistent)
      q-card(rounded)
        //- Dialog header
        q-card-section.text-center
          q-icon(name="warning" color="red" size="100px")
          .text-h6 {{ $t('submitForm.deleteText') }}
        q-separator
        //- Dialog actions
        q-card-actions(align="around")
          //- Confirm
          q-btn(color="green" flat :label="$t('submitForm.deleteYes')" @click="deletePattern" :loading="deleting")
          //- Cancel
          q-btn(color="red" flat :label="$t('submitForm.deleteNo')" v-close-popup)
</template>

<script setup>
import { ref, computed, onMounted, useTemplateRef, nextTick } from 'vue'
import { useMeta, useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Form, Field, FieldArray } from 'vee-validate'
import * as yup from 'yup'
import { useReCaptcha } from 'vue-recaptcha-v3'
import { getIDFromYouTubeLink, getYouTubeThumbnail } from 'src/utils/youtube'
import { useUserStore } from 'src/stores/user'
import { useTempPatternStore } from 'src/stores/temp-pattern'
import { controls } from 'src/utils/control'
import api from 'src/utils/api'
import handleError from 'src/utils/handleError'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const user = useUserStore()
const pattern = useTempPatternStore()
const { t } = useI18n()
const recaptcha = useReCaptcha()

const backgroundImage = ref('')

const metaData = () => {
  const title = user.isLogin
    ? 'TECHMANIA | ' + (pattern._id.length > 0 ? 'Edit Pattern' : 'New Pattern')
    : 'Log in or sign up to view'
  return {
    title,
    meta: {
      color: {
        name: 'theme-color',
        content: '#E74C3C',
      },
      title: {
        name: 'title',
        content: title,
        'data-dynamic': true,
      },
      description: {
        name: 'description',
        content: title,
        'data-dynamic': true,
      },
      ogType: {
        property: 'og:type',
        content: 'website',
        'data-dynamic': true,
      },
      ogUrl: {
        property: 'og:url',
        content: new URL(route.fullPath, process.env.HOST_URL).toString(),
        'data-dynamic': true,
      },
      ogTitle: {
        property: 'og:title',
        content: pattern.title,
        'data-dynamic': true,
      },
      ogDescription: {
        property: 'og:description',
        content: title,
        'data-dynamic': true,
      },
      ogImage: {
        property: 'og:image',
        content:
          'https://raw.githubusercontent.com/techmania-team/techmania-team.github.io/master/public/assets/Logo_black.png',
        'data-dynamic': true,
      },
      twCard: {
        name: 'twitter:card',
        content: 'summary_large_image',
        'data-dynamic': true,
      },
      twUrl: {
        name: 'twitter:url',
        content: new URL(route.fullPath, process.env.HOST_URL).toString(),
        'data-dynamic': true,
      },
      twTitle: {
        name: 'twitter:title',
        content: title,
        'data-dynamic': true,
      },
      twDescription: {
        name: 'twitter:description',
        content: title,
        'data-dynamic': true,
      },
      twImage: {
        name: 'twitter:image',
        content:
          'https://raw.githubusercontent.com/techmania-team/techmania-team.github.io/master/public/assets/Logo_black.png',
        'data-dynamic': true,
      },
    },
  }
}
useMeta(metaData)

const tosURL = 'https://github.com/techmania-team/techmania-team.github.io/blob/master/ToS.md'
const toolbar = [
  ['bold', 'italic', 'strike', 'underline', 'subscript', 'superscript'],
  ['hr', 'link'],
  ['undo', 'redo'],
  ['unordered', 'ordered'],
  ['viewsource'],
]
const lanesOptions = [
  { label: '2L', value: 2 },
  { label: '3L', value: 3 },
  { label: '4L', value: 4 },
]
const controlTypes = computed(() => [
  { label: t('pattern.' + controls[0]), value: 0 },
  { label: t('pattern.' + controls[1]), value: 1 },
  { label: t('pattern.' + controls[2]), value: 2 },
])

// Template refs
const form = useTemplateRef('form')

// Form validation schema
const schema = yup.object({
  name: yup.string().required(),
  composer: yup.string().required(),
  link: yup.string().url().required(),
  keysounded: yup.boolean().required(),
  image: yup.string().url(),
  previews: yup.array().of(
    yup.object().shape({
      name: yup.string().required(),
      link: yup
        .string()
        .required()
        .url()
        .test('youtube', t('submitForm.invalidLink'), getIDFromYouTubeLink),
    }),
  ),
  difficulties: yup.array().of(
    yup.object().shape({
      name: yup.string().required(),
      level: yup.number().required().min(1),
      control: yup.number().required().min(0).max(2),
      lanes: yup.number().required().min(2).max(4),
    }),
  ),
  description: yup.string(),
  agree: yup.bool().required().oneOf([true]),
})
// Form initial values
const initialValues = {
  name: '',
  composer: '',
  link: '',
  keysounded: false,
  image: '',
  previews: [{ name: '', link: '' }],
  difficulties: [{ name: '', level: undefined, control: 0, lanes: 4 }],
  description: '',
  agree: false,
}
// On form submit
const onSubmit = async (values) => {
  $q.loading.show()
  try {
    if (route.params.id) {
      // Has pattern ID, update pattern
      const token = await recaptcha.executeRecaptcha('updatePattern')
      await api.patch(`/patterns/${pattern._id}`, {
        name: values.name,
        composer: values.composer,
        link: values.link,
        keysounded: values.keysounded,
        image: values.image,
        previews: values.previews.map((preview) => ({
          name: preview.name,
          ytid: getIDFromYouTubeLink(preview.link),
        })),
        difficulties: values.difficulties,
        description: values.description,
        'g-recaptcha-response': token,
      })
      // Set background image
      backgroundImage.value =
        values.image?.length > 0
          ? values.image
          : values.previews.length > 0
            ? getYouTubeThumbnail(getIDFromYouTubeLink(values.previews[0].link))
            : '/assets/header-pattern.png'
    } else {
      // No pattern ID, create new pattern
      const token = await recaptcha.executeRecaptcha('newPattern')
      const { data } = await api.post(`/patterns`, {
        name: values.name,
        composer: values.composer,
        link: values.link,
        keysounded: values.keysounded,
        image: values.image,
        previews: values.previews.map((preview) => ({
          name: preview.name,
          ytid: getIDFromYouTubeLink(preview.link),
        })),
        difficulties: values.difficulties,
        description: values.description,
        'g-recaptcha-response': token,
      })
      router.push(`/patterns/${data.id}`)
    }
    $q.loading.hide()
    // Notify success
    $q.notify({
      icon: 'check',
      message: t('submitForm.updated'),
      color: 'positive',
      position: 'top',
      timeout: 2000,
    })
  } catch (error) {
    handleError(error)
  }
}

// Delete confirmation dialog state
const deleteDialog = ref(false)
// Is deleting pattern
const deleting = ref(false)
// Open Delete confirmation dialog
const openDeleteDialog = () => {
  deleteDialog.value = true
}
// Delete pattern
const deletePattern = async () => {
  deleting.value = true
  try {
    await api.delete(`/patterns/${pattern._id}`)
    // Notify success
    $q.notify({
      icon: 'check',
      message: t('submitForm.deleted'),
      color: 'positive',
      position: 'top',
      timeout: 2000,
    })
    // Redirect to home
    router.push(`/users/${user._id}/patterns`)
  } catch (error) {
    handleError(error)
  }
  deleting.value = false
  deleteDialog.value = false
}

defineOptions({
  async preFetch({ currentRoute, redirect, ssrContext }) {
    // New pattern form, no need to prefetch data
    if (!currentRoute.params.id) return

    const user = ssrContext.req.session.passport?.user

    const pattern = useTempPatternStore()

    // Prefetch pattern data
    pattern.clearData()
    await pattern.fetchPattern(currentRoute.params.id)

    // Check if pattern exists and user is the submitter
    if (pattern._id.length === 0 || pattern.submitter._id !== user._id) {
      redirect('/404')
    }
  },
})

onMounted(async () => {
  // Get pattern data if editing
  if (route.params.id) {
    // Set initial values for the form
    if (pattern.previews.length == 0) {
      pattern.previews = [{ name: '', link: '' }]
    } else {
      pattern.previews.map((preview) => {
        preview.link = 'https://www.youtube.com/watch?v=' + preview.ytid
        return preview
      })
    }

    // Wait for the form to be ready to get template ref
    await nextTick()

    // Set form values
    form.value.setFieldValue('name', pattern.name)
    form.value.setFieldValue('composer', pattern.composer)
    form.value.setFieldValue('link', pattern.link)
    form.value.setFieldValue('keysounded', pattern.keysounded)
    form.value.setFieldValue('image', pattern.image)
    form.value.setFieldValue('previews', pattern.previews)
    form.value.setFieldValue('difficulties', pattern.difficulties)
    form.value.setFieldValue('description', pattern.description)

    // NOTE:
    // Do not use setValues, it will also validate agree field
    //
    // form.value.setValues({
    //   name: pattern.name,
    //   composer: pattern.composer,
    //   link: pattern.link,
    //   keysounded: pattern.keysounded,
    //   image: pattern.image,
    //   previews: pattern.previews,
    //   difficulties: pattern.difficulties,
    //   description: pattern.description,
    // })
  }

  // Set background image
  backgroundImage.value =
    pattern.image?.length > 0
      ? pattern.image
      : pattern.previews.length > 0
        ? getYouTubeThumbnail(pattern.previews[0].ytid)
        : '/assets/header-pattern.png'
})
</script>
