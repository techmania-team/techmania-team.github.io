<template lang="pug">
q-page#setlists
  q-no-ssr.q-mx-auto.padding
    //- Header
    q-parallax.q-mb-xl.header-parallax(:height="200")
      template(#media)
        img(src="/assets/header-setlist.png")
      template(#content)
        h4.text-center {{ $t('setlistsPage.title') }}

    //- 搜尋表單
    SetlistSearchForm(v-if="isReady" :initial-values="searchParams" @search="applySearch")

    //- Setlists 列表
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
              .col-12.col-sm-6.col-md-4.col-lg-3(v-for="setlist in setlists" :key="setlist._id")
                SetlistCard(:setlist="setlist" :mine="false")
              template(#loading)
                q-spinner-dots(color="tech" size="40px")
            .text-center.text-body1(v-if="isReady && !isPending && setlists.length === 0") {{ $t('setlistsPage.notFound') }}
</template>

<script setup lang="ts">
import type { ISetlistSearchForm, ISetlistSortBy } from '@/types/setlist'
import { useInfiniteQuery } from '@pinia/colada'
import { useMeta } from 'quasar'
import { computed, nextTick, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import * as yup from 'yup'
import SetlistCard from '@/components/SetlistCard.vue'
import SetlistSearchForm from '@/components/SetlistSearchForm.vue'
import { setlistSearchQuery } from '@/queries/setlist'
import { CONTROLTYPE } from '@/utils/control'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

// SEO MetaData
const metaData = () => ({
  title: t('setlistsPage.meta.title'),
  meta: {
    color: {
      name: 'theme-color',
      content: '#E74C3C',
    },
    title: {
      name: 'title',
      content: t('setlistsPage.meta.title'),
      'data-dynamic': true,
    },
    description: {
      name: 'description',
      content: t('setlistsPage.meta.description'),
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
      content: t('setlistsPage.meta.title'),
      'data-dynamic': true,
    },
    ogDescription: {
      property: 'og:description',
      content: t('setlistsPage.meta.description'),
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
      content: t('setlistsPage.meta.title'),
      'data-dynamic': true,
    },
    twDescription: {
      name: 'twitter:description',
      content: t('setlistsPage.meta.description'),
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

const isReady = ref(false)

const defaultInitialValues: ISetlistSearchForm = {
  keywords: '',
  controls: [CONTROLTYPE.TOUCH, CONTROLTYPE.KEYS, CONTROLTYPE.KM],
  sort: -1,
  sortBy: 'createdAt',
}

const searchParams = ref<ISetlistSearchForm>({ ...defaultInitialValues })

/**
 * Fetch setlists from API
 */
// `enabled` holds the first fetch until the URL query has been parsed,
// otherwise we would fetch once with the defaults and again with the real ones
const { data, hasNextPage, isPending, loadNextPage } = useInfiniteQuery(() => ({
  ...setlistSearchQuery(searchParams.value),
  enabled: isReady.value,
}))

const setlists = computed(() => data.value?.pages.flat() ?? [])

/**
 * Load more setlists
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
const applySearch = async (values: ISetlistSearchForm) => {
  // Changing the params changes the key, which starts the new search on its own
  searchParams.value = { ...values }

  await router.replace({
    query: {
      keywords: values.keywords,
      controls: values.controls.join(),
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
      sort: yup
        .number<1 | -1>()
        .transform((value) => (Number(value) === 1 ? 1 : -1))
        .default(defaultInitialValues.sort),
      sortBy: yup.string<ISetlistSortBy>().default(defaultInitialValues.sortBy),
    })

    searchParams.value = querySchema.cast(route.query, { stripUnknown: true }) as ISetlistSearchForm

    await router.replace({
      query: {
        keywords: searchParams.value.keywords,
        controls: searchParams.value.controls.join(),
        sort: searchParams.value.sort,
        sortBy: searchParams.value.sortBy,
      },
    })
  }

  isReady.value = true
})
</script>

<route lang="yaml">
name: setlists
meta:
  login: false
</route>
