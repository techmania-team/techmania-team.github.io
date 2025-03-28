<template lang="pug">
//- Content
.q-mx-auto.padding(tag="section")
  .container
    .row
      .col-12
        //- Form
        Form(v-slot="{ handleSubmit }" :validation-schema="schema" :initial-values="initialValues" ref="form" as="")
          q-form(@submit.prevent="handleSubmit($event, onSubmit)")
            //- Rules
            q-card.text-white.bg-red.q-my-lg(rounded)
              q-card-section
                p {{ $t('setlistFormPage.rules.title') }}
                ul.q-mb-none
                  li {{ $t('setlistFormPage.rules.rule1') }}
                  li {{ $t('setlistFormPage.rules.rule2') }}
                  li {{ $t('setlistFormPage.rules.rule3') }}
            //- Basic informations
            q-list.q-mb-lg
              //- List header
              q-item-label.text-h6.text-tech(header) {{ $t('setlistFormPage.basic.title') }}
              q-separator.q-mb-md(inset)
              //- Field - Name
              //- NOTE:
              //- QItem has a hardcoded no-wrap class
              //- so we need to wrap it in a div to make it wrap
              q-item.q-py-lg.q-py-md-md
                q-item-section
                  .row.justify-center.items-center
                    .col-12.col-md-2.q-mb-md.q-mb-md-none {{ $t('setlistFormPage.basic.name.label') }}
                    .col-12.col-md-10
                      Field(name="name" v-slot="{ field, errorMessage }")
                        q-input.q-pb-none(
                          outlined square color="tech"
                          :model-value="field.value"
                          @update:model-value="field.onChange($event);"
                          @blur="field.onBlur($event)"
                          :error-message="errorMessage"
                          :error="!!errorMessage"
                        )
              //- Field - Control Type
              q-item.q-py-lg.q-py-md-md
                q-item-section
                  .row.justify-center.items-center
                    .col-12.col-md-2.q-mb-md.q-mb-md-none {{ $t('setlistFormPage.basic.control.label') }}
                    .col-12.col-md-10
                      template(v-for="(controlOption) in controlOptions" :key="controlOption")
                        //- NOTE:
                        //- DO NOT USE TYPE RADIO EVEN THOUGH IT'S A RADIO BUTTON
                        //- type radio only have name and checked attribute, no current value
                        Field(name="control" v-slot="{ field, errorMessage }" :value="controlOption.value")
                          q-radio(
                            name="control"
                            keep-color color="tech"
                            :model-value="field.value"
                            :val="controlOption.value"
                            @update:model-value="field.onInput($event); clearDifficulties()"
                            :label="controlOption.label"
                          )
                          template(v-if="!!errorMessage")
                            .text-negative {{ errorMessage }}
              //- Field - Download link
              q-item.q-py-lg.q-py-md-md
                q-item-section
                  .row.justify-center.items-center
                    .col-12.col-md-2.q-mb-md.q-mb-md-none {{ $t('setlistFormPage.basic.download.label') }}
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
                    .col-12.col-md-2.q-mb-md.q-mb-md-none {{ $t('setlistFormPage.basic.image.label') }}
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
            //- Selectable Patterns
            q-list.q-my-lg
              q-item-label.text-h6.text-tech(header) {{ $t('setlistFormPage.selectablePatterns.title')}}
              q-separator.q-mb-md(inset)
              q-item
                q-item-section
                  .row.items-start.justify-between.q-col-gutter-y-xl
                    FieldArray(name="selectablePatterns" v-slot="{ fields, push, remove }")
                      template(v-for="(field, idx) in fields" :key="field.key")
                        .col-12
                          .row
                            .col-10.col-md-11
                              .row.q-col-gutter-x-md.q-col-gutter-y-lg
                                //- Pattern
                                .col-12.col-md-8
                                  Field(:name="`selectablePatterns[${idx}].pattern`" v-slot="{ field, errorMessage }")
                                    q-select.q-pb-none(
                                      outlined square color="tech"
                                      :model-value="field.value"
                                      @update:model-value="field.onChange($event)"
                                      @blur="field.onBlur($event)"
                                      :error-message="errorMessage"
                                      :error="!!errorMessage"
                                      :options="patternOptions"
                                      :placeholder="field.value ? '': $t('setlistFormPage.selectablePatterns.name.label')"
                                      option-value="_id"
                                      option-label="name"
                                      emit-value
                                      map-options
                                      use-input
                                      clearable
                                      @filter="filterPatterns"
                                      @clear="form.setFieldValue(`selectablePatterns[${idx}].difficulty`, '')"
                                    )
                                      template(#no-option)
                                        q-item
                                          q-item-section {{ $t('setlistFormPage.selectablePatterns.name.searchNotFound') }}
                                //- Difficulty
                                .col-12.col-md-4
                                  Field(:name="`selectablePatterns[${idx}].difficulty`" v-slot="{ field, errorMessage }")
                                    q-select.q-pb-none(
                                      outlined square color="tech"
                                      :model-value="field.value"
                                      @update:model-value="field.onChange($event)"
                                      @blur="field.onBlur($event)"
                                      :error-message="errorMessage"
                                      :error="!!errorMessage"
                                      :options="difficultyOptions"
                                      :placeholder="field.value ? '' : $t('setlistFormPage.hiddenPatterns.difficulty.label')"
                                      option-value="_id"
                                      option-label="name"
                                      emit-value
                                      map-options
                                      use-input
                                      clearable
                                      @filter="(val, update, abort) => filterDifficulties('selectablePatterns', idx, val, update)"
                                    )
                                      template(#no-option)
                                        q-item
                                          q-item-section {{ $t('setlistFormPage.selectablePatterns.difficulty.searchNotFound') }}
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
                                @click="push({ pattern: '', difficulty: '' })"
                              )
            //- Hidden Patterns
            q-list.q-my-lg
              q-item-label.text-h6.text-tech(header) {{ $t('setlistFormPage.hiddenPatterns.title')}}
              q-separator.q-mb-md(inset)
              q-item
                q-item-section
                  Field(name="hiddenPatterns" v-slot="{ errorMessage }" as="")
                    p.text-negative {{ errorMessage }}
                  .row.items-start.justify-between.q-col-gutter-y-xl
                    FieldArray(name="hiddenPatterns" v-slot="{ fields, push, remove }")
                      template(v-for="(field, idx) in fields" :key="field.key")
                        .col-12
                          .row
                            .col-10.col-md-11
                              .row.q-col-gutter-x-md.q-col-gutter-y-lg
                                //- Pattern
                                .col-12.col-md-8
                                  Field(:name="`hiddenPatterns[${idx}].pattern`" v-slot="{ field, errorMessage }")
                                    q-select.q-pb-none(
                                      outlined square color="tech"
                                      :model-value="field.value"
                                      @update:model-value="field.onChange($event)"
                                      @blur="field.onBlur($event)"
                                      :error-message="errorMessage"
                                      :error="!!errorMessage"
                                      :options="patternOptions"
                                      :placeholder="field.value ? '': $t('setlistFormPage.hiddenPatterns.name.label')"
                                      option-value="_id"
                                      option-label="name"
                                      emit-value
                                      map-options
                                      use-input
                                      clearable
                                      @filter="filterPatterns"
                                      @clear="form.setFieldValue(`hiddenPatterns[${idx}].difficulty`, '')"
                                    )
                                      template(#no-option)
                                        q-item
                                          q-item-section {{ $t('setlistFormPage.hiddenPatterns.name.searchNotFound') }}
                                //- Difficulty
                                .col-12.col-md-4
                                  Field(:name="`hiddenPatterns[${idx}].difficulty`" v-slot="{ field, errorMessage }")
                                    q-select.q-pb-none(
                                      outlined square color="tech"
                                      :model-value="field.value"
                                      @update:model-value="field.onChange($event)"
                                      @blur="field.onBlur($event)"
                                      :error-message="errorMessage"
                                      :error="!!errorMessage"
                                      :options="difficultyOptions"
                                      :placeholder="field.value ? '' : $t('setlistFormPage.hiddenPatterns.difficulty.label')"
                                      option-value="_id"
                                      option-label="name"
                                      emit-value
                                      map-options
                                      use-input
                                      clearable
                                      @filter="(val, update, abort) => filterDifficulties('hiddenPatterns', idx, val, update)"
                                    )
                                      template(#no-option)
                                        q-item
                                          q-item-section {{ $t('setlistFormPage.hiddenPatterns.difficulty.searchNotFound') }}
                                //- Criteria Type
                                .col-4
                                  Field(:name="`hiddenPatterns[${idx}].criteriaType`" v-slot="{ field, errorMessage }")
                                    q-select.q-pb-none(
                                      :disable="idx === fields.length - 1"
                                      outlined square color="tech"
                                      :model-value="field.value"
                                      @update:model-value="field.onChange($event)"
                                      @blur="field.onBlur($event)"
                                      :error-message="errorMessage"
                                      :error="!!errorMessage"
                                      :options="criteriaOptions" :placeholder="$t('setlistFormPage.hiddenPatterns.criteriaType.label')"
                                      emit-value map-options
                                    )
                                //- Criteria Direction
                                .col-4
                                  Field(:name="`hiddenPatterns[${idx}].criteriaDirection`" v-slot="{ field, errorMessage }")
                                    q-select.q-pb-none(
                                      :disable="idx === fields.length - 1"
                                      outlined square color="tech"
                                      :model-value="field.value"
                                      @update:model-value="field.onChange($event)"
                                      @blur="field.onBlur($event)"
                                      :error-message="errorMessage"
                                      :error="!!errorMessage"
                                      :options="criteriaDirectionOptions" :placeholder="$t('setlistFormPage.hiddenPatterns.criteriaDirection.label')"
                                      emit-value map-options
                                    )
                                //- Criteria Value
                                .col-4
                                  Field(:name="`hiddenPatterns[${idx}].criteriaValue`" v-slot="{ field, errorMessage }")
                                    q-input.q-pb-none(
                                      :disable="idx === fields.length - 1"
                                      outlined square color="tech" type="number"
                                      :model-value="field.value"
                                      @update:model-value="field.onChange($event)"
                                      @blur="field.onBlur($event)"
                                      :error-message="errorMessage"
                                      :error="!!errorMessage"
                                      :placeholder="$t('setlistFormPage.hiddenPatterns.criteriaValue.label')"
                                      min="0"
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
                                @click="push({ pattern: '', difficulty: '', criteriaType: CRITERIA_NONE, criteriaDirection: 0, criteriaValue: 0, })"
                              )
            //- Previews
            q-list.q-my-lg
              q-item-label.text-h6.text-tech(header) {{ $t('setlistFormPage.preview.title')}}
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
                                      :placeholder="$t('setlistFormPage.preview.name.label')"
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
                                      :placeholder="$t('setlistFormPage.preview.link.label')"
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
              q-item-label.text-h6.text-tech(header) {{ $t('setlistFormPage.description.title') }}
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
            q-list.q-my-lg(v-if="setlist._id.length > 0")
              //- List header
              q-item-label.text-h6.text-red(header) {{ $t('setlistFormPage.dangerZone.title') }}
              q-separator.q-mb-md(inset)
              q-item
                q-item-section
                  .row.justify-center.items-center
                    .col-12.col-md-2.q-mb-md.q-mb-md-none {{ $t('setlistFormPage.dangerZone.delete.label') }}
                    .col-12.col-md-10
                      q-btn(outline color="red" @click="openDeleteDialog") {{ $t('setlistFormPage.dangerZone.delete.button') }}
            //- Terms of Service
            .q-mt-xl.q-mx-auto.text-center
              Field(name="agree" v-slot="{ field, errorMessage }")
                q-checkbox(
                  keep-color color="tech"
                  :model-value="field.value"
                  @update:model-value="field.onChange($event)"
                )
                i18n-t(keypath="setlistFormPage.tos.label" tag="span")
                  template(#tos)
                    a(:href="tosURL" target="_blank") {{ $t('setlistFormPage.tos.tos') }}
                template(v-if="!!errorMessage")
                  .text-negative {{ errorMessage }}
              br
              //- Submit button
              q-btn.q-my-md(:label="setlist._id.length === 0 ? $t('setlistFormPage.submit.new') : $t('setlistFormPage.submit.edit')" color="tech" text-color="black" type="submit" style="width: 150px")
//- Delete confirmation dialog
q-dialog(v-model="deleteDialog" persistent)
  q-card(rounded)
    //- Dialog header
    q-card-section.text-center
      q-icon(name="warning" color="red" size="100px")
      .text-h6 {{ $t('setlistFormPage.deleteDialog.text') }}
    q-separator
    //- Dialog actions
    q-card-actions(align="around")
      //- Confirm
      q-btn(color="green" flat :label="$t('setlistFormPage.deleteDialog.yes')" @click="deleteSetlist" :loading="deleting")
      //- Cancel
      q-btn(color="red" flat :label="$t('setlistFormPage.deleteDialog.no')" v-close-popup)
</template>

<script setup>
import { ref, computed, onMounted, useTemplateRef, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Form, Field, FieldArray } from 'vee-validate'
import * as yup from 'yup'
import validator from 'validator'
import { useReCaptcha } from 'vue-recaptcha-v3'
import { getIDFromYouTubeLink } from 'src/utils/youtube'
import { useUserStore } from 'src/stores/user'
import { useTempSetlistStore } from 'src/stores/temp-setlist'
import api from 'src/utils/api'
import handleError from 'src/utils/handleError'
import { controls, CONTROL_TOUCH, CONTROL_KEYS, CONTROL_KM } from 'src/utils/control'
import {
  criterias,
  CRITERIA_INDEX,
  CRITERIA_LEVEL,
  CRITERIA_HP,
  CRITERIA_SCORE,
  CRITERIA_COMBO,
  CRITERIA_MAX_COMBO,
  CRITERIA_D100,
  CRITERIA_NONE,
  CRITERIA_DIRECTION_LOWER,
  CRITERIA_DIRECTION_GREATER,
} from 'src/utils/criteria'
import { getI18nRoute } from 'src/i18n'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const user = useUserStore()
const setlist = useTempSetlistStore()
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

const controlOptions = computed(() => [
  {
    label: t('setlistFormPage.basic.control.' + controls[CONTROL_TOUCH]),
    value: CONTROL_TOUCH,
  },
  {
    label: t('setlistFormPage.basic.control.' + controls[CONTROL_KEYS]),
    value: CONTROL_KEYS,
  },
  { label: t('setlistFormPage.basic.control.' + controls[CONTROL_KM]), value: CONTROL_KM },
])

const criteriaOptions = computed(() => [
  {
    label: t('setlistFormPage.hiddenPatterns.criteriaType.' + criterias[CRITERIA_INDEX]),
    value: CRITERIA_INDEX,
  },
  {
    label: t('setlistFormPage.hiddenPatterns.criteriaType.' + criterias[CRITERIA_LEVEL]),
    value: CRITERIA_LEVEL,
  },
  {
    label: t('setlistFormPage.hiddenPatterns.criteriaType.' + criterias[CRITERIA_HP]),
    value: CRITERIA_HP,
  },
  {
    label: t('setlistFormPage.hiddenPatterns.criteriaType.' + criterias[CRITERIA_SCORE]),
    value: CRITERIA_SCORE,
  },
  {
    label: t('setlistFormPage.hiddenPatterns.criteriaType.' + criterias[CRITERIA_COMBO]),
    value: CRITERIA_COMBO,
  },
  {
    label: t('setlistFormPage.hiddenPatterns.criteriaType.' + criterias[CRITERIA_MAX_COMBO]),
    value: CRITERIA_MAX_COMBO,
  },
  {
    label: t('setlistFormPage.hiddenPatterns.criteriaType.' + criterias[CRITERIA_D100]),
    value: CRITERIA_D100,
  },
  {
    label: t('setlistFormPage.hiddenPatterns.criteriaType.' + criterias[CRITERIA_NONE]),
    value: CRITERIA_NONE,
  },
])

const criteriaDirectionOptions = computed(() => [
  { label: '<', value: 0 },
  { label: '>', value: 1 },
])

// Template refs
const form = useTemplateRef('form')

const patternOptions = ref([])
const difficultyOptions = ref([])

const filterPatterns = async (val, update) => {
  if (val.length === 0) {
    return update(() => {
      patternOptions.value = []
    })
  }
  try {
    const { data } = await api.get('/patterns', {
      params: { keywords: val, sort: 1, sortBy: 'name' },
    })
    return update(() => {
      patternOptions.value = data.result
    })
  } catch {
    return update(() => {
      patternOptions.value = []
    })
  }
}

const filterDifficulties = async (key, idx, val, update) => {
  if (idx < 0 || !form.value?.values?.[key]?.length || !form.value?.values?.[key]?.[idx]?.pattern) {
    return update(() => {
      difficultyOptions.value = []
    })
  }
  try {
    const { data } = await api.get(`/patterns/${form.value.values[key][idx].pattern}`)
    return update(() => {
      difficultyOptions.value = data.result.difficulties
        .filter((difficulty) => difficulty.control === form.value.values.control)
        .map((difficulty) => ({
          _id: difficulty._id,
          name: `${difficulty.lanes}L ${difficulty.name} - Lv.${difficulty.level}`,
        }))
    })
  } catch {
    return update(() => {
      difficultyOptions.value = []
    })
  }
}

// clear selected difficulties when changing control type
const clearDifficulties = () => {
  form.value.values.selectablePatterns.forEach((pattern, idx) => {
    if (form.value.values.selectablePatterns[idx].difficulty !== '') {
      form.value.setFieldValue(`selectablePatterns[${idx}].difficulty`, '')
    }
  })
  form.value.values.hiddenPatterns.forEach((pattern, idx) => {
    if (form.value.values.hiddenPatterns[idx].difficulty !== '') {
      form.value.setFieldValue(`hiddenPatterns[${idx}].difficulty`, '')
    }
  })
}

// Form validation schema
const schema = yup.object({
  name: yup.string().required(() => t('setlistFormPage.basic.name.error.required')),
  link: yup
    .string()
    .url(() => t('setlistFormPage.basic.download.error.invalid'))
    .required(() => t('setlistFormPage.basic.download.error.required')),
  image: yup.string().url(() => t('setlistFormPage.basic.image.error.invalid')),
  control: yup
    .number()
    .typeError(() => t('setlistFormPage.basic.control.error.required'))
    .required(() => t('setlistFormPage.basic.control.error.required'))
    .oneOf([CONTROL_TOUCH, CONTROL_KEYS, CONTROL_KM], () =>
      t('setlistFormPage.basic.control.error.invalid'),
    ),
  selectablePatterns: yup.array().of(
    yup.object().shape({
      pattern: yup
        .string()
        .required(() => t('setlistFormPage.selectablePatterns.name.error.required'))
        .test(
          'mongoID',
          () => t('setlistFormPage.selectablePatterns.name.error.invalid'),
          (value) => {
            return validator.isMongoId(value)
          },
        ),
      // .test(
      //   'exists',
      //   () => t('setlistFormPage.selectablePatterns.name.error.notFound'),
      //   async (value) => {
      //     if (!value) return
      //     try {
      //       await api.get(`/patterns/${value}`)
      //       return true
      //     } catch {
      //       return false
      //     }
      //   },
      // ),
      difficulty: yup
        .string()
        .required(() => t('setlistFormPage.selectablePatterns.difficulty.error.required'))
        .test(
          'mongoID',
          () => t('setlistFormPage.selectablePatterns.difficulty.error.invalid'),
          (value) => {
            return validator.isMongoId(value)
          },
        ),
    }),
  ),
  hiddenPatterns: yup
    .array()
    .of(
      yup.object().shape({
        pattern: yup
          .string()
          .required(() => t('setlistFormPage.hiddenPatterns.name.error.required'))
          .test(
            'mongoID',
            () => t('setlistFormPage.hiddenPatterns.name.error.invalid'),
            (value) => {
              return validator.isMongoId(value)
            },
          ),
        // .test(
        //   'exists',
        //   () => t('setlistFormPage.hiddenPatterns.name.error.notFound'),
        //   async (value) => {
        //     if (!value) return
        //     try {
        //       await api.get(`/patterns/${value}`)
        //       return true
        //     } catch {
        //       return false
        //     }
        //   },
        // ),
        difficulty: yup
          .string()
          .required(() => t('setlistFormPage.hiddenPatterns.difficulty.error.required'))
          .test(
            'mongoID',
            () => t('setlistFormPage.selectablePatterns.difficulty.error.invalid'),
            (value) => {
              return validator.isMongoId(value)
            },
          ),
        criteriaType: yup
          .number()
          .typeError(() => t('setlistFormPage.hiddenPatterns.criteriaType.error.required'))
          .required(() => t('setlistFormPage.hiddenPatterns.criteriaType.error.required'))
          .oneOf([
            CRITERIA_INDEX,
            CRITERIA_LEVEL,
            CRITERIA_HP,
            CRITERIA_SCORE,
            CRITERIA_COMBO,
            CRITERIA_MAX_COMBO,
            CRITERIA_D100,
            CRITERIA_NONE,
          ]),
        criteriaDirection: yup
          .number()
          .required()
          .oneOf([CRITERIA_DIRECTION_LOWER, CRITERIA_DIRECTION_GREATER]),
        criteriaValue: yup
          .number()
          .typeError(() => t('setlistFormPage.hiddenPatterns.criteriaValue.error.required'))
          .required(() => t('setlistFormPage.hiddenPatterns.criteriaValue.error.required'))
          .min(0, () => t('setlistFormPage.hiddenPatterns.criteriaValue.error.min')),
      }),
    )
    .test(
      'criteriaType',
      () => t('setlistFormPage.hiddenPatterns.criteriaType.error.lastType'),
      (value) => {
        // CRITERIA_NONE is only for the last hidden pattern
        return value?.every((pattern, idx) => {
          return pattern.criteriaType !== CRITERIA_NONE || idx === value.length - 1
        })
      },
    ),
  previews: yup.array().of(
    yup.object().shape({
      name: yup.string().required(() => t('setlistFormPage.preview.name.error.required')),
      link: yup
        .string()
        .required(() => t('setlistFormPage.preview.link.error.required'))
        .url(() => t('setlistFormPage.preview.link.error.invalid'))
        .test('youtube', t('setlistFormPage.preview.link.error.youtube'), getIDFromYouTubeLink),
    }),
  ),
  description: yup.string(),
  agree: yup
    .bool()
    .required(() => t('setlistFormPage.tos.error.required'))
    .oneOf([true], () => t('setlistFormPage.tos.error.required')),
})
// Form initial values
const initialValues = {
  // Setlist name
  name: '',
  // Download link
  link: '',
  // Control type
  control: CONTROL_TOUCH,
  // Image preview link
  image: '',
  // Preview videos
  previews: [{ name: '', link: '' }],
  // Selectable patterns
  // pattern: mongoID
  // difficulty: mongoID
  selectablePatterns: [{ pattern: '', difficulty: '' }],
  // Hidden patterns
  // pattern: mongoID
  // difficulty: mongoID
  // criteriaType: number
  // criteriaDirection: number
  // criteriaValue: number
  hiddenPatterns: [
    {
      pattern: '',
      difficulty: '',
      criteriaType: CRITERIA_NONE,
      criteriaDirection: CRITERIA_DIRECTION_LOWER,
      criteriaValue: 0,
    },
  ],
  // Description
  description: '',
  // ToS agreement
  agree: false,
}
// On form submit
const onSubmit = async (values) => {
  $q.loading.show()

  try {
    if (route.params.id) {
      // Has setlist ID, update setlist
      const token = await recaptcha.executeRecaptcha('updateSetlist')
      await api.patch(`/setlists/${setlist._id}`, {
        name: values.name,
        control: values.control,
        link: values.link,
        image: values.image,
        selectablePatterns: values.selectablePatterns,
        hiddenPatterns: values.hiddenPatterns,
        previews: values.previews.map((preview) => ({
          name: preview.name,
          ytid: getIDFromYouTubeLink(preview.link),
        })),
        description: values.description,
        'g-recaptcha-response': token,
      })
    } else {
      // No setlist ID, create new setlist
      console.log(values)
      const token = await recaptcha.executeRecaptcha('newSetlist')
      const { data } = await api.post(`/setlists`, {
        name: values.name,
        control: values.control,
        link: values.link,
        image: values.image,
        selectablePatterns: values.selectablePatterns,
        hiddenPatterns: values.hiddenPatterns,
        previews: values.previews.map((preview) => ({
          name: preview.name,
          ytid: getIDFromYouTubeLink(preview.link),
        })),
        description: values.description,
        'g-recaptcha-response': token,
      })
      router.push(getI18nRoute({ name: 'setlist', params: { id: data._id } }))
    }
    // Notify success
    $q.notify({
      icon: 'check',
      message: t('setlistFormPage.result.updated'),
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
// Is deleting setlist
const deleting = ref(false)
// Open Delete confirmation dialog
const openDeleteDialog = () => {
  deleteDialog.value = true
}
// Delete setlist
const deleteSetlist = async () => {
  deleting.value = true
  try {
    await api.delete(`/setlists/${setlist._id}`)
    // Notify success
    $q.notify({
      icon: 'check',
      message: t('setlistFormPage.result.deleted'),
      color: 'positive',
      position: 'top',
      timeout: 2000,
    })
    // Redirect to home
    router.push(getI18nRoute({ name: 'profile', params: { tab: 'setlists', id: user._id } }))
  } catch (error) {
    handleError(error)
  }
  deleting.value = false
  deleteDialog.value = false
}

// Note:
// Prefetch is not working in component
defineOptions({
  async preFetch() {},
})

onMounted(async () => {
  // Get setlist data if editing
  if (!route.params.id) return

  // Set initial values for the form
  const hiddenPatterns = []
  if (setlist.hiddenPatterns.length == 0) {
    hiddenPatterns.push([
      {
        pattern: '',
        difficulty: '',
        criteriaType: CRITERIA_NONE,
        criteriaDirection: CRITERIA_DIRECTION_LOWER,
        criteriaValue: 0,
      },
    ])
  } else {
    hiddenPatterns.push(
      ...setlist.hiddenPatterns.map((pattern) => {
        return {
          pattern: pattern._id,
          difficulty: pattern.difficulty._id,
          criteriaType: pattern.criteriaType,
          criteriaDirection: pattern.criteriaDirection,
          criteriaValue: pattern.criteriaValue,
        }
      }),
    )
  }

  // Wait for the form to be ready to get template ref
  await nextTick()

  // Set form values
  form.value.setFieldValue('name', setlist.name)
  form.value.setFieldValue('link', setlist.link)
  form.value.setFieldValue('control', setlist.control)
  form.value.setFieldValue('image', setlist.image)
  form.value.setFieldValue('description', setlist.description)

  if (setlist.previews.length == 0) {
    form.value.setFieldValue('previews', [{ name: '', link: '' }])
  } else {
    form.value.setFieldValue(
      'previews',
      setlist.previews.map((preview) => {
        preview.link = 'https://www.youtube.com/watch?v=' + preview.ytid
        return preview
      }),
    )
  }

  if (setlist.selectablePatterns.length > 0) {
    const values = []
    for (let i = 0; i < setlist.selectablePatterns.length; i++) {
      const pattern = setlist.selectablePatterns[i]
      // Push option value for q-select display
      patternOptions.value.push(pattern)
      difficultyOptions.value.push({
        _id: pattern.difficulty._id,
        name: `${pattern.difficulty.lanes}L ${pattern.difficulty.name} - Lv.${pattern.difficulty.level}`,
      })
      values.push({
        pattern: pattern._id,
        difficulty: pattern.difficulty._id,
      })
    }
    form.value.setFieldValue(`selectablePatterns`, values)
    await nextTick()
  }

  if (setlist.hiddenPatterns.length > 0) {
    const values = []
    for (let i = 0; i < setlist.hiddenPatterns.length; i++) {
      const pattern = setlist.hiddenPatterns[i]
      // Push option value for q-select display
      patternOptions.value.push(pattern)
      difficultyOptions.value.push({
        _id: pattern.difficulty._id,
        name: `${pattern.difficulty.lanes}L ${pattern.difficulty.name} - Lv.${pattern.difficulty.level}`,
      })
      values.push({
        pattern: pattern._id,
        difficulty: pattern.difficulty._id,
        criteriaType: pattern.criteriaType,
        criteriaDirection: pattern.criteriaDirection,
        criteriaValue: pattern.criteriaValue,
      })
    }
    form.value.setFieldValue(`hiddenPatterns`, values)
    await nextTick()
  }

  // Clear pushed pattern options and difficulty options
  patternOptions.value = []
  difficultyOptions.value = []
})
</script>
