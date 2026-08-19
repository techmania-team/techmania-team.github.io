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
              :disable="scrollDisable"
              ref="infiniteScrollRef"
            )
              .col-12.col-sm-6.col-md-4.col-lg-3(v-for="setlist in setlists" :key="setlist._id")
                SetlistCard(:setlist="setlist" :mine="false")
              template(#loading)
                q-spinner-dots(color="tech" size="40px")
            .text-center.text-body1(v-if="setlists.length === 0 && scrollDisable && isReady") {{ $t('setlistsPage.notFound') }}
</template>

<script setup lang="ts">
import type { ISetlist, ISetlistSearchForm, ISetlistSortBy } from '@/types/setlist'
import { useMeta } from 'quasar'
import { nextTick, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import * as yup from 'yup'
import SetlistCard from '@/components/SetlistCard.vue'
import SetlistSearchForm from '@/components/SetlistSearchForm.vue'
import api from '@/utils/api'
import { CONTROLTYPE } from '@/utils/control'
import { handleError } from '@/utils/handleError'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

// SEO MetaData
const metaData = () => ({
  title: `TECHMANIA | ${t('setlistsPage.title')}`,
  meta: {
    color: { name: 'theme-color', content: '#E74C3C' },
    title: { name: 'title', content: `TECHMANIA | ${t('setlistsPage.title')}` },
    description: { name: 'description', content: 'Setlists for TECHMANIA.' },
    ogType: { property: 'og:type', content: 'website' },
    ogUrl: {
      property: 'og:url',
      content: new URL(route.fullPath, import.meta.env.QCLI_HOST_URL).toString(),
    },
    ogTitle: { property: 'og:title', content: `TECHMANIA | ${t('setlistsPage.title')}` },
    ogDescription: { property: 'og:description', content: 'Setlists for TECHMANIA.' },
    ogImage: {
      property: 'og:image',
      content:
        'https://raw.githubusercontent.com/techmania-team/techmania-team.github.io/master/public/assets/Logo_black.png',
    },
    twCard: { name: 'twitter:card', content: 'summary_large_image' },
    twUrl: {
      name: 'twitter:url',
      content: new URL(route.fullPath, import.meta.env.QCLI_HOST_URL).toString(),
    },
    twTitle: { name: 'twitter:title', content: `TECHMANIA | ${t('setlistsPage.title')}` },
    twDescription: { name: 'twitter:description', content: 'Setlists for TECHMANIA.' },
    twImage: {
      name: 'twitter:image',
      content:
        'https://raw.githubusercontent.com/techmania-team/techmania-team.github.io/master/public/assets/Logo_black.png',
    },
  },
})
useMeta(metaData)

const setlists = ref<ISetlist[]>([])
const scrollDisable = ref(true)
const isReady = ref(false)
const isFetching = ref(false)

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
const fetchSetlists = async (start = 0) => {
  if (isFetching.value) return
  isFetching.value = true

  try {
    const { data } = await api.get('/setlists', {
      params: {
        start,
        keywords: searchParams.value.keywords,
        controls: searchParams.value.controls.join(),
        sort: searchParams.value.sort,
        sortBy: searchParams.value.sortBy,
        limit: 12,
      },
    })
    if (data.result.length > 0) {
      setlists.value = setlists.value.concat(data.result)
      scrollDisable.value = false
    } else {
      scrollDisable.value = true
    }
  } catch (error) {
    handleError(error)
    scrollDisable.value = true
  } finally {
    isFetching.value = false
  }
}

/**
 * Load more setlists
 */
const loadScroll = async (index: number, done: (stop?: boolean) => void) => {
  if (!isReady.value) return done()
  await fetchSetlists(setlists.value.length)
  done()
}

/**
 * On search form submit, apply search filters
 */
const applySearch = async (values: ISetlistSearchForm) => {
  setlists.value = []
  searchParams.value = { ...values }
  scrollDisable.value = true

  await fetchSetlists()
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
  await fetchSetlists()
})
</script>

<route lang="yaml">
name: setlists
meta:
  login: false
</route>
