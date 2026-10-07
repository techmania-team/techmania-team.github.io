<template lang="pug">
q-page#patterns
  .q-mx-auto.padding
    //- Header
    q-parallax.q-mb-xl.header-parallax(:height="200")
      template(#media)
        img(src="/assets/header-pattern.png")
      template(#content)
        h1.page-title.text-h4.text-center {{ $t('patternsPage.title') }}
    //- SearchForm
    PatternSearchForm(:initial-values="searchParams" @search="applySearch")
    //- Patterns
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
              .col-12.col-sm-6.col-md-4.col-lg-3(v-for="pattern in patterns" :key="pattern._id")
                PatternCard(:pattern="pattern" :mine="false")
              template(#loading)
                q-spinner-dots(color="tech" size="40px")
            .text-center.text-body1(v-if="!isPending && patterns.length === 0") {{ $t('patternsPage.notFound') }}
</template>

<script setup lang="ts">
import type { IPatternSearchForm, IPatternSortBy } from '@/types/pattern'
import { useInfiniteQuery } from '@pinia/colada'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import * as yup from 'yup'
import PatternCard from '@/components/PatternCard.vue'
import PatternSearchForm from '@/components/PatternSearchForm.vue'
import { useSeoMeta } from '@/composables/useSeoMeta'
import { patternSearchQuery } from '@/queries/pattern'
import { CONTROLTYPE } from '@/utils/control'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

useSeoMeta({
  title: () => t('patternsPage.meta.title'),
  description: () => t('patternsPage.meta.description'),
})

const defaultInitialValues: IPatternSearchForm = {
  keysounded: undefined,
  keywords: '',
  controls: [CONTROLTYPE.TOUCH, CONTROLTYPE.KEYS, CONTROLTYPE.KM],
  lanes: [2, 3, 4],
  sort: -1,
  sortBy: 'createdAt',
}

const querySchema = yup.object({
  keywords: yup.string().default(defaultInitialValues.keywords),
  keysounded: yup
    .boolean()
    .optional()
    .transform((value, originalValue) => {
      if (originalValue === 'true') return true
      if (originalValue === 'false') return false
      return undefined
    })
    .default(defaultInitialValues.keysounded),
  controls: yup
    .array()
    .of(yup.number<CONTROLTYPE>().oneOf([CONTROLTYPE.TOUCH, CONTROLTYPE.KEYS, CONTROLTYPE.KM]))
    .transform((value, originalValue) => {
      if (typeof originalValue === 'string' && originalValue.length > 0) {
        return originalValue.split(',').map(Number)
      }
      return defaultInitialValues.controls
    })
    .default(defaultInitialValues.controls),
  lanes: yup
    .array<(2 | 3 | 4)[]>()
    .transform((value, originalValue) => {
      if (typeof originalValue === 'string' && originalValue.length > 0) {
        return originalValue.split(',').map((v) => Number(v) as 2 | 3 | 4)
      }
      return defaultInitialValues.lanes
    })
    .default(defaultInitialValues.lanes),
  sort: yup
    .number<1 | -1>()
    .transform((value) => (Number(value) === 1 ? 1 : -1))
    .default(defaultInitialValues.sort),
  sortBy: yup.string<IPatternSortBy>().default(defaultInitialValues.sortBy),
})

const hasQuery = Object.keys(route.query).length > 0

const toQuery = (values: IPatternSearchForm) => ({
  keywords: values.keywords,
  keysounded: values.keysounded !== undefined ? String(values.keysounded) : undefined,
  controls: values.controls.join(),
  lanes: values.lanes.join(),
  sort: values.sort,
  sortBy: values.sortBy,
})

// Parsed during setup so the server renders the first page of results too
const searchParams = ref<IPatternSearchForm>(
  hasQuery
    ? (querySchema.cast(route.query, { stripUnknown: true }) as IPatternSearchForm)
    : { ...defaultInitialValues },
)

const { data, hasNextPage, isPending, loadNextPage } = useInfiniteQuery(() =>
  patternSearchQuery(searchParams.value),
)

const patterns = computed(() => data.value?.pages.flat() ?? [])

const loadScroll = async (index: number, done: (stop?: boolean) => void) => {
  if (!hasNextPage.value) return done(true)
  // cancelRefetch: false makes a concurrent trigger await the request that is
  // already running. The default aborts it and starts a new one, which turns
  // repeated q-infinite-scroll triggers into a storm of cancelled requests.
  await loadNextPage({ cancelRefetch: false })
  done(!hasNextPage.value)
}

// Changing the params changes the key, which starts the new search on its own
const applySearch = async (values: IPatternSearchForm) => {
  searchParams.value = { ...values }
  await router.replace({ query: toQuery(values) })
}

onMounted(async () => {
  // 將初始值同步回 URL 確保格式整齊
  if (hasQuery) {
    await router.replace({ query: toQuery(searchParams.value) })
  }
})
</script>

<route lang="yaml">
name: patterns
meta:
  login: false
</route>
