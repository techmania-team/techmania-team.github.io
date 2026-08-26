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
            :placeholder="$t('skinsPage.searchForm.keywords.placeholder')"
          )
            template(#after)
              q-btn(type="button" icon="search" round dense flat :loading="form.isSubmitting.value" @click="onFormSubmit")
          //- Filters
          q-list
            //- Types
            q-item
              q-item-section.no-wrap
                .row.align.items-center.q-gutter-y-md
                  .col-12.col-sm-6.col-lg-6 {{ $t('skinsPage.searchForm.type.label') }}
                  .col-12.col-sm-6.col-lg-6
                    .q-gutter-md-xs
                      template(v-for="(typeOption) in typeOptions" :key="typeOption")
                        q-checkbox(
                          keep-color color="tech"
                          :name="`types`+typeOption"
                          v-model="typesField"
                          :val="typeOption"
                          :label="$t('skinsPage.searchForm.type.'+SKINTYPES[typeOption])"
                        )
            //- Sort
            q-item
              q-item-section.no-wrap
                .row.align.items-center.q-gutter-y-md
                  .col-12.col-sm-6.col-lg-6 {{ $t('skinsPage.searchForm.sort.label') }}
                  .col-12.col-sm-6.col-lg-6
                    .q-gutter-md-xs
                      q-btn(flat :label="$t('skinsPage.searchForm.sort.submit')" :icon-right="getSortIcon('createdAt')" :text-color="sortByField === 'createdAt' ? 'tech' : 'grey'" @click="changeSort('createdAt')")
                      q-btn(flat :label="$t('skinsPage.searchForm.sort.update')" :icon-right="getSortIcon('updatedAt')" :text-color="sortByField === 'updatedAt' ? 'tech' : 'grey'" @click="changeSort('updatedAt')")
                      q-btn(flat :label="$t('skinsPage.searchForm.sort.name')" :icon-right="getSortIcon('name')" :text-color="sortByField === 'name' ? 'tech' : 'grey'" @click="changeSort('name')")
                      q-btn(flat :label="$t('skinsPage.searchForm.sort.rating')" :icon-right="getSortIcon('rating')" :text-color="sortByField === 'rating' ? 'tech' : 'grey'" @click="changeSort('rating')")
    q-separator.q-my-md
</template>

<script setup lang="ts">
import type { ISkinSearchForm, ISkinSortBy } from '@/types/skin'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import { SKINTYPE, SKINTYPES } from '@/utils/skin'

const props = defineProps<{
  initialValues: ISkinSearchForm
}>()

const emit = defineEmits<{
  (e: 'search', values: ISkinSearchForm): void
}>()

const typeOptions = [SKINTYPE.NOTE, SKINTYPE.VFX, SKINTYPE.COMBO, SKINTYPE.GAMEUI, SKINTYPE.THEME]

const schema = yup.object<ISkinSearchForm>({
  keywords: yup.string().optional(),
  types: yup
    .array()
    .of(yup.number<SKINTYPE>().oneOf(Object.values(SKINTYPE) as number[]))
    .required(),
  sort: yup.number<1 | -1>().required().oneOf([1, -1]),
  sortBy: yup.string<ISkinSortBy>().oneOf(['createdAt', 'updatedAt', 'name', 'rating']).required(),
})

const form = useForm({
  validationSchema: schema,
  initialValues: props.initialValues,
})

const [keywordsField] = form.defineField('keywords')
const [typesField] = form.defineField('types')
const [sortField] = form.defineField('sort')
const [sortByField] = form.defineField('sortBy')

const getSortIcon = (sortBy: ISkinSortBy) => {
  if (sortByField.value === sortBy) return sortField.value > 0 ? 'arrow_drop_up' : 'arrow_drop_down'
  else return undefined
}

const changeSort = (sortBy: ISkinSortBy) => {
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
