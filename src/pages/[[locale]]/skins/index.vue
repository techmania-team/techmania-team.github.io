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
              :disable="scrollDisable"
              ref="infiniteScrollRef"
            )
              .col-12.col-sm-6.col-md-4.col-lg-3(v-for="skin in skins" :key="skin._id")
                SkinCard(:skin="skin" :mine="false")
              template(#loading)
                q-spinner-dots(color="tech" size="40px")
            .text-center.text-body1(v-if="skins.length === 0 && scrollDisable && isReady") {{ $t('skinsPage.notFound') }}
</template>

<script setup lang="ts">
import type { ISkin, ISkinSearchForm, ISkinSortBy } from '@/types/skin'
import { useMeta } from 'quasar'
import { nextTick, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import * as yup from 'yup'
import SkinCard from '@/components/SkinCard.vue'
import SkinSearchForm from '@/components/SkinSearchForm.vue'
import * as skinService from '@/services/skin'
import { handleError } from '@/utils/handleError'
import { SKINTYPE } from '@/utils/skin'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const metaData = () => ({
  title: `TECHMANIA | ${t('skinsPage.title')}`,
  meta: {
    color: {
      name: 'theme-color',
      content: '#E74C3C',
    },
    title: {
      name: 'title',
      content: `TECHMANIA | ${t('skinsPage.title')}`,
    },
    description: {
      name: 'description',
      content: 'Skins for TECHMANIA.',
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
      content: `TECHMANIA | ${t('skinsPage.title')}`,
    },
    ogDescription: {
      property: 'og:description',
      content: 'Skins for TECHMANIA.',
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
      content: `TECHMANIA | ${t('skinsPage.title')}`,
    },
    twDescription: {
      name: 'twitter:description',
      content: 'Skins for TECHMANIA.',
    },
    twImage: {
      name: 'twitter:image',
      content:
        'https://raw.githubusercontent.com/techmania-team/techmania-team.github.io/master/public/assets/Logo_black.png',
    },
  },
})
useMeta(metaData)

const skins = ref<ISkin[]>([])
const scrollDisable = ref(true)
const isReady = ref(false)
const isFetching = ref(false)

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
const fetchSkins = async (start = 0) => {
  if (isFetching.value) return
  isFetching.value = true

  try {
    const { data } = await skinService.search({
      start,
      types: searchParams.value.types.join(),
      keywords: searchParams.value.keywords,
      sort: searchParams.value.sort,
      sortBy: searchParams.value.sortBy,
      limit: 12,
    })

    skins.value = skins.value.concat(data.result)

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

/**
 * Load more skins
 * @param index - The index of the skins
 * @param done - The callback function
 */
const loadScroll = async (index: number, done: (stop?: boolean) => void) => {
  if (!isReady.value) return done()
  await fetchSkins(skins.value.length)
  done()
}

/**
 * On search form submit, apply search filters
 */
const applySearch = async (values: ISkinSearchForm) => {
  skins.value = []
  searchParams.value = { ...values }
  scrollDisable.value = true

  await fetchSkins()
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
  await fetchSkins()
})
</script>

<route lang="yaml">
name: skins
meta:
  login: false
</route>
