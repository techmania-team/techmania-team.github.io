<template lang="pug">
q-page#skins
  q-no-ssr.q-mx-auto.padding
    //- Header
    q-parallax.q-mb-xl.header-parallax(:height="200")
      template(#media)
        img(src="/assets/header-skin.png")
      template(#content)
        h4.text-center {{ $t('skinsPage.title') }}

    //- 搜尋表單
    SkinSearchForm(v-if="isReady" :initial-values="searchParams" @search="applySearch")

    //- Skins 列表
    section.q-mx-auto.padding.q-my-md
      .container
        .row
          .col-12
            q-infinite-scroll.row.q-my-md.q-col-gutter-md(
              v-if="isReady"
              @load="loadScroll"
              :offset="200"
              :disable="!hasNextPage"
              ref="infiniteScrollRef"
            )
              .col-12.col-sm-6.col-md-4.col-lg-3(v-for="skin in skins" :key="skin._id")
                SkinCard(:skin="skin" :mine="false")
              template(#loading)
                q-spinner-dots(color="tech" size="40px")
            .text-center.text-body1(v-if="isReady && !isPending && skins.length === 0") {{ $t('skinsPage.notFound') }}
</template>

<script setup lang="ts">
import type { ISkin, ISkinSearchForm, ISkinSortBy } from '@/types/skin'
import { useInfiniteQuery } from '@pinia/colada'
import { useMeta } from 'quasar'
import { computed, nextTick, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import * as yup from 'yup'
import SkinCard from '@/components/SkinCard.vue'
import SkinSearchForm from '@/components/SkinSearchForm.vue'
import * as skinService from '@/services/skin'
import { SKINTYPE } from '@/utils/skin'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const metaData = () => ({
  title: t('skinsPage.meta.title'),
  meta: {
    color: {
      name: 'theme-color',
      content: '#E74C3C',
    },
    title: {
      name: 'title',
      content: t('skinsPage.meta.title'),
      'data-dynamic': true,
    },
    description: {
      name: 'description',
      content: t('skinsPage.meta.description'),
      'data-dynamic': true,
    },
    ogType: {
      property: 'og:type',
      content: 'website',
    },
    ogUrl: {
      property: 'og:url',
      content: new URL(route.fullPath, import.meta.env.QCLI_HOST_URL).toString(),
    },
    ogTitle: {
      property: 'og:title',
      content: t('skinsPage.meta.title'),
      'data-dynamic': true,
    },
    ogDescription: {
      property: 'og:description',
      content: t('skinsPage.meta.description'),
      'data-dynamic': true,
    },
    ogImage: {
      property: 'og:image',
      content:
        'https://raw.githubusercontent.com/techmania-team/techmania-team.github.io/master/public/assets/Logo_black.png',
    },
    twCard: {
      name: 'twitter:card',
      content: 'summary_large_image',
    },
    twUrl: {
      name: 'twitter:url',
      content: new URL(route.fullPath, import.meta.env.QCLI_HOST_URL).toString(),
    },
    twTitle: {
      name: 'twitter:title',
      content: t('skinsPage.meta.title'),
      'data-dynamic': true,
    },
    twDescription: {
      name: 'twitter:description',
      content: t('skinsPage.meta.description'),
      'data-dynamic': true,
    },
    twImage: {
      name: 'twitter:image',
      content:
        'https://raw.githubusercontent.com/techmania-team/techmania-team.github.io/master/public/assets/Logo_black.png',
    },
  },
})
useMeta(metaData)

const PAGE_SIZE = 12

const isReady = ref(false)

const defaultInitialValues: ISkinSearchForm = {
  keywords: '',
  types: [SKINTYPE.NOTE, SKINTYPE.VFX, SKINTYPE.COMBO, SKINTYPE.GAMEUI, SKINTYPE.THEME],
  sort: -1,
  sortBy: 'createdAt',
}

const searchParams = ref<ISkinSearchForm>({ ...defaultInitialValues })

/**
 * Fetch skins from API
 * @param start - The start index of the skins
 */
// The search parameters are part of the key, so every distinct search gets
// its own cache entry and going back to a previous one is instant.
// `enabled` holds the first fetch until the URL query has been parsed,
// otherwise we would fetch once with the defaults and again with the real ones.
const { data, hasNextPage, isPending, loadNextPage } = useInfiniteQuery({
  key: () => ['skins', 'search', searchParams.value],
  enabled: () => isReady.value,
  initialPageParam: 0,
  query: async ({ pageParam }) =>
    (
      await skinService.search({
        start: pageParam,
        types: searchParams.value.types.join(),
        keywords: searchParams.value.keywords,
        sort: searchParams.value.sort,
        sortBy: searchParams.value.sortBy,
        limit: PAGE_SIZE,
      })
    ).data.result,
  // A short page means we reached the end
  getNextPageParam: (lastPage: ISkin[], _allPages, lastPageParam) =>
    lastPage.length === PAGE_SIZE ? lastPageParam + PAGE_SIZE : undefined,
})

const skins = computed(() => data.value?.pages.flat() ?? [])

/**
 * Load more skins
 * @param index - The index of the skins
 * @param done - The callback function
 */
const loadScroll = async (index: number, done: (stop?: boolean) => void) => {
  if (!isReady.value || !hasNextPage.value) return done(true)
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

  await router.replace({
    query: {
      keywords: values.keywords,
      types: values.types.join(),
      sort: values.sort,
      sortBy: values.sortBy,
    },
  })
}

onMounted(async () => {
  await nextTick()

  if (Object.keys(route.query).length > 0) {
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

    searchParams.value = querySchema.cast(route.query, { stripUnknown: true }) as ISkinSearchForm

    await router.replace({
      query: {
        keywords: searchParams.value.keywords,
        types: searchParams.value.types.join(),
        sort: searchParams.value.sort,
        sortBy: searchParams.value.sortBy,
      },
    })
  }

  isReady.value = true
})
</script>

<route lang="yaml">
name: skins
meta:
  login: false
</route>
