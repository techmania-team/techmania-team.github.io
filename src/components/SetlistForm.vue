<template lang="pug">
//- Content
.q-mx-auto.padding(tag="section")
  .container
    .row
      .col-12
        //- Form
        q-form(@submit.prevent="onSubmit")
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
                    q-input.q-pb-none(
                      outlined square color="tech" hide-bottom-space
                      v-model="nameField"
                      :error-message="form.errors.value.name"
                      :error="!!form.errors.value.name"
                    )
            //- Field - Control Type
            q-item.q-py-lg.q-py-md-md
              q-item-section
                .row.justify-center.items-center
                  .col-12.col-md-2.q-mb-md.q-mb-md-none {{ $t('setlistFormPage.basic.control.label') }}
                  .col-12.col-md-10
                    template(v-for="(controlOption) in controlOptions" :key="controlOption.value")
                      q-radio(
                        name="control"
                        keep-color color="tech"
                        v-model="controlField"
                        :val="controlOption.value"
                        @update:model-value="clearDifficulties"
                        :label="controlOption.label"
                      )
                    template(v-if="!!form.errors.value.control")
                      .text-negative {{ form.errors.value.control }}
            //- Field - Download link
            q-item.q-py-lg.q-py-md-md
              q-item-section
                .row.justify-center.items-center
                  .col-12.col-md-2.q-mb-md.q-mb-md-none {{ $t('setlistFormPage.basic.download.label') }}
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
                  .col-12.col-md-2.q-mb-md.q-mb-md-none {{ $t('setlistFormPage.basic.image.label') }}
                  .col-12.col-md-10
                    q-input.q-pb-none(
                      outlined square color="tech" hide-bottom-space
                      v-model="imageField"
                      :error-message="form.errors.value.image"
                      :error="!!form.errors.value.image"
                    )
          //- Selectable Patterns
          q-list.q-my-lg
            q-item-label.text-h6.text-tech(header) {{ $t('setlistFormPage.selectablePatterns.title')}}
            q-separator.q-mb-md(inset)
            q-item
              q-item-section
                .row.items-start.justify-between.q-col-gutter-y-xl
                  template(v-for="(field, idx) in selectablePatternsField.fields.value" :key="field.key")
                    .col-12
                      .row
                        .col-10.col-md-11
                          .row.q-col-gutter-x-md.q-col-gutter-y-lg
                            //- Pattern
                            .col-12.col-md-8
                              q-select.q-pb-none(
                                outlined square color="tech" hide-bottom-space
                                v-model="getSelectablePattern(idx)[0].value"
                                @update:model-value="clearDifficulty('selectablePatterns', idx)"
                                :error-message="form.errors.value[`selectablePatterns[${idx}].pattern`]"
                                :error="!!form.errors.value[`selectablePatterns[${idx}].pattern`]"
                                :options="patternOptions"
                                :placeholder="getSelectablePattern(idx)[0].value ? '': $t('setlistFormPage.selectablePatterns.name.label')"
                                option-value="_id"
                                :option-label="item => item ? `${item.composer} - ${item.name}` : ''"
                                emit-value
                                map-options
                                use-input
                                clearable
                                @filter="filterPatterns"
                                @clear="clearDifficulty('selectablePatterns', idx)"
                              )
                                template(#no-option)
                                  q-item
                                    q-item-section {{ $t('setlistFormPage.selectablePatterns.name.searchNotFound') }}
                            //- Difficulty
                            .col-12.col-md-4
                              q-select.q-pb-none(
                                outlined square color="tech" hide-bottom-space
                                v-model="getSelectableDifficulty(idx)[0].value"
                                :error-message="form.errors.value[`selectablePatterns[${idx}].difficulty`]"
                                :error="!!form.errors.value[`selectablePatterns[${idx}].difficulty`]"
                                :options="difficultyOptions"
                                :placeholder="getSelectableDifficulty(idx)[0].value ? '' : $t('setlistFormPage.hiddenPatterns.difficulty.label')"
                                option-value="_id"
                                :option-label="item => item ? `${item.lanes}L ${item.name} - Lv.${item.level}` : ''"
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
                            @click="selectablePatternsField.remove(idx)"
                          )
                          q-btn(
                            flat round icon="add" color="tech"
                            v-else
                            @click="selectablePatternsField.push({ pattern: '', difficulty: '' })"
                          )
          //- Hidden Patterns
          q-list.q-my-lg
            q-item-label.text-h6.text-tech(header) {{ $t('setlistFormPage.hiddenPatterns.title')}}
            q-separator.q-mb-md(inset)
            q-item
              q-item-section
                p.text-negative(v-if="!!form.errors.value.hiddenPatterns") {{ form.errors.value.hiddenPatterns }}
                .row.items-start.justify-between.q-col-gutter-y-xl
                  template(v-for="(field, idx) in hiddenPatternsField.fields.value" :key="field.key")
                    .col-12
                      .row
                        .col-10.col-md-11
                          .row.q-col-gutter-x-md.q-col-gutter-y-lg
                            //- Pattern
                            .col-12.col-md-8
                              q-select.q-pb-none(
                                outlined square color="tech" hide-bottom-space
                                v-model="getHiddenPattern(idx)[0].value"
                                @update:model-value="clearDifficulty('hiddenPatterns', idx)"
                                :error-message="form.errors.value[`hiddenPatterns[${idx}].pattern`]"
                                :error="!!form.errors.value[`hiddenPatterns[${idx}].pattern`]"
                                :options="patternOptions"
                                :placeholder="getHiddenPattern(idx)[0].value ? '': $t('setlistFormPage.hiddenPatterns.name.label')"
                                option-value="_id"
                                :option-label="item => item ? `${item.composer} - ${item.name}` : ''"
                                emit-value
                                map-options
                                use-input
                                clearable
                                @filter="filterPatterns"
                                @clear="clearDifficulty('hiddenPatterns', idx)"
                              )
                                template(#no-option)
                                  q-item
                                    q-item-section {{ $t('setlistFormPage.hiddenPatterns.name.searchNotFound') }}
                            //- Difficulty
                            .col-12.col-md-4
                              q-select.q-pb-none(
                                outlined square color="tech" hide-bottom-space
                                v-model="getHiddenDifficulty(idx)[0].value"
                                :error-message="form.errors.value[`hiddenPatterns[${idx}].difficulty`]"
                                :error="!!form.errors.value[`hiddenPatterns[${idx}].difficulty`]"
                                :options="difficultyOptions"
                                :placeholder="getHiddenDifficulty(idx)[0].value ? '' : $t('setlistFormPage.hiddenPatterns.difficulty.label')"
                                option-value="_id"
                                :option-label="item => item ? `${item.lanes}L ${item.name} - Lv.${item.level}` : ''"
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
                              q-select.q-pb-none(
                                :disable="idx === hiddenPatternsField.fields.value.length - 1"
                                outlined square color="tech" hide-bottom-space
                                v-model="getHiddenCriteriaType(idx)[0].value"
                                :error-message="form.errors.value[`hiddenPatterns[${idx}].criteriaType`]"
                                :error="!!form.errors.value[`hiddenPatterns[${idx}].criteriaType`]"
                                :options="criteriaOptions" :placeholder="$t('setlistFormPage.hiddenPatterns.criteriaType.label')"
                                emit-value map-options
                              )
                            //- Criteria Direction
                            .col-4
                              q-select.q-pb-none(
                                :disable="idx === hiddenPatternsField.fields.value.length - 1"
                                outlined square color="tech" hide-bottom-space
                                v-model="getHiddenCriteriaDirection(idx)[0].value"
                                :error-message="form.errors.value[`hiddenPatterns[${idx}].criteriaDirection`]"
                                :error="!!form.errors.value[`hiddenPatterns[${idx}].criteriaDirection`]"
                                :options="criteriaDirectionOptions" :placeholder="$t('setlistFormPage.hiddenPatterns.criteriaDirection.label')"
                                emit-value map-options
                              )
                            //- Criteria Value
                            .col-4
                              q-input.q-pb-none(
                                :disable="idx === hiddenPatternsField.fields.value.length - 1"
                                outlined square color="tech" type="number" hide-bottom-space
                                v-model="getHiddenCriteriaValue(idx)[0].value"
                                :error-message="form.errors.value[`hiddenPatterns[${idx}].criteriaValue`]"
                                :error="!!form.errors.value[`hiddenPatterns[${idx}].criteriaValue`]"
                                :placeholder="$t('setlistFormPage.hiddenPatterns.criteriaValue.label')"
                                min="0"
                              )
                        //- Action buttons
                        .col-2.col-md-1.text-center.self-center.q-py-none
                          q-btn(
                            flat round icon="delete" color="tech"
                            v-if="idx !== 0"
                            @click="hiddenPatternsField.remove(idx)"
                          )
                          q-btn(
                            flat round icon="add" color="tech"
                            v-else
                            @click="hiddenPatternsField.push({ pattern: '', difficulty: '', criteriaType: CRITERIA.NONE, criteriaDirection: 0, criteriaValue: 0 })"
                          )
          //- Previews
          q-list.q-my-lg
            q-item-label.text-h6.text-tech(header) {{ $t('setlistFormPage.preview.title')}}
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
                                :placeholder="$t('setlistFormPage.preview.name.label')"
                              )
                            //- Link
                            .col-12.col-md-9
                              q-input.q-pb-none(
                                outlined square color="tech" type="url" hide-bottom-space
                                v-model="getPreviewLink(idx)[0].value"
                                :error-message="form.errors.value[`previews[${idx}].link`]"
                                :error="!!form.errors.value[`previews[${idx}].link`]"
                                :placeholder="$t('setlistFormPage.preview.link.label')"
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
            q-item-label.text-h6.text-tech(header) {{ $t('setlistFormPage.description.title') }}
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
            q-checkbox(
              keep-color color="tech"
              v-model="agreeField"
            )
            i18n-t(keypath="setlistFormPage.tos.label" tag="span")
              template(#tos)
                a(:href="tosURL" target="_blank") {{ $t('setlistFormPage.tos.tos') }}
            template(v-if="!!form.errors.value.agree")
              .text-negative {{ form.errors.value.agree }}
            br
             //- Turnstile
            .row.justify-center.q-my-md
              cf-turnstile(v-model="turnstileToken" :action="isEdit ? 'setlist-update' : 'setlist-create'" ref="turnstileRef")
            //- Submit button
            q-btn.q-my-md(:label="isEdit ? $t('setlistFormPage.submit.edit') : $t('setlistFormPage.submit.new')" color="tech" text-color="black" type="submit" style="width: 150px")
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

<script setup lang="ts">
import type { ISetlist } from '@/types/setlist'
import { AxiosError } from 'axios'
import { useQuasar } from 'quasar'
import validator from 'validator'
import { useFieldArray, useForm } from 'vee-validate'
import { computed, nextTick, onMounted, ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import * as yup from 'yup'
import { getI18nRoute } from '@/i18n'
import * as patternService from '@/services/pattern'
import * as setlistService from '@/services/setlist'
import { useUserStore } from '@/stores/user'
import { controls, CONTROLTYPE } from '@/utils/control'
import { CRITERIA, CRITERIA_DIRECTION, criterias } from '@/utils/criteria'
import { handleError, handleFormSubmitError } from '@/utils/handleError'
import { getIDFromYouTubeLink } from '@/utils/youtube'
import CfTurnstile from './CfTurnstile.vue'

// Local helper interfaces for populated API response types
interface IDifficultyOption {
  _id: string
  name: string
  lanes: number
  level: number
  control: CONTROLTYPE
}

interface IPatternOption {
  _id: string
  name: string
  composer: string
  difficulties: IDifficultyOption[]
}

// Populated items fetched in editing mode
interface IPopulatedPatternItem extends IPatternOption {
  difficulty: IDifficultyOption
  criteriaType?: number
  criteriaDirection?: number
  criteriaValue?: number
}

const props = defineProps<{
  setlist?: ISetlist
}>()
const isEdit = computed(() => Boolean(props.setlist?._id))

const $q = useQuasar()
const router = useRouter()
const user = useUserStore()
const { t } = useI18n()

const turnstileToken = ref('')
const turnstileRef = useTemplateRef('turnstileRef')

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
    label: t('setlistFormPage.basic.control.' + controls[CONTROLTYPE.TOUCH]),
    value: CONTROLTYPE.TOUCH,
  },
  {
    label: t('setlistFormPage.basic.control.' + controls[CONTROLTYPE.KEYS]),
    value: CONTROLTYPE.KEYS,
  },
  { label: t('setlistFormPage.basic.control.' + controls[CONTROLTYPE.KM]), value: CONTROLTYPE.KM },
])

const criteriaOptions = computed(() => [
  {
    label: t('setlistFormPage.hiddenPatterns.criteriaType.' + criterias[CRITERIA.INDEX]),
    value: CRITERIA.INDEX,
  },
  {
    label: t('setlistFormPage.hiddenPatterns.criteriaType.' + criterias[CRITERIA.LEVEL]),
    value: CRITERIA.LEVEL,
  },
  {
    label: t('setlistFormPage.hiddenPatterns.criteriaType.' + criterias[CRITERIA.HP]),
    value: CRITERIA.HP,
  },
  {
    label: t('setlistFormPage.hiddenPatterns.criteriaType.' + criterias[CRITERIA.SCORE]),
    value: CRITERIA.SCORE,
  },
  {
    label: t('setlistFormPage.hiddenPatterns.criteriaType.' + criterias[CRITERIA.COMBO]),
    value: CRITERIA.COMBO,
  },
  {
    label: t('setlistFormPage.hiddenPatterns.criteriaType.' + criterias[CRITERIA.MAX_COMBO]),
    value: CRITERIA.MAX_COMBO,
  },
  {
    label: t('setlistFormPage.hiddenPatterns.criteriaType.' + criterias[CRITERIA.D100]),
    value: CRITERIA.D100,
  },
  {
    label: t('setlistFormPage.hiddenPatterns.criteriaType.' + criterias[CRITERIA.NONE]),
    value: CRITERIA.NONE,
  },
])

const criteriaDirectionOptions = computed(() => [
  { label: '<', value: 0 },
  { label: '>', value: 1 },
])

const patternOptions = ref<IPatternOption[]>([])
const difficultyOptions = ref<IDifficultyOption[]>([])

// Form validation schema
const schema = yup.object({
  name: yup.string().required(() => t('setlistFormPage.basic.name.error.required')),
  link: yup
    .string()
    .url(() => t('setlistFormPage.basic.download.error.invalid'))
    .required(() => t('setlistFormPage.basic.download.error.required')),
  image: yup
    .string()
    .notRequired()
    .test(
      'is-valid-url-or-empty',
      () => t('setlistFormPage.basic.image.error.invalid'),
      (value) => !value || yup.string().url().isValidSync(value),
    ),
  previews: yup.array().of(
    yup.object().shape({
      name: yup.string().test(
        'name-required-if-link',
        () => t('setlistFormPage.preview.name.error.required'),
        function (value) {
          const { link } = this.parent
          if (link && !value) return false
          return true
        },
      ),
      link: yup
        .string()
        .test(
          'link-required-if-name',
          () => t('setlistFormPage.preview.link.error.required'),
          function (value) {
            const { name } = this.parent
            if (name && !value) return false
            return true
          },
        )
        .test(
          'youtube',
          () => t('setlistFormPage.preview.link.error.youtube'),
          (value) => {
            if (!value) return true
            return Boolean(getIDFromYouTubeLink(value))
          },
        ),
    }),
  ),
  control: yup
    .number<CONTROLTYPE>()
    .typeError(() => t('setlistFormPage.basic.control.error.required'))
    .required(() => t('setlistFormPage.basic.control.error.required'))
    .oneOf(Object.values(CONTROLTYPE) as number[], () =>
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
            return validator.isMongoId(value || '')
          },
        ),
      difficulty: yup
        .string()
        .required(() => t('setlistFormPage.selectablePatterns.difficulty.error.required'))
        .test(
          'mongoID',
          () => t('setlistFormPage.selectablePatterns.difficulty.error.invalid'),
          (value) => {
            return validator.isMongoId(value || '')
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
              return validator.isMongoId(value || '')
            },
          ),
        difficulty: yup
          .string()
          .required(() => t('setlistFormPage.hiddenPatterns.difficulty.error.required'))
          .test(
            'mongoID',
            () => t('setlistFormPage.selectablePatterns.difficulty.error.invalid'),
            (value) => {
              return validator.isMongoId(value || '')
            },
          ),
        criteriaType: yup
          .number<CRITERIA>()
          .typeError(() => t('setlistFormPage.hiddenPatterns.criteriaType.error.required'))
          .required(() => t('setlistFormPage.hiddenPatterns.criteriaType.error.required'))
          .oneOf(Object.values(CRITERIA) as number[]),
        criteriaDirection: yup
          .number<CRITERIA_DIRECTION>()
          .required()
          .oneOf(Object.values(CRITERIA_DIRECTION) as number[]),
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
        // CRITERIA.NONE is only for the last hidden pattern
        return value?.every((pattern, idx) => {
          return pattern.criteriaType !== CRITERIA.NONE || idx === value.length - 1
        })
      },
    ),
  description: yup.string(),
  agree: yup
    .bool()
    .required(() => t('setlistFormPage.tos.error.required'))
    .oneOf([true], () => t('setlistFormPage.tos.error.required')),
})

// Form initial values
const initialValues = {
  name: '',
  link: '',
  control: CONTROLTYPE.TOUCH,
  image: '',
  previews: [{ name: '', link: '' }],
  selectablePatterns: [{ pattern: '', difficulty: '' }],
  hiddenPatterns: [
    {
      pattern: '',
      difficulty: '',
      criteriaType: CRITERIA.NONE,
      criteriaDirection: CRITERIA_DIRECTION.LOWER,
      criteriaValue: 0,
    },
  ],
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
const [controlField] = form.defineField('control')
const [descriptionField] = form.defineField('description')
const [agreeField] = form.defineField('agree')

const selectablePatternsField = useFieldArray('selectablePatterns')
const getSelectablePattern = (i: number) => form.defineField(`selectablePatterns[${i}].pattern`)
const getSelectableDifficulty = (i: number) =>
  form.defineField(`selectablePatterns[${i}].difficulty`)

const hiddenPatternsField = useFieldArray('hiddenPatterns')
const getHiddenPattern = (i: number) => form.defineField(`hiddenPatterns[${i}].pattern`)
const getHiddenDifficulty = (i: number) => form.defineField(`hiddenPatterns[${i}].difficulty`)
const getHiddenCriteriaType = (i: number) => form.defineField(`hiddenPatterns[${i}].criteriaType`)
const getHiddenCriteriaDirection = (i: number) =>
  form.defineField(`hiddenPatterns[${i}].criteriaDirection`)
const getHiddenCriteriaValue = (i: number) => form.defineField(`hiddenPatterns[${i}].criteriaValue`)

const previewsField = useFieldArray('previews')
const getPreviewName = (i: number) => form.defineField(`previews[${i}].name`)
const getPreviewLink = (i: number) => form.defineField(`previews[${i}].link`)

const filterPatterns = async (val: string, update: (callback: () => void) => void) => {
  if (val.length === 0) {
    return update(() => {
      patternOptions.value = []
    })
  }
  try {
    const { data } = await patternService.search({ keywords: val, sort: 1, sortBy: 'name' })
    return update(() => {
      patternOptions.value = data.result
    })
  } catch {
    return update(() => {
      patternOptions.value = []
    })
  }
}

const filterDifficulties = async (
  key: 'selectablePatterns' | 'hiddenPatterns',
  idx: number,
  val: string,
  update: (callback: () => void) => void,
) => {
  if (idx < 0 || !form.values?.[key]?.length || !form.values?.[key]?.[idx]?.pattern) {
    return update(() => {
      difficultyOptions.value = []
    })
  }
  try {
    const { data } = await patternService.searchID(form.values[key][idx].pattern)
    return update(() => {
      difficultyOptions.value = data.result.difficulties.filter(
        (difficulty: IDifficultyOption) => difficulty.control === form.values.control,
      )
    })
  } catch {
    return update(() => {
      difficultyOptions.value = []
    })
  }
}

const clearDifficulty = (type: 'selectablePatterns' | 'hiddenPatterns', idx: number) => {
  if (form.values[type]?.[idx]?.difficulty !== '') {
    form.resetField(`${type}[${idx}].difficulty`)
  }
}

// clear selected difficulties when changing control type
const clearDifficulties = () => {
  form.values.selectablePatterns?.forEach((pattern, idx) => {
    if (pattern.difficulty !== '') {
      form.resetField(`selectablePatterns[${idx}].difficulty`)
    }
  })
  form.values.hiddenPatterns?.forEach((pattern, idx) => {
    if (pattern.difficulty !== '') {
      form.resetField(`hiddenPatterns[${idx}].difficulty`)
    }
  })
}

// On form submit
const onSubmit = form.handleSubmit(async (values) => {
  $q.loading.show()

  try {
    if (!turnstileToken.value) {
      $q.notify({
        icon: 'warning',
        message: t('setlistFormPage.turnstile.error.required'),
        color: 'warning',
        position: 'top',
        timeout: 2000,
      })
      $q.loading.hide()
      return
    }

    if (isEdit.value) {
      // Has setlist ID, update setlist
      await setlistService.update(props.setlist!._id, {
        name: values.name,
        control: values.control,
        link: values.link,
        image: values.image,
        selectablePatterns: values.selectablePatterns,
        hiddenPatterns: values.hiddenPatterns,
        previews: values.previews
          .filter((preview) => preview.name || preview.link)
          .map((preview) => ({
            name: preview.name,
            ytid: getIDFromYouTubeLink(preview.link),
          })),
        description: values.description,
        'cf-turnstile-response': turnstileToken.value,
      })
      $q.notify({
        icon: 'check',
        message: t('setlistFormPage.result.updated'),
        color: 'positive',
        position: 'top',
        timeout: 2000,
      })
      await router.push(getI18nRoute({ name: 'setlist', params: { id: props.setlist!._id } }))
    } else {
      // No setlist ID, create new setlist
      const { data } = await setlistService.create({
        name: values.name,
        control: values.control,
        link: values.link,
        image: values.image,
        selectablePatterns: values.selectablePatterns,
        hiddenPatterns: values.hiddenPatterns,
        previews: values.previews
          .filter((preview) => preview.name || preview.link)
          .map((preview) => ({
            name: preview.name,
            ytid: getIDFromYouTubeLink(preview.link),
          })),
        description: values.description,
        'cf-turnstile-response': turnstileToken.value,
      })
      $q.notify({
        icon: 'check',
        message: t('setlistFormPage.result.submitted'),
        color: 'positive',
        position: 'top',
        timeout: 2000,
      })
      await router.push(getI18nRoute({ name: 'setlist', params: { id: data.result } }))
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      if (isEdit.value) {
        // Editing setlist
        await handleFormSubmitError(error, 'setlistFormPage', 'update')
      } else {
        // Creating new setlist
        await handleFormSubmitError(error, 'setlistFormPage', 'create')
      }
    } else {
      handleError(error)
    }
    turnstileRef.value?.reset()
  } finally {
    $q.loading.hide()
  }
})

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
    await setlistService.del(props.setlist!._id)
    // Notify success
    $q.notify({
      icon: 'check',
      message: t('setlistFormPage.result.deleted'),
      color: 'positive',
      position: 'top',
      timeout: 2000,
    })
    // Redirect to home
    await router.push(getI18nRoute({ name: 'profile-setlists', params: { id: user._id } }))
  } catch (error) {
    if (error instanceof AxiosError) {
      await handleFormSubmitError(error, 'setlistFormPage', 'delete')
    } else {
      handleError(error)
    }
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
  if (!isEdit.value) return

  // Wait for the form to be ready to get template ref
  await nextTick()

  // Set form values
  form.setFieldValue('name', props.setlist!.name)
  form.setFieldValue('link', props.setlist!.link)
  form.setFieldValue('control', props.setlist!.control)
  form.setFieldValue('image', props.setlist!.image)
  form.setFieldValue('description', props.setlist!.description)

  if (props.setlist!.previews.length == 0) {
    form.setFieldValue('previews', [{ name: '', link: '' }])
  } else {
    form.setFieldValue(
      'previews',
      props.setlist!.previews.map((preview) => {
        return {
          name: preview.name,
          link: preview.ytid ? `https://www.youtube.com/watch?v=${preview.ytid}` : '',
        }
      }),
    )
  }

  if (props.setlist!.selectablePatterns.length > 0) {
    const values = []
    for (let i = 0; i < props.setlist!.selectablePatterns.length; i++) {
      const pattern = props.setlist!.selectablePatterns[i] as unknown as IPopulatedPatternItem
      // Push option value for q-select display
      patternOptions.value.push(pattern)
      difficultyOptions.value.push({
        _id: pattern.difficulty._id,
        name: pattern.difficulty.name,
        lanes: pattern.difficulty.lanes,
        level: pattern.difficulty.level,
        control: pattern.difficulty.control,
      })
      values.push({
        pattern: pattern._id,
        difficulty: pattern.difficulty._id,
      })
    }
    form.setFieldValue(`selectablePatterns`, values)
    await nextTick()
  }

  if (props.setlist!.hiddenPatterns.length > 0) {
    const values = []
    for (let i = 0; i < props.setlist!.hiddenPatterns.length; i++) {
      const pattern = props.setlist!.hiddenPatterns[i] as unknown as IPopulatedPatternItem
      // Push option value for q-select display
      patternOptions.value.push(pattern)
      difficultyOptions.value.push({
        _id: pattern.difficulty._id,
        name: pattern.difficulty.name,
        lanes: pattern.difficulty.lanes,
        level: pattern.difficulty.level,
        control: pattern.difficulty.control,
      })
      values.push({
        pattern: pattern._id,
        difficulty: pattern.difficulty._id,
        criteriaType: pattern.criteriaType || CRITERIA.NONE,
        criteriaDirection: pattern.criteriaDirection || CRITERIA_DIRECTION.LOWER,
        criteriaValue: pattern.criteriaValue || 0,
      })
    }
    form.setFieldValue(`hiddenPatterns`, values)
    await nextTick()
  }

  // Clear pushed pattern options and difficulty options
  patternOptions.value = []
  difficultyOptions.value = []
})
</script>
