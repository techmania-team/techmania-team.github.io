<template lang="pug">
q-page#patterns
  q-no-ssr.q-mx-auto.padding
    //- Header
    q-parallax.q-mb-xl.header-parallax(:height="200")
      template(#media)
        img(src="/assets/header-pattern.png")
      template(#content)
        h4.text-center {{ $t('patternsPage.title') }}
    //- SearchForm
    PatternSearchForm(v-if="isReady" :initial-values="searchParams" @search="applySearch")
    //- Patterns
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
              .col-12.col-sm-6.col-md-4.col-lg-3(v-for="pattern in patterns" :key="pattern._id")
                PatternCard(:pattern="pattern" :mine="false")
              template(#loading)
                q-spinner-dots(color="tech" size="40px")
            .text-center.text-body1(v-if="patterns.length === 0 && scrollDisable && isReady") {{ $t('patternsPage.notFound') }}
</template>

<script setup lang="ts">
import type { IPattern, IPatternSearchForm, IPatternSortBy } from '@/types/pattern'
import { useMeta } from 'quasar'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import * as yup from 'yup'
import PatternCard from '@/components/PatternCard.vue'
import PatternSearchForm from '@/components/PatternSearchForm.vue'
import * as patternService from '@/services/pattern'
import { CONTROLTYPE } from '@/utils/control'
import { handleError } from '@/utils/handleError'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const metaData = () => ({
  title: t('patternsPage.meta.title'),
  meta: {
    color: {
      name: 'theme-color',
      content: '#E74C3C',
    },
    title: {
      name: 'title',
      content: t('patternsPage.meta.title'),
      'data-dynamic': true,
    },
    description: {
      name: 'description',
      content: t('patternsPage.meta.description'),
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
      content: t('patternsPage.meta.title'),
      'data-dynamic': true,
    },
    ogDescription: {
      property: 'og:description',
      content: t('patternsPage.meta.description'),
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
      content: t('patternsPage.meta.title'),
      'data-dynamic': true,
    },
    twDescription: {
      name: 'twitter:description',
      content: t('patternsPage.meta.description'),
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

const patterns = ref<IPattern[]>([])
const scrollDisable = ref(true)
const isReady = ref(false)
const isFetching = ref(false)

const defaultInitialValues: IPatternSearchForm = {
  keysounded: undefined,
  keywords: '',
  controls: [CONTROLTYPE.TOUCH, CONTROLTYPE.KEYS, CONTROLTYPE.KM],
  lanes: [2, 3, 4],
  sort: -1,
  sortBy: 'createdAt',
}

const searchParams = ref<IPatternSearchForm>({ ...defaultInitialValues })

const fetchPatterns = async (start = 0) => {
  if (isFetching.value) return
  isFetching.value = true

  try {
    const { data } = await patternService.search({
      start,
      keysounded: searchParams.value.keysounded,
      controls: searchParams.value.controls.join(),
      keywords: searchParams.value.keywords,
      lanes: searchParams.value.lanes.join(),
      sort: searchParams.value.sort,
      sortBy: searchParams.value.sortBy,
      limit: 12,
    })

    patterns.value = patterns.value.concat(data.result)

    if (data.result.length === 12) {
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

const loadScroll = async (index: number, done: (stop?: boolean) => void) => {
  if (!isReady.value) return done()
  await fetchPatterns(patterns.value.length)
  done()
}

const applySearch = async (values: IPatternSearchForm) => {
  patterns.value = []
  searchParams.value = { ...values }
  scrollDisable.value = true

  await fetchPatterns()
  await router.replace({
    query: {
      keywords: values.keywords,
      keysounded: values.keysounded !== undefined ? String(values.keysounded) : undefined,
      controls: values.controls.join(),
      lanes: values.lanes.join(),
      sort: values.sort,
      sortBy: values.sortBy,
    },
  })
}

onMounted(async () => {
  if (Object.keys(route.query).length > 0) {
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

    searchParams.value = querySchema.cast(route.query, { stripUnknown: true }) as IPatternSearchForm

    // 將初始值同步回 URL 確保格式整齊
    await router.replace({
      query: {
        keywords: searchParams.value.keywords,
        keysounded:
          searchParams.value.keysounded !== undefined
            ? String(searchParams.value.keysounded)
            : undefined,
        controls: searchParams.value.controls.join(),
        lanes: searchParams.value.lanes.join(),
        sort: searchParams.value.sort,
        sortBy: searchParams.value.sortBy,
      },
    })
  }

  isReady.value = true
  await fetchPatterns()
})
</script>

<route lang="yaml">
name: patterns
meta:
  login: false
</route>
