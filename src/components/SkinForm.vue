<template lang="pug">
//- Content
section.q-mx-auto.padding
  .container
    .row
      .col-12
        //- Form
        q-form(@submit.prevent="onSubmit")
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
                    q-input.q-pb-none(
                      outlined square color="tech" hide-bottom-space
                      v-model="nameField"
                      :error-message="form.errors.value.name"
                      :error="!!form.errors.value.name"
                    )
            //- Field - Skin type
            q-item.q-py-lg.q-py-md-md
              q-item-section
                .row.justify-center.items-center
                  .col-12.col-md-2.q-mb-md.q-mb-md-none {{ $t('skinFormPage.basic.type.label') }}
                  .col-12.col-md-10
                    template(v-for="(typeOption) in typeOptions" :key="typeOption.value")
                      q-radio(
                        name="type"
                        keep-color color="tech"
                        v-model="typeField"
                        :val="typeOption.value"
                        :label="typeOption.label"
                      )
                    template(v-if="!!form.errors.value.type")
                      .text-negative {{ form.errors.value.type }}
            //- Field - Download link
            q-item.q-py-lg.q-py-md-md
              q-item-section
                .row.justify-center.items-center
                  .col-12.col-md-2.q-mb-md.q-mb-md-none {{ $t('skinFormPage.basic.download.label') }}
                  .col-12.col-md-10
                    q-input.q-pb-none(
                      outlined square color="tech" type="url" hide-bottom-space
                      v-model="linkField"
                      :error-message="form.errors.value.link"
                      :error="!!form.errors.value.link"
                    )
            //- Field - Image link
            q-item.q-py-lg.q-py-md-md
              q-item-section
                .row.justify-center.items-center
                  .col-12.col-md-2.q-mb-md.q-mb-md-none {{ $t('skinFormPage.basic.image.label') }}
                  .col-12.col-md-10
                    q-input.q-pb-none(
                      outlined square color="tech" hide-bottom-space
                      v-model="imageField"
                      :error-message="form.errors.value.image"
                      :error="!!form.errors.value.image"
                    )
          //- Previews
          q-list.q-my-lg
            q-item-label.text-h6.text-tech(header) {{ $t('skinFormPage.preview.title')}}
            q-separator.q-mb-md(inset)
            q-item
              q-item-section
                .row.items-start.justify-between.q-col-gutter-y-xl
                  template(v-for="(field, idx) in previewsField.fields.value" :key="field.key")
                    .col-12
                      .row
                        .col-10.col-md-11
                          .row.q-col-gutter-x-md.q-col-gutter-y-lg
                            //- Name
                            .col-12.col-md-3
                              q-input.q-pb-none(
                                outlined square color="tech" hide-bottom-space
                                v-model="getPreviewName(idx)[0].value"
                                :error-message="form.errors.value[`previews[${idx}].name`]"
                                :error="!!form.errors.value[`previews[${idx}].name`]"
                                :placeholder="$t('skinFormPage.preview.name.label')"
                              )
                            //- Link
                            .col-12.col-md-9
                              q-input.q-pb-none(
                                outlined square color="tech" type="url" hide-bottom-space
                                v-model="getPreviewLink(idx)[0].value"
                                :error-message="form.errors.value[`previews[${idx}].link`]"
                                :error="!!form.errors.value[`previews[${idx}].link`]"
                                :placeholder="$t('skinFormPage.preview.link.label')"
                              )
                        //- Action buttons
                        .col-2.col-md-1.text-center.self-center.q-py-none
                          q-btn(
                            flat round icon="delete" color="tech"
                            v-if="idx !== 0"
                            @click="previewsField.remove(idx)"
                          )
                          q-btn(
                            flat round icon="add" color="tech"
                            v-else
                            @click="previewsField.push({ name: '', link: '' })"
                          )
          //- Description
          q-list.q-my-lg
            q-item-label.text-h6.text-tech(header) {{ $t('skinFormPage.description.title') }}
            q-separator.q-mb-md(inset)
            q-item
              q-item-section
                q-editor(
                  outlined
                  v-model="descriptionField"
                  :toolbar="toolbar"
                  toolbar-toggle-color="tech"
                )
          //- Field - Danger Zone
          q-list.q-my-lg(v-if="isEdit")
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
            q-checkbox(
              keep-color color="tech"
              v-model="agreeField"
            )
            i18n-t(keypath="skinFormPage.tos.label" tag="span")
              template(#tos)
                a(:href="tosURL" target="_blank") {{ $t('skinFormPage.tos.tos') }}
            template(v-if="!!form.errors.value.agree")
              .text-negative {{ form.errors.value.agree }}
            br
            //- Submit button
            q-btn.q-my-md(:label="isEdit ? $t('skinFormPage.submit.edit') : $t('skinFormPage.submit.new')" color="tech" text-color="black" type="submit" style="width: 150px")
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

<script setup lang="ts">
import type { ISkin } from '@/types/skin'
import { AxiosError } from 'axios'
import { useQuasar } from 'quasar'
import { useFieldArray, useForm } from 'vee-validate'
import { computed, nextTick, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useReCaptcha } from 'vue-recaptcha-v3'
import { useRouter } from 'vue-router'
import * as yup from 'yup'
import { getI18nRoute } from '@/i18n'
import * as skinService from '@/services/skin'
import { useUserStore } from '@/stores/user'
import { handleError, handleFormSubmitError } from '@/utils/handleError'
import { SKINTYPE, SKINTYPES } from '@/utils/skin'
import { getIDFromYouTubeLink } from '@/utils/youtube'

const props = defineProps<{
  skin?: ISkin
}>()
const isEdit = computed(() => Boolean(props.skin?._id))

const $q = useQuasar()
const router = useRouter()
const user = useUserStore()
const { t } = useI18n()
const recaptcha = useReCaptcha()

const tosURL = 'https://github.com/techmania-team/techmania-team.github.io/blob/master/ToS.md'
const toolbar = [
  ['bold', 'italic', 'strike', 'underline', 'subscript', 'superscript'],
  ['hr', 'link'],
  ['undo', 'redo'],
  ['unordered', 'ordered'],
  ['viewsource'],
]

const typeOptions = computed(() => {
  return SKINTYPES.map((type) => {
    return { label: t('skinFormPage.basic.type.' + type), value: SKINTYPES.indexOf(type) }
  })
})

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
        .test('youtube', t('skinFormPage.preview.link.error.youtube'), (value: string) =>
          Boolean(getIDFromYouTubeLink(value)),
        ),
    }),
  ),
  type: yup
    .number()
    .typeError(() => t('skinFormPage.basic.type.error.required'))
    .required(() => t('skinFormPage.basic.type.error.required'))
    .oneOf([SKINTYPE.NOTE, SKINTYPE.VFX, SKINTYPE.COMBO, SKINTYPE.GAMEUI, SKINTYPE.THEME], () =>
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
  type: SKINTYPE.NOTE,
  description: '',
  agree: false,
}

const form = useForm({
  validationSchema: schema,
  initialValues,
})
const [nameField] = form.defineField('name')
const [linkField] = form.defineField('link')
const [imageField] = form.defineField('image')
const [typeField] = form.defineField('type')
const [descriptionField] = form.defineField('description')
const [agreeField] = form.defineField('agree')

const previewsField = useFieldArray('previews')
const getPreviewName = (i: number) => form.defineField(`previews[${i}].name`)
const getPreviewLink = (i: number) => form.defineField(`previews[${i}].link`)

// On form submit
const onSubmit = form.handleSubmit(async (values) => {
  $q.loading.show()
  try {
    if (isEdit.value) {
      // Has skin ID, update skin
      const token = await recaptcha?.executeRecaptcha('updateSkin')

      await skinService.update(props.skin!._id, {
        name: values.name,
        link: values.link,
        image: values.image,
        previews: values.previews.map((preview) => ({
          name: preview.name,
          ytid: getIDFromYouTubeLink(preview.link),
        })),
        type: values.type,
        description: values.description,
        'g-recaptcha-response': token!,
      })
      $q.notify({
        icon: 'check',
        message: t('skinFormPage.result.updated'),
        color: 'positive',
        position: 'top',
        timeout: 2000,
      })
    } else {
      // No skin ID, create new skin
      const token = await recaptcha?.executeRecaptcha('newSkin')
      const { data } = await skinService.create({
        name: values.name,
        link: values.link,
        image: values.image,
        previews: values.previews.map((preview) => ({
          name: preview.name,
          ytid: getIDFromYouTubeLink(preview.link),
        })),
        type: values.type,
        description: values.description,
        'g-recaptcha-response': token!,
      })
      $q.notify({
        icon: 'check',
        message: t('skinFormPage.result.submitted'),
        color: 'positive',
        position: 'top',
        timeout: 2000,
      })
      await router.push(getI18nRoute({ name: 'skin', params: { id: data.result } }))
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      if (isEdit.value) {
        // Editing skin
        await handleFormSubmitError(error, 'skinFormPage', 'update')
      } else {
        // Creating new skin
        await handleFormSubmitError(error, 'skinFormPage', 'create')
      }
    } else {
      handleError(error)
    }
  }
  $q.loading.hide()
})

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
    await skinService.del(props.skin!._id)
    // Notify success
    $q.notify({
      icon: 'check',
      message: t('skinFormPage.result.deleted'),
      color: 'positive',
      position: 'top',
      timeout: 2000,
    })
    // Redirect to home
    await router.push(getI18nRoute({ name: 'profile-skins', params: { id: user._id } }))
  } catch (error) {
    if (error instanceof AxiosError) {
      await handleFormSubmitError(error, 'skinFormPage', 'delete')
    } else {
      handleError(error)
    }
  }
  deleting.value = false
  deleteDialog.value = false
}

onMounted(async () => {
  // Get skin data if editing
  if (isEdit.value) {
    const previews =
      props.skin!.previews.length === 0
        ? [{ name: '', link: '' }]
        : props.skin!.previews.map((preview) => ({
            name: preview.name,
            link: preview.ytid ? `https://www.youtube.com/watch?v=${preview.ytid}` : '',
          }))

    // Wait for the form to be ready to get template ref
    await nextTick()

    // Set form values
    form.setFieldValue('name', props.skin!.name)
    form.setFieldValue('link', props.skin!.link)
    form.setFieldValue('image', props.skin!.image)
    form.setFieldValue('previews', previews)
    form.setFieldValue('type', props.skin!.type)
    form.setFieldValue('description', props.skin!.description)
  }
})
</script>
