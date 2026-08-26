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
              p {{ $t('patternFormPage.rules.title') }}
              ul.q-mb-none
                li {{ $t('patternFormPage.rules.rule1') }}
                li {{ $t('patternFormPage.rules.rule2') }}
                li {{ $t('patternFormPage.rules.rule3') }}
          //- Basic informations
          q-list.q-mb-lg
            //- List header
            q-item-label.text-h6.text-tech(header) {{ $t('patternFormPage.basic.title') }}
            q-separator.q-mb-md(inset)
            //- Field - Song name
            //- NOTE:
            //- QItem has a hardcoded no-wrap class
            //- so we need to wrap it in a div to make it wrap
            q-item.q-py-lg.q-py-md-md
              q-item-section
                .row.justify-center.items-center
                  .col-12.col-md-2.q-mb-md.q-mb-md-none {{ $t('patternFormPage.basic.name.label') }}
                  .col-12.col-md-10
                    q-input.q-pb-none(
                      outlined square color="tech" hide-bottom-space
                      v-model="nameField"
                      :error-message="form.errors.value.name"
                      :error="!!form.errors.value.name"
                    )
            //- Field - Composer
            q-item.q-py-lg.q-py-md-md
              q-item-section
                .row.justify-center.items-center
                  .col-12.col-md-2.q-mb-md.q-mb-md-none {{ $t('patternFormPage.basic.composer.label') }}
                  .col-12.col-md-10
                    q-input.q-pb-none(
                      outlined square color="tech" hide-bottom-space
                      v-model="composerField"
                      :error-message="form.errors.value.composer"
                      :error="!!form.errors.value.composer"
                    )
            //- Field - Download link
            q-item.q-py-lg.q-py-md-md
              q-item-section
                .row.justify-center.items-center
                  .col-12.col-md-2.q-mb-md.q-mb-md-none {{ $t('patternFormPage.basic.download.label') }}
                  .col-12.col-md-10
                    q-input.q-pb-none(
                      outlined square color="tech" type="url" hide-bottom-space
                      v-model="linkField"
                      :error-message="form.errors.value.link"
                      :error="!!form.errors.value.link"
                    )
            //- Field - Keysounded
            q-item.q-py-lg.q-py-md-md
              q-item-section
                .row.justify-center.items-center
                  .col-2 {{ $t('patternFormPage.basic.keysounded.label') }}
                  .col-10
                    q-field.q-pb-none(
                      borderless color="white" hide-bottom-space
                      :error-message="form.errors.value.keysounded"
                      :error="!!form.errors.value.keysounded"
                    )
                      q-checkbox(
                        keep-color color="tech"
                        :true-value="true" :false-value="false"
                        v-model="keysoundedField"
                      )
            //- Field - Image link
            q-item.q-py-lg.q-py-md-md
              q-item-section
                .row.justify-center.items-center
                  .col-12.col-md-2.q-mb-md.q-mb-md-none {{ $t('patternFormPage.basic.image.label') }}
                  .col-12.col-md-10
                      q-input.q-pb-none(
                        outlined square color="tech" type="url" hide-bottom-space
                        v-model="imageField"
                        :error-message="form.errors.value.image"
                        :error="!!form.errors.value.image"
                      )
          //- Previews
          q-list.q-my-lg
            q-item-label.text-h6.text-tech(header) {{ $t('patternFormPage.preview.title')}}
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
                                :placeholder="$t('patternFormPage.preview.name.label')"
                              )
                            //- Link
                            .col-12.col-md-9
                              q-input.q-pb-none(
                                outlined square color="tech" type="url" hide-bottom-space
                                v-model="getPreviewLink(idx)[0].value"
                                :error-message="form.errors.value[`previews[${idx}].link`]"
                                :error="!!form.errors.value[`previews[${idx}].link`]"
                                :placeholder="$t('patternFormPage.preview.link.label')"
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
          //- Difficulties
          q-list.q-my-lg
            q-item-label.text-h6.text-tech(header) {{ $t('patternFormPage.difficulties.title') }}
            q-separator.q-mb-md(inset)
            q-item
              q-item-section
                .row.items-start.justify-between.q-col-gutter-y-xl
                  template(v-for="(field, idx) in difficultiesField.fields.value" :key="field.key")
                    .col-12
                      .row
                        .col-10.col-md-11
                          .row.q-col-gutter-x-md.q-col-gutter-y-md
                            //- Control
                            .col-6.col-md-2
                              q-select.q-pb-none(
                                outlined square color="tech" hide-bottom-space
                                v-model="getDiffControl(idx)[0].value"
                                :error-message="form.errors.value[`difficulties[${idx}].control`]"
                                :error="!!form.errors.value[`difficulties[${idx}].control`]"
                                :options="controlTypes" :placeholder="$t('patternFormPage.difficulties.control.label')"
                                emit-value map-options
                              )
                            //- Lanes
                            .col-6.col-md-2
                              q-select.q-pb-none(
                                outlined square color="tech" hide-bottom-space
                                v-model="getDiffLanes(idx)[0].value"
                                :error-message="form.errors.value[`difficulties[${idx}].lanes`]"
                                :error="!!form.errors.value[`difficulties[${idx}].lanes`]"
                                :options="lanesOptions" :placeholder="$t('patternFormPage.difficulties.lanes.label')"
                                emit-value map-options
                              )
                            //- Name
                            .col-6.col-md-6
                              q-input.q-pb-none(
                                outlined square color="tech" hide-bottom-space
                                v-model="getDiffName(idx)[0].value"
                                :error-message="form.errors.value[`difficulties[${idx}].name`]"
                                :error="!!form.errors.value[`difficulties[${idx}].name`]"
                                :placeholder="$t('patternFormPage.difficulties.name.label')"
                              )
                            //- Level
                            .col-6.col-md-2
                              q-input.q-pb-none(
                                outlined square color="tech" type="number" hide-bottom-space
                                v-model="getDiffLevel(idx)[0].value"
                                :error-message="form.errors.value[`difficulties[${idx}].level`]"
                                :error="!!form.errors.value[`difficulties[${idx}].level`]"
                                :placeholder="$t('patternFormPage.difficulties.level.label')"
                                min="1"
                              )
                        //- Action buttons
                        .col-2.col-md-1.text-center.self-center.q-py-none
                          q-btn(
                            flat round icon="delete" color="tech"
                            v-if="idx !== 0"
                            @click="difficultiesField.remove(idx)"
                          )
                          q-btn(
                            flat round icon="add" color="tech"
                            v-else
                            @click="difficultiesField.push({ name: '', level: undefined, control: 0, lanes: 4 })"
                          )
          //- Description
          q-list.q-my-lg
            q-item-label.text-h6.text-tech(header) {{ $t('patternFormPage.description.title') }}
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
            q-item-label.text-h6.text-red(header) {{ $t('patternFormPage.dangerZone.title') }}
            q-separator.q-mb-md(inset)
            q-item
              q-item-section
                .row.justify-center.items-center
                  .col-12.col-md-2.q-mb-md.q-mb-md-none {{ $t('patternFormPage.dangerZone.delete.label') }}
                  .col-12.col-md-10
                    q-btn(outline color="red" @click="openDeleteDialog") {{ $t('patternFormPage.dangerZone.delete.button') }}
          //- Terms of Service
          .q-mt-xl.q-mx-auto.text-center
            q-checkbox(
              keep-color color="tech"
              v-model="agreeField"
            )
            i18n-t(keypath="patternFormPage.tos.label" tag="span")
              template(#tos)
                a(:href="tosURL" target="_blank") {{ $t('patternFormPage.tos.tos') }}
            template(v-if="!!form.errors.value.agree")
              .text-negative {{ form.errors.value.agree }}
            br
            //- Submit button
            q-btn.q-my-md(:label="isEdit ? $t('patternFormPage.submit.edit') : $t('patternFormPage.submit.new')" color="tech" text-color="black" type="submit" style="width: 150px")
//- Delete confirmation dialog
q-dialog(v-model="deleteDialog" persistent)
  q-card(rounded)
    //- Dialog header
    q-card-section.text-center
      q-icon(name="warning" color="red" size="100px")
      .text-h6 {{ $t('patternFormPage.deleteDialog.text') }}
    q-separator
    //- Dialog actions
    q-card-actions(align="around")
      //- Confirm
      q-btn(color="green" flat :label="$t('patternFormPage.deleteDialog.yes')" @click="deletePattern" :loading="deleting")
      //- Cancel
      q-btn(color="red" flat :label="$t('patternFormPage.deleteDialog.no')" v-close-popup)
</template>

<script setup lang="ts">
import type { IPattern, IPatternDifficulty } from '@/types/pattern'
import { AxiosError } from 'axios'
import { useQuasar } from 'quasar'
import { useFieldArray, useForm } from 'vee-validate'
import { computed, nextTick, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useReCaptcha } from 'vue-recaptcha-v3'
import { useRouter } from 'vue-router'
import * as yup from 'yup'
import { getI18nRoute } from '@/i18n'
import * as patternService from '@/services/pattern'
import { useUserStore } from '@/stores/user'
import { controls } from '@/utils/control'
import { CONTROLTYPE } from '@/utils/control'
import { handleError, handleFormSubmitError } from '@/utils/handleError'
import { getIDFromYouTubeLink } from '@/utils/youtube'

const props = defineProps<{
  pattern?: IPattern
}>()
const isEdit = computed(() => Boolean(props.pattern?._id))

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
const lanesOptions = [
  { label: '2L', value: 2 },
  { label: '3L', value: 3 },
  { label: '4L', value: 4 },
]
const controlTypes = computed(() => [
  {
    label: t('patternFormPage.difficulties.control.' + controls[CONTROLTYPE.TOUCH]),
    value: CONTROLTYPE.TOUCH,
  },
  {
    label: t('patternFormPage.difficulties.control.' + controls[CONTROLTYPE.KEYS]),
    value: CONTROLTYPE.KEYS,
  },
  {
    label: t('patternFormPage.difficulties.control.' + controls[CONTROLTYPE.KM]),
    value: CONTROLTYPE.KM,
  },
])

// Form validation schema
const schema = yup.object({
  name: yup.string().required(() => t('patternFormPage.basic.name.error.required')),
  composer: yup.string().required(() => t('patternFormPage.basic.composer.error.required')),
  link: yup
    .string()
    .url(() => t('patternFormPage.basic.download.error.invalid'))
    .required(() => t('patternFormPage.basic.download.error.required')),
  keysounded: yup.boolean().required(() => t('patternFormPage.basic.keysounded.error.required')),
  image: yup.string().url(() => t('patternFormPage.basic.image.error.invalid')),
  previews: yup.array().of(
    yup.object().shape({
      name: yup.string().required(() => t('patternFormPage.preview.name.error.required')),
      link: yup
        .string()
        .required(() => t('patternFormPage.preview.link.error.required'))
        .url(() => t('patternFormPage.preview.link.error.invalid'))
        .test('youtube', t('patternFormPage.preview.link.error.youtube'), (value: string) =>
          Boolean(getIDFromYouTubeLink(value)),
        ),
    }),
  ),
  difficulties: yup.array().of(
    yup.object().shape({
      name: yup.string().required(() => t('patternFormPage.difficulties.name.error.required')),
      level: yup
        .number()
        .typeError(t('patternFormPage.difficulties.level.error.required'))
        .required(() => t('patternFormPage.difficulties.level.error.required'))
        .min(1, () => t('patternFormPage.difficulties.level.error.min')),
      control: yup
        .number()
        .typeError(() => t('patternFormPage.difficulties.control.error.required'))
        .required(() => t('patternFormPage.difficulties.control.error.required'))
        .oneOf([CONTROLTYPE.TOUCH, CONTROLTYPE.KEYS, CONTROLTYPE.KM], () =>
          t('patternFormPage.difficulties.control.error.invalid'),
        ),
      lanes: yup
        .number<2 | 3 | 4>()
        .typeError(() => t('patternFormPage.difficulties.level.error.required'))
        .required(() => t('patternFormPage.difficulties.lanes.error.required'))
        .min(2, () => t('patternFormPage.difficulties.lanes.error.min'))
        .max(4, () => t('patternFormPage.difficulties.lanes.error.max')),
    }),
  ),
  description: yup.string(),
  agree: yup
    .bool()
    .required(() => t('patternFormPage.tos.error.required'))
    .oneOf([true], () => t('patternFormPage.tos.error.required')),
})
// Form initial values
const initialValues = {
  name: '',
  composer: '',
  link: '',
  keysounded: false,
  image: '',
  previews: [{ name: '', link: '' }],
  difficulties: [{ name: '', level: 0, control: 0, lanes: 4 }],
  description: '',
  agree: false,
}
const form = useForm({
  validationSchema: schema,
  initialValues,
})
const [nameField] = form.defineField('name')
const [composerField] = form.defineField('composer')
const [linkField] = form.defineField('link')
const [keysoundedField] = form.defineField('keysounded')
const [imageField] = form.defineField('image')
const [descriptionField] = form.defineField('description')
const [agreeField] = form.defineField('agree')
const previewsField = useFieldArray('previews')
const difficultiesField = useFieldArray('difficulties')

const getPreviewName = (i: number) => form.defineField(`previews[${i}].name`)
const getPreviewLink = (i: number) => form.defineField(`previews[${i}].link`)

const getDiffName = (i: number) => form.defineField(`difficulties[${i}].name`)
const getDiffLevel = (i: number) => form.defineField(`difficulties[${i}].level`)
const getDiffControl = (i: number) => form.defineField(`difficulties[${i}].control`)
const getDiffLanes = (i: number) => form.defineField(`difficulties[${i}].lanes`)

// On form submit
const onSubmit = form.handleSubmit(async (values) => {
  $q.loading.show()
  try {
    if (isEdit.value) {
      // Has pattern ID, update pattern
      const token = await recaptcha?.executeRecaptcha('updatePattern')
      await patternService.update(props.pattern!._id, {
        name: values.name,
        composer: values.composer,
        link: values.link,
        keysounded: values.keysounded,
        image: values.image,
        previews: values.previews.map((preview) => ({
          name: preview.name,
          ytid: getIDFromYouTubeLink(preview.link),
        })),
        difficulties: values.difficulties as IPatternDifficulty[],
        description: values.description,
        'g-recaptcha-response': token!,
      })
      $q.notify({
        icon: 'check',
        message: t('patternFormPage.result.updated'),
        color: 'positive',
        position: 'top',
        timeout: 2000,
      })
    } else {
      // No pattern ID, create new pattern
      const token = await recaptcha?.executeRecaptcha('newPattern')
      const { data } = await patternService.create({
        name: values.name,
        composer: values.composer,
        link: values.link,
        keysounded: values.keysounded,
        image: values.image,
        previews: values.previews.map((preview) => ({
          name: preview.name,
          ytid: getIDFromYouTubeLink(preview.link),
        })),
        difficulties: values.difficulties as IPatternDifficulty[],
        description: values.description,
        'g-recaptcha-response': token!,
      })
      $q.notify({
        icon: 'check',
        message: t('patternFormPage.result.submitted'),
        color: 'positive',
        position: 'top',
        timeout: 2000,
      })
      await router.push(getI18nRoute({ name: 'pattern', params: { id: data.result } }))
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      if (isEdit.value) {
        // Editing pattern
        await handleFormSubmitError(error, 'patternFormPage', 'update')
      } else {
        // Creating new pattern
        await handleFormSubmitError(error, 'patternFormPage', 'create')
      }
    } else {
      handleError(error)
    }
  }
  $q.loading.hide()
})

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
    await patternService.del(props.pattern!._id)
    // Notify success
    $q.notify({
      icon: 'check',
      message: t('patternFormPage.result.deleted'),
      color: 'positive',
      position: 'top',
      timeout: 2000,
    })
    // Redirect to home
    await router.push(getI18nRoute({ name: 'profile-patterns', params: { id: user._id } }))
  } catch (error) {
    if (error instanceof AxiosError) {
      await handleFormSubmitError(error, 'patternFormPage', 'delete')
    } else {
      handleError(error)
    }
  }
  deleting.value = false
  deleteDialog.value = false
}

onMounted(async () => {
  // Get pattern data if editing
  if (isEdit.value) {
    const previews =
      props.pattern!.previews.length === 0
        ? [{ name: '', link: '' }]
        : props.pattern!.previews.map((preview) => ({
            name: preview.name,
            link: preview.ytid ? `https://www.youtube.com/watch?v=${preview.ytid}` : '',
          }))

    // Wait for the form to be ready to get template ref
    await nextTick()

    // Set form values
    form.setFieldValue('name', props.pattern!.name)
    form.setFieldValue('composer', props.pattern!.composer)
    form.setFieldValue('link', props.pattern!.link)
    form.setFieldValue('keysounded', props.pattern!.keysounded)
    form.setFieldValue('image', props.pattern!.image)
    form.setFieldValue('previews', previews)
    form.setFieldValue('difficulties', props.pattern!.difficulties)
    form.setFieldValue('description', props.pattern!.description)

    // NOTE:
    // Do not use setValues, it will also validate agree field
    //
    // form.setValues({
    //   name: pattern.name
    //   // ...
    // })
  }
})
</script>
