<template lang="pug">
q-page#skins
  .q-mx-auto.padding
    //- Header
    q-parallax.q-mb-xl.header-parallax(:height="200")
      template(#media)
        img(src="/assets/header-skin.png")
      template(#content)
        h1.page-title.text-h4.text-center {{ $t('skinsPage.title') }}

    //- 搜尋表單
    SkinSearchForm(:initial-values="searchParams" @search="applySearch")

    //- Skins 列表
    section.q-mx-auto.padding.q-my-md
      .container
        .row
          .col-12
            q-infinite-scroll.row.q-my-md.q-col-gutter-md(
              @load="loadScroll"
              :offset="200"
              :disable="!hasNextPage"
              ref="infiniteScrollRef"
            )
              .col-12.col-sm-6.col-md-4.col-lg-3(v-for="skin in skins" :key="skin._id")
                SkinCard(:skin="skin" :mine="false")
              template(#loading)
                q-spinner-dots(color="tech" size="40px")
            .text-center.text-body1(v-if="!isPending && skins.length === 0") {{ $t('skinsPage.notFound') }}
</template>

<script setup lang="ts">
import type { ISkinSearchForm, ISkinSortBy } from '@/types/skin'
import { useInfiniteQuery } from '@pinia/colada'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import * as yup from 'yup'
import SkinCard from '@/components/SkinCard.vue'
import SkinSearchForm from '@/components/SkinSearchForm.vue'
import { useSeoMeta } from '@/composables/useSeoMeta'
import { skinSearchQuery } from '@/queries/skin'
import { SKINTYPE } from '@/utils/skin'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

useSeoMeta({
  title: () => t('skinsPage.meta.title'),
  description: () => t('skinsPage.meta.description'),
})

const defaultInitialValues: ISkinSearchForm = {
  keywords: '',
  types: [SKINTYPE.NOTE, SKINTYPE.VFX, SKINTYPE.COMBO, SKINTYPE.GAMEUI, SKINTYPE.THEME],
  sort: -1,
  sortBy: 'createdAt',
}

const querySchema = yup.object({
  keywords: yup.string().default(defaultInitialValues.keywords),
  types: yup
    .array()
    .of(
      yup
        .number<SKINTYPE>()
        .oneOf([SKINTYPE.NOTE, SKINTYPE.VFX, SKINTYPE.COMBO, SKINTYPE.GAMEUI, SKINTYPE.THEME]),
    )
    .transform((value, originalValue) => {
      if (typeof originalValue === 'string' && originalValue.length > 0) {
        return originalValue.split(',').map(Number)
      }
      return defaultInitialValues.types
    })
    .default(defaultInitialValues.types),
  sort: yup
    .number<1 | -1>()
    .transform((value) => (Number(value) === 1 ? 1 : -1))
    .default(defaultInitialValues.sort),
  sortBy: yup.string<ISkinSortBy>().default(defaultInitialValues.sortBy),
})

const hasQuery = Object.keys(route.query).length > 0

/**
 * Search filters as URL query
 * @param values - The search filters
 */
const toQuery = (values: ISkinSearchForm) => ({
  keywords: values.keywords,
  types: values.types.join(),
  sort: values.sort,
  sortBy: values.sortBy,
})

// Parsed during setup so the server renders the first page of results too
const searchParams = ref<ISkinSearchForm>(
  hasQuery
    ? (querySchema.cast(route.query, { stripUnknown: true }) as ISkinSearchForm)
    : { ...defaultInitialValues },
)

/**
 * Fetch skins from API
 */
const { data, hasNextPage, isPending, loadNextPage } = useInfiniteQuery(() =>
  skinSearchQuery(searchParams.value),
)

const skins = computed(() => data.value?.pages.flat() ?? [])

/**
 * Load more skins
 * @param index - The index of the skins
 * @param done - The callback function
 */
const loadScroll = async (index: number, done: (stop?: boolean) => void) => {
  if (!hasNextPage.value) return done(true)
  // cancelRefetch: false makes a concurrent trigger await the request that is
  // already running. The default aborts it and starts a new one, which turns
  // repeated q-infinite-scroll triggers into a storm of cancelled requests.
  await loadNextPage({ cancelRefetch: false })
  done(!hasNextPage.value)
}

/**
 * On search form submit, apply search filters
 */
const applySearch = async (values: ISkinSearchForm) => {
  // Changing the params changes the key, which starts the new search on its own
  searchParams.value = { ...values }
  await router.replace({ query: toQuery(values) })
}

onMounted(async () => {
  if (hasQuery) {
    await router.replace({ query: toQuery(searchParams.value) })
  }
})
</script>

<route lang="yaml">
name: skins
meta:
  login: false
</route>
