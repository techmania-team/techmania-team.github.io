<template lang="pug">
q-page#skinForm
  q-no-ssr
    //- Header
    q-parallax.header-parallax(:height="200" :class="{ 'header-blur': backgroundImage != '/assets/header-skin.png' }")
      //- Header image background
      template(#media)
        img(:src="backgroundImage")
      //- Header content
      template(#content)
        .column.items-center.q-mb-md
          .text-h4.text-center {{ skin._id.length === 0 ? $t('skinFormPage.titleNew') : $t('skinFormPage.titleEdit') }}
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
                    p {{ $t('skinFormPage.rules.title') }}
                    ul.q-mb-none
                      li {{ $t('skinFormPage.rules.rule1') }}
                      li {{ $t('skinFormPage.rules.rule2') }}
                      li {{ $t('skinFormPage.rules.rule3') }}
                //- Basic informations
                q-list.q-mb-lg
                  //- List header
                  q-item-label.text-h6.text-tech(header) {{ $t('skinFormPage.basic.title') }}
                  q-separator.q-mb-md(inset)
                  //- Field - Name
                  //- NOTE:
                  //- QItem has a hardcoded no-wrap class
                  //- so we need to wrap it in a div to make it wrap
                  q-item.q-py-lg.q-py-md-md
                    q-item-section
                      .row.justify-center.items-center
                        .col-12.col-md-2.q-mb-md.q-mb-md-none {{ $t('skinFormPage.basic.name.label') }}
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
                  //- Field - Skin type
                  q-item.q-py-lg.q-py-md-md
                    q-item-section
                      .row.justify-center.items-center
                        .col-12.col-md-2.q-mb-md.q-mb-md-none {{ $t('skinFormPage.basic.type.label') }}
                        .col-12.col-md-10
                          template(v-for="(typeOption) in typeOptions" :key="typeOption")
                            //- NOTE:
                            //- DO NOT USE TYPE RADIO EVEN THOUGH IT'S A RADIO BUTTON
                            //- type radio only have name and checked attribute, no current value
                            Field(name="type" v-slot="{ field, errorMessage }" :value="typeOption.value")
                              q-radio(
                                name="type"
                                keep-color color="tech"
                                :model-value="field.value"
                                :val="typeOption.value"
                                @update:model-value="field.onInput($event)"
                                :label="typeOption.label"
                              )
                              template(v-if="!!errorMessage")
                                .text-negative {{ errorMessage }}
                  //- Field - Download link
                  q-item.q-py-lg.q-py-md-md
                    q-item-section
                      .row.justify-center.items-center
                        .col-12.col-md-2.q-mb-md.q-mb-md-none {{ $t('skinFormPage.basic.download.label') }}
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
                  //- Field - Image link
                  q-item.q-py-lg.q-py-md-md
                    q-item-section
                      .row.justify-center.items-center
                        .col-12.col-md-2.q-mb-md.q-mb-md-none {{ $t('skinFormPage.basic.image.label') }}
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
                  q-item-label.text-h6.text-tech(header) {{ $t('skinFormPage.preview.title')}}
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
                                          :placeholder="$t('skinFormPage.preview.name.label')"
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
                                          :placeholder="$t('skinFormPage.preview.link.label')"
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
                //- Description
                q-list.q-my-lg
                  q-item-label.text-h6.text-tech(header) {{ $t('skinFormPage.description.title') }}
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
                q-list.q-my-lg(v-if="skin._id.length > 0")
                  //- List header
                  q-item-label.text-h6.text-red(header) {{ $t('skinFormPage.dangerZone.title') }}
                  q-separator.q-mb-md(inset)
                  q-item
                    q-item-section
                      .row.justify-center.items-center
                        .col-12.col-md-2.q-mb-md.q-mb-md-none {{ $t('skinFormPage.dangerZone.delete.label') }}
                        .col-12.col-md-10
                          q-btn(outline color="red" @click="openDeleteDialog") {{ $t('skinFormPage.dangerZone.delete.button') }}
                //- Terms of Service
                .q-mt-xl.q-mx-auto.text-center
                  Field(name="agree" v-slot="{ field, errorMessage }")
                    q-checkbox(
                      keep-color color="tech"
                      :model-value="field.value"
                      @update:model-value="field.onChange($event)"
                    )
                    i18n-t(keypath="skinFormPage.tos.label" tag="span")
                      template(#tos)
                        a(:href="tosURL" target="_blank") {{ $t('skinFormPage.tos.tos') }}
                    template(v-if="!!errorMessage")
                      .text-negative {{ errorMessage }}
                  br
                  //- Submit button
                  q-btn.q-my-md(:label="pattern._id.length === 0 ? $t('skinFormPage.submit.new') : $t('skinFormPage.submit.edit')" color="tech" text-color="black" type="submit" style="width: 150px")
    //- Delete confirmation dialog
    q-dialog(v-model="deleteDialog" persistent)
      q-card(rounded)
        //- Dialog header
        q-card-section.text-center
          q-icon(name="warning" color="red" size="100px")
          .text-h6 {{ $t('skinFormPage.deleteDialog.text') }}
        q-separator
        //- Dialog actions
        q-card-actions(align="around")
          //- Confirm
          q-btn(color="green" flat :label="$t('skinFormPage.deleteDialog.yes')" @click="deleteSkin" :loading="deleting")
          //- Cancel
          q-btn(color="red" flat :label="$t('skinFormPage.deleteDialog.no')" v-close-popup)
</template>

<script setup>
import { ref, computed, onMounted, useTemplateRef, nextTick } from 'vue'
import { useMeta, useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Form, Field, FieldArray } from 'vee-validate'
import * as yup from 'yup'
import validator from 'validator'
import { useReCaptcha } from 'vue-recaptcha-v3'
import { getIDFromYouTubeLink, getYouTubeThumbnail } from 'src/utils/youtube'
import { useUserStore } from 'src/stores/user'
import { useTempSkinStore } from 'src/stores/temp-skin'
import { types, SKIN_NOTE, SKIN_VFX, SKIN_COMBO, SKIN_GAMEUI, SKIN_THEME } from 'src/utils/skin'
import api from 'src/utils/api'
import handleError from 'src/utils/handleError'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const user = useUserStore()
const skin = useTempSkinStore()
const { t } = useI18n()
const recaptcha = useReCaptcha()

const backgroundImage = ref('')

const metaData = () => {
  const title = user.isLogin
    ? 'TECHMANIA | ' + (skin._id.length > 0 ? 'Edit Skin' : 'New Skin')
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
        content: skin.title,
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

const typeOptions = computed(() => {
  return types.map((type) => {
    return { label: t('skinFormPage.basic.type.' + type), value: types.indexOf(type) }
  })
})

// Template refs
const form = useTemplateRef('form')

// Form validation schema
const schema = yup.object({
  name: yup.string().required(() => t('skinFormPage.basic.name.error.required')),
  link: yup
    .string()
    .url(() => t('skinFormPage.basic.download.error.invalid'))
    .required(() => t('skinFormPage.basic.download.error.required')),
  image: yup.string().url(() => t('skinFormPage.basic.image.error.invalid')),
  previews: yup.array().of(
    yup.object().shape({
      name: yup.string().required(() => t('skinFormPage.preview.name.error.required')),
      link: yup
        .string()
        .required(() => t('skinFormPage.preview.link.error.required'))
        .url(() => t('skinFormPage.preview.link.error.invalid'))
        .test('youtube', t('skinFormPage.preview.link.error.youtube'), getIDFromYouTubeLink),
    }),
  ),
  type: yup
    .number()
    .required(() => t('skinFormPage.basic.type.error.required'))
    .oneOf([SKIN_NOTE, SKIN_VFX, SKIN_COMBO, SKIN_GAMEUI, SKIN_THEME], () =>
      t('skinFormPage.basic.type.error.invalid'),
    ),
  description: yup.string(),
  agree: yup
    .bool()
    .required(() => t('skinFormPage.tos.error.required'))
    .oneOf([true], () => t('skinFormPage.tos.error.required')),
})
// Form initial values
const initialValues = {
  name: '',
  link: '',
  image: '',
  previews: [{ name: '', link: '' }],
  type: SKIN_NOTE,
  description: '',
  agree: false,
}
// On form submit
const onSubmit = async (values) => {
  $q.loading.show()
  try {
    if (route.params.id) {
      // Has skin ID, update skin
      const token = await recaptcha.executeRecaptcha('updateSkin')
      await api.patch(`/skins/${skin._id}`, {
        name: values.name,
        link: values.link,
        image: values.image,
        previews: values.previews.map((preview) => ({
          name: preview.name,
          ytid: getIDFromYouTubeLink(preview.link),
        })),
        type: values.type,
        description: values.description,
        'g-recaptcha-response': token,
      })
      // Set background image
      backgroundImage.value =
        values.image?.length > 0
          ? values.image
          : values.previews.length > 0
            ? getYouTubeThumbnail(getIDFromYouTubeLink(values.previews[0].link))
            : '/assets/header-skin.png'
    } else {
      // No skin ID, create new skin
      const token = await recaptcha.executeRecaptcha('newSkin')
      const { data } = await api.post(`/skins`, {
        name: values.name,
        link: values.link,
        image: values.image,
        previews: values.previews.map((preview) => ({
          name: preview.name,
          ytid: getIDFromYouTubeLink(preview.link),
        })),
        type: values.type,
        description: values.description,
        'g-recaptcha-response': token,
      })
      router.push(`/skins/${data.id}`)
    }
    // Notify success
    $q.notify({
      icon: 'check',
      message: t('skinFormPage.result.updated'),
      color: 'positive',
      position: 'top',
      timeout: 2000,
    })
  } catch (error) {
    handleError(error)
  }
  $q.loading.hide()
}

// Delete confirmation dialog state
const deleteDialog = ref(false)
// Is deleting skin
const deleting = ref(false)
// Open Delete confirmation dialog
const openDeleteDialog = () => {
  deleteDialog.value = true
}
// Delete skin
const deleteSkin = async () => {
  deleting.value = true
  try {
    await api.delete(`/skins/${skin._id}`)
    // Notify success
    $q.notify({
      icon: 'check',
      message: t('skinFormPage.result.deleted'),
      color: 'positive',
      position: 'top',
      timeout: 2000,
    })
    // Redirect to home
    router.push(`/users/${user._id}/skins`)
  } catch (error) {
    handleError(error)
  }
  deleting.value = false
  deleteDialog.value = false
}

defineOptions({
  async preFetch({ currentRoute, redirect, ssrContext }) {
    const skin = useTempSkinStore()
    const user = useUserStore()

    // Clear store
    skin.clearData()

    // New skin form, no need to prefetch data
    if (!currentRoute.params.id) return

    // Check if ID is valid, redirect to 404 if not
    if (currentRoute.params.id && !validator.isMongoId(currentRoute.params.id)) {
      redirect('/404')
    }

    // Note:
    // ssrContext is only available on server side
    // We need to check if it's available before using it
    // router change --> client side --> ssrContext is undefined
    // direct access or refresh page --> server side --> ssrContext is available
    const userId = ssrContext ? ssrContext.req.session.passport?.user?._id || false : user._id

    // Prefetch skin data
    await skin.fetchSkin(currentRoute.params.id)

    // Check if skin exists and user is the submitter
    if (skin._id.length === 0 || skin.submitter._id !== userId) {
      redirect('/404')
    }
  },
})

onMounted(async () => {
  // Get skin data if editing
  if (route.params.id) {
    // Set initial values for the form
    if (skin.previews.length == 0) {
      skin.previews = [{ name: '', link: '' }]
    } else {
      skin.previews.map((preview) => {
        preview.link = 'https://www.youtube.com/watch?v=' + preview.ytid
        return preview
      })
    }

    // Wait for the form to be ready to get template ref
    await nextTick()

    // Set form values
    form.value.setFieldValue('name', skin.name)
    form.value.setFieldValue('link', skin.link)
    form.value.setFieldValue('image', skin.image)
    form.value.setFieldValue('previews', skin.previews)
    form.value.setFieldValue('type', skin.type)
    form.value.setFieldValue('description', skin.description)

    // NOTE:
    // Do not use setValues, it will also validate agree field
    //
    // form.value.setValues({
    //   name: skin.name,
    //   link: skin.link,
    //   image: skin.image,
    //   previews: skin.previews,
    //   type: skin.type,
    //   difficulties: skin.difficulties,
    //   description: skin.description,
    // })
  }

  // Set background image
  backgroundImage.value =
    skin.image?.length > 0
      ? skin.image
      : skin.previews.length > 0
        ? getYouTubeThumbnail(skin.previews[0].ytid)
        : '/assets/header-skin.png'
})
</script>
