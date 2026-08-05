<template lang="pug">
q-page#patterns
  q-no-ssr.q-mx-auto.padding
    //- Header
    q-parallax.q-mb-xl.header-parallax(:height="200")
      //- Header image background
      template(#media)
        img(src="/assets/header-pattern.png")
      //- Header content
      template(#content)
        h4.text-center {{ $t('patternsPage.title') }}
    //- Search form
    section.q-mx-auto.padding.q-my-md
      .container
        .row
          //- Search form
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
                  //- NOTE:
                  //- Button type Submit in slot does not trigger the submit event
                  //- https://quasar.dev/vue-components/button#controlling-the-button-for-form-submission
                  q-btn(type="button" icon="search" round desnse flat :loading="form.isSubmitting.value" @click="onFormSubmit")
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
    //- Patterns
    section.q-mx-auto.padding.q-my-md
      .container
        .row
          .col-12
            q-infinite-scroll.row.q-my-md.q-col-gutter-md(@load="loadScroll" :offset="200" :disable="scrollDisable" ref="infiniteScrollRef")
              .col-12.col-sm-6.col-md-4.col-lg-3(v-for="pattern in patterns" :key="pattern._id")
                PatternCard(:pattern="pattern" :mine="false")
              template(#loading)
                q-spinner-dots(color="tech" size="40px")
            .text-center.text-body1(v-if="patterns.length === 0 && scrollDisable") {{ $t('patternsPage.notFound') }}
</template>

<script setup lang="ts">
import type { IPatternSortBy } from '@/types/pattern'
import type { IPattern } from '@/types/pattern'
import { useMeta } from 'quasar'
import { useForm } from 'vee-validate'
import { nextTick, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import * as yup from 'yup'
import PatternCard from '@/components/PatternCard.vue'
import { search as searchPatterns } from '@/services/pattern'
import { controls, CONTROLTYPE } from '@/utils/control'
import { handleError } from '@/utils/handleError'

interface IPatternSearchForm {
  keywords: string
  keysounded: boolean | undefined
  controls: [CONTROLTYPE.TOUCH, CONTROLTYPE.KEYS, CONTROLTYPE.KM]
  lanes: (2 | 3 | 4)[]
  sort: 1 | -1
  sortBy: IPatternSortBy
}

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const metaData = () => ({
  title: `TECHMANIA | ${t('patternsPage.title')}`,
  meta: {
    color: {
      name: 'theme-color',
      content: '#E74C3C',
    },
    title: {
      name: 'title',
      content: `TECHMANIA | ${t('patternsPage.title')}`,
    },
    description: {
      name: 'description',
      content: 'Patterns for TECHMANIA.',
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
      content: `TECHMANIA | ${t('patternsPage.title')}`,
    },
    ogDescription: {
      property: 'og:description',
      content: 'Patterns for TECHMANIA.',
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
      content: `TECHMANIA | ${t('patternsPage.title')}`,
    },
    twDescription: {
      name: 'twitter:description',
      content: 'Patterns for TECHMANIA.',
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

// Search form schema lanes select options
const lanesOptions = [2, 3, 4]
const controlOptions = [CONTROLTYPE.TOUCH, CONTROLTYPE.KEYS, CONTROLTYPE.KM]
const initialValues: IPatternSearchForm = {
  keysounded: undefined,
  keywords: '',
  controls: [CONTROLTYPE.TOUCH, CONTROLTYPE.KEYS, CONTROLTYPE.KM],
  lanes: [2, 3, 4],
  sort: -1,
  sortBy: 'createdAt',
}
// Search form validation schema
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
  initialValues,
})
const [keywordsField] = form.defineField('keywords')
const [keysoundedField] = form.defineField('keysounded')
const [controlsField] = form.defineField('controls')
const [lanesField] = form.defineField('lanes')
const [sortField] = form.defineField('sort')
const [sortByField] = form.defineField('sortBy')

// Current search filters for API request
const searchParams = ref<IPatternSearchForm>({
  keysounded: undefined,
  keywords: '',
  controls: [CONTROLTYPE.TOUCH, CONTROLTYPE.KEYS, CONTROLTYPE.KM],
  lanes: [2, 3, 4],
  sort: -1,
  sortBy: 'createdAt',
})

// Infinite scroll disable flag
const scrollDisable = ref(true)

// Is the component mounted?
// Infinite scroll fires load event on mounted
// This will cause a fetch request before we parsed the query parameters
// And patterns will be duplicated
let mounted = false

/**
 * Fetch patterns from API
 * @param start - The start index of the patterns
 */
const fetchPatterns = async (start = 0) => {
  try {
    const { data } = await searchPatterns({
      start,
      keysounded: searchParams.value.keysounded,
      controls: searchParams.value.controls.join(),
      keywords: searchParams.value.keywords,
      lanes: searchParams.value.lanes.join(),
      sort: searchParams.value.sort,
      sortBy: searchParams.value.sortBy,
      limit: 12,
    })
    if (data.result.length > 0) {
      patterns.value = patterns.value.concat(data.result)
      scrollDisable.value = false
    } else {
      scrollDisable.value = true
    }
  } catch (error) {
    handleError(error)
    scrollDisable.value = true
  }
}

/**
 * Load more patterns
 * @param index - The index of the patterns
 * @param done - The callback function
 */
const loadScroll = async (index: number, done: (stop?: boolean) => void) => {
  if (!mounted) return done()
  await fetchPatterns((index - 1) * 12)
  done()
}

/**
 * On search form submit, apply search filters
 */
const applySearch = async (values: IPatternSearchForm) => {
  // Reset patterns
  patterns.value = []
  // Apply search filters
  searchParams.value.keywords = values.keywords
  searchParams.value.keysounded = values.keysounded
  searchParams.value.controls = values.controls
  searchParams.value.lanes = values.lanes
  searchParams.value.sort = values.sort
  searchParams.value.sortBy = values.sortBy
  // Reset infinite scroll disable flag
  scrollDisable.value = true
  // Fetch patterns
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

/**
 * Get the sort icon
 * @param sortBy - The sort by field
 * @returns The icon name
 */
const getSortIcon = (sortBy: IPatternSortBy) => {
  if (sortByField.value === sortBy) return sortField.value > 0 ? 'arrow_drop_up' : 'arrow_drop_down'
  else return undefined
}

/**
 * Change the sort field
 * @param sortBy - The sort by field
 */
const changeSort = (sortBy: IPatternSortBy) => {
  if (sortByField.value === sortBy) form.setFieldValue('sort', (sortField.value * -1) as 1 | -1)
  else {
    form.setFieldValue('sort', -1)
    form.setFieldValue('sortBy', sortBy)
  }
}

const onFormSubmit = form.handleSubmit(applySearch)

onMounted(async () => {
  if (route.query) {
    // Wait for the form to be ready to get template ref
    await nextTick()

    // Parse query parameters
    const querySchema = yup.object({
      keywords: yup.string().default(initialValues.keywords),
      keysounded: yup
        .boolean()
        .optional()
        .transform((value, originalValue) => {
          if (originalValue === 'true') return true
          if (originalValue === 'false') return false
          return undefined
        })
        .default(initialValues.keysounded),
      controls: yup
        .array()
        .of(yup.number<CONTROLTYPE>().oneOf([CONTROLTYPE.TOUCH, CONTROLTYPE.KEYS, CONTROLTYPE.KM]))
        .transform((value, originalValue) => {
          if (typeof originalValue === 'string' && originalValue.length > 0) {
            return originalValue.split(',').map((v) => Number(v))
          }
          return initialValues.controls
        })
        .default(initialValues.controls),
      lanes: yup
        .array<(2 | 3 | 4)[]>()
        .transform((value, originalValue) => {
          if (typeof originalValue === 'string' && originalValue.length > 0) {
            return originalValue.split(',').map((v) => Number(v) as 2 | 3 | 4)
          }
          return initialValues.lanes
        })
        .default(initialValues.lanes),
      sort: yup
        .number<1 | -1>()
        .transform((value) => (Number(value) === 1 ? 1 : -1))
        .default(initialValues.sort),
      sortBy: yup.string<IPatternSortBy>().default(initialValues.sortBy),
    })
    const parsed = querySchema.cast(route.query, { stripUnknown: true }) as IPatternSearchForm

    // Set form values
    form.setValues(parsed)

    // Update query parameters
    await router.replace({
      query: {
        keywords: keywordsField.value,
        keysounded: keysoundedField.value !== undefined ? String(keysoundedField.value) : undefined,
        controls: controlsField.value.join(),
        lanes: lanesField.value.join(),
        sort: sortField.value,
        sortBy: sortByField.value,
      },
    })
    // Apply search filters
    await applySearch(parsed)
  } else {
    // Fetch patterns
    await fetchPatterns()
  }
  mounted = true
})
</script>

<route lang="yaml">
name: patterns
meta:
  login: false
</route>
