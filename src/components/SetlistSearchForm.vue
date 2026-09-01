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
            :placeholder="$t('setlistsPage.searchForm.keywords.placeholder')"
          )
            template(#after)
              q-btn(type="button" icon="search" round dense flat :loading="form.isSubmitting.value" @click="onFormSubmit")
          //- Filters
          q-list
            //- Controls
            q-item
              q-item-section.no-wrap
                .row.align.items-center.q-gutter-y-md
                  .col-12.col-sm-6.col-lg-6 {{ $t('setlistsPage.searchForm.control.label') }}
                  .col-12.col-sm-6.col-lg-6
                    .q-gutter-md-xs
                      template(v-for="(controlOption) in controlOptions" :key="controlOption")
                        q-checkbox(
                          keep-color color="tech"
                          :name="`controls`+controlOption"
                          v-model="controlsField"
                          :val="controlOption"
                          :label="$t('setlistsPage.searchForm.control.'+controls[controlOption])"
                        )
            //- Sort
            q-item
              q-item-section.no-wrap
                .row.align.items-center.q-gutter-y-md
                  .col-12.col-sm-6.col-lg-6 {{ $t('setlistsPage.searchForm.sort.label') }}
                  .col-12.col-sm-6.col-lg-6
                    .q-gutter-md-xs
                      q-btn(flat :label="$t('setlistsPage.searchForm.sort.submit')" :icon-right="getSortIcon('createdAt')" :text-color="sortByField === 'createdAt' ? 'tech' : 'grey'" @click="changeSort('createdAt')")
                      q-btn(flat :label="$t('setlistsPage.searchForm.sort.update')" :icon-right="getSortIcon('updatedAt')" :text-color="sortByField === 'updatedAt' ? 'tech' : 'grey'" @click="changeSort('updatedAt')")
                      q-btn(flat :label="$t('setlistsPage.searchForm.sort.name')" :icon-right="getSortIcon('name')" :text-color="sortByField === 'name' ? 'tech' : 'grey'" @click="changeSort('name')")
                      q-btn(flat :label="$t('setlistsPage.searchForm.sort.rating')" :icon-right="getSortIcon('rating')" :text-color="sortByField === 'rating' ? 'tech' : 'grey'" @click="changeSort('rating')")
    q-separator.q-my-md
</template>

<script setup lang="ts">
import type { ISetlistSearchForm, ISetlistSortBy } from '@/types/setlist'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import { controls, CONTROLTYPE } from '@/utils/control'

const props = defineProps<{
  initialValues: ISetlistSearchForm
}>()

const emit = defineEmits<{
  (e: 'search', values: ISetlistSearchForm): void
}>()

const controlOptions = [CONTROLTYPE.TOUCH, CONTROLTYPE.KEYS, CONTROLTYPE.KM]

const schema = yup.object<ISetlistSearchForm>({
  keywords: yup.string().optional(),
  controls: yup
    .array()
    .of(yup.number<CONTROLTYPE>().oneOf(Object.values(CONTROLTYPE) as number[]))
    .required(),
  sort: yup.number<1 | -1>().required().oneOf([1, -1]),
  sortBy: yup
    .string<ISetlistSortBy>()
    .oneOf(['createdAt', 'updatedAt', 'name', 'rating'])
    .required(),
})

const form = useForm({
  validationSchema: schema,
  initialValues: props.initialValues,
})

const [keywordsField] = form.defineField('keywords')
const [controlsField] = form.defineField('controls')
const [sortField] = form.defineField('sort')
const [sortByField] = form.defineField('sortBy')

const getSortIcon = (sortBy: ISetlistSortBy) => {
  if (sortByField.value === sortBy) return sortField.value > 0 ? 'arrow_drop_up' : 'arrow_drop_down'
  else return undefined
}

const changeSort = (sortBy: ISetlistSortBy) => {
  if (sortByField.value === sortBy) form.setFieldValue('sort', (sortField.value * -1) as 1 | -1)
  else {
    form.setFieldValue('sort', -1)
    form.setFieldValue('sortBy', sortBy)
  }
}

const onFormSubmit = form.handleSubmit((values) => {
  emit('search', values)
})
</script>
