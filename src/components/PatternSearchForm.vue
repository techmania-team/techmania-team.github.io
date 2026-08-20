<template lang="pug">
section.q-mx-auto.padding.q-my-md
  .container
    .row
      .col-12.q-mx-auto
        //- Search form
        q-form(@submit.prevent="onFormSubmit")
          //- Keywords
          q-input(
            square outlined color="tech"
            v-model="keywordsField"
            :error-message="form.errors.value.keywords"
            :error="!!form.errors.value.keywords"
            :placeholder="$t('patternsPage.searchForm.keywords.placeholder')"
          )
            template(#after)
              q-btn(type="button" icon="search" round dense flat :loading="form.isSubmitting.value" @click="onFormSubmit")
          //- Filters
          q-list
            //- Keysounded
            q-item
              q-item-section.no-wrap
                .row.align.items-center.q-gutter-y-md
                  .col-12.col-sm-6.col-lg-6 {{ $t('patternsPage.searchForm.keysounded.label') }}
                  .col-12.col-sm-6.col-lg-6
                    .q-gutter-md-xs
                      q-btn(flat :label="$t('patternsPage.searchForm.keysounded.all')" :text-color="keysoundedField === undefined ? 'tech' : 'grey'" @click="keysoundedField = undefined")
                      q-btn(flat :label="$t('patternsPage.searchForm.keysounded.yes')" :text-color="keysoundedField === true ? 'tech' : 'grey'" @click="keysoundedField = true")
                      q-btn(flat :label="$t('patternsPage.searchForm.keysounded.no')" :text-color="keysoundedField === false ? 'tech' : 'grey'" @click="keysoundedField = false")
            //- Controls
            q-item
              q-item-section.no-wrap
                .row.align.items-center.q-gutter-y-md
                  .col-12.col-sm-6.col-lg-6 {{ $t('patternsPage.searchForm.control.label') }}
                  .col-12.col-sm-6.col-lg-6
                    .q-gutter-md-xs
                      template(v-for="(controlOption) in controlOptions" :key="controlOption")
                        q-checkbox(
                          keep-color color="tech"
                          :name="`controls`+controlOption"
                          v-model="controlsField"
                          :val="controlOption"
                          :label="$t('patternsPage.searchForm.control.'+controls[controlOption])"
                        )
            //- Lanes
            q-item
              q-item-section.no-wrap
                .row.align.items-center.q-gutter-y-md
                  .col-12.col-sm-6.col-lg-6 {{ $t('patternsPage.searchForm.lanes.label') }}
                  .col-12.col-sm-6.col-lg-6
                    .q-gutter-md-xs
                      template(v-for="(lanesOption) in lanesOptions" :key="lanesOption")
                        q-checkbox(
                          keep-color color="tech"
                          :name="`lanes`+lanesOption"
                          v-model="lanesField"
                          :val="lanesOption"
                          :label="$t('patternsPage.searchForm.lanes.lanes', { lanes: lanesOption })"
                        )
            //- Sort
            q-item
              q-item-section.no-wrap
                .row.align.items-center.q-gutter-y-md
                  .col-12.col-sm-6.col-lg-6 {{ $t('patternsPage.searchForm.sort.label') }}
                  .col-12.col-sm-6.col-lg-6
                    .q-gutter-md-xs
                      q-btn(flat :label="$t('patternsPage.searchForm.sort.submit')" :icon-right="getSortIcon('createdAt')" :text-color="sortByField === 'createdAt' ? 'tech' : 'grey'" @click="changeSort('createdAt')")
                      q-btn(flat :label="$t('patternsPage.searchForm.sort.update')" :icon-right="getSortIcon('updatedAt')" :text-color="sortByField === 'updatedAt' ? 'tech' : 'grey'" @click="changeSort('updatedAt')")
                      q-btn(flat :label="$t('patternsPage.searchForm.sort.name')" :icon-right="getSortIcon('name')" :text-color="sortByField === 'name' ? 'tech' : 'grey'" @click="changeSort('name')")
                      q-btn(flat :label="$t('patternsPage.searchForm.sort.rating')" :icon-right="getSortIcon('rating')" :text-color="sortByField === 'rating' ? 'tech' : 'grey'" @click="changeSort('rating')")
    q-separator.q-my-md
</template>

<script setup lang="ts">
import type { IPatternSearchForm, IPatternSortBy } from '@/types/pattern'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import { controls, CONTROLTYPE } from '@/utils/control'

const props = defineProps<{
  initialValues: IPatternSearchForm
}>()

const emit = defineEmits<{
  (e: 'search', values: IPatternSearchForm): void
}>()

const lanesOptions = [2, 3, 4]
const controlOptions = [CONTROLTYPE.TOUCH, CONTROLTYPE.KEYS, CONTROLTYPE.KM]

const schema = yup.object<IPatternSearchForm>({
  keywords: yup.string().optional(),
  keysounded: yup.boolean().optional(),
  controls: yup
    .array()
    .of(yup.number<CONTROLTYPE>().oneOf([CONTROLTYPE.TOUCH, CONTROLTYPE.KEYS, CONTROLTYPE.KM]))
    .required(),
  lanes: yup
    .array()
    .of(yup.mixed<2 | 3 | 4>().oneOf([2, 3, 4]))
    .required(),
  sort: yup.number<1 | -1>().required().oneOf([1, -1]),
  sortBy: yup
    .string<IPatternSortBy>()
    .oneOf(['createdAt', 'updatedAt', 'name', 'rating'])
    .required(),
})

const form = useForm({
  validationSchema: schema,
  initialValues: props.initialValues,
})

const [keywordsField] = form.defineField('keywords')
const [keysoundedField] = form.defineField('keysounded')
const [controlsField] = form.defineField('controls')
const [lanesField] = form.defineField('lanes')
const [sortField] = form.defineField('sort')
const [sortByField] = form.defineField('sortBy')

const getSortIcon = (sortBy: IPatternSortBy) => {
  if (sortByField.value === sortBy) return sortField.value > 0 ? 'arrow_drop_up' : 'arrow_drop_down'
  else return undefined
}

const changeSort = (sortBy: IPatternSortBy) => {
  if (sortByField.value === sortBy) form.setFieldValue('sort', (sortField.value * -1) as 1 | -1)
  else {
    form.setFieldValue('sort', -1)
    form.setFieldValue('sortBy', sortBy)
  }
}

// 當表單通過驗證送出時，將資料拋回給父元件
const onFormSubmit = form.handleSubmit((values) => {
  emit('search', values)
})
</script>
