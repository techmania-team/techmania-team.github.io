<template lang="pug">
q-page#setlists
  q-no-ssr.q-mx-auto.padding
    //- Header
    q-parallax.q-mb-xl.header-parallax(:height="200")
      //- Header image background
      template(#media)
        img(src="/assets/header-setlist.png")
      //- Header content
      template(#content)
        h4.text-center {{ $t('setlistsPage.title') }}
    //- Search form
    section.q-mx-auto.padding.q-my-md
      .container
        .row
          //- Search form
          .col-12.q-mx-auto
            //- Search form
            Form(v-slot="{ handleSubmit, isSubmitting }" :validation-schema="schema" :initial-values="initialValues" ref="formRef" as="")
              q-form(@submit="handleSubmit(onSearchSubmit)")
                //- Keywords
                Field(name="keywords" v-slot="{ field, errorMessage }")
                  q-input(
                    square outlined color="tech"
                    :model-value="field.value"
                    @update:model-value="field.onChange($event)"
                    @blur="field.onBlur($event)"
                    :error-message="errorMessage"
                    :error="!!errorMessage"
                    :placeholder="$t('setlistsPage.searchForm.keywords.placeholder')"
                  )
                    template(#after)
                      //- NOTE:
                      //- Button type Submit in slot does not trigger the submit event
                      //- https://quasar.dev/vue-components/button#controlling-the-button-for-form-submission
                      q-btn(icon="search" round desnse flat @click="handleSubmit($event, onSearchSubmit)" :loading="isSubmitting")
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
                              Field(name="controls" v-slot="{ field }" type="checkbox" :value="controlOption")
                                q-checkbox(
                                  keep-color color="tech"
                                  :name="`controls`+controlOption"
                                  :model-value="field.checked"
                                  @update:model-value="field.onInput($event)"
                                  :label="$t('setlistsPage.searchForm.control.'+controls[controlOption])"
                                )
                  //- Sort
                  q-item
                    q-item-section.no-wrap
                      .row.align.items-center.q-gutter-y-md
                        .col-12.col-sm-6.col-lg-6 {{ $t('setlistsPage.searchForm.sort.label') }}
                        .col-12.col-sm-6.col-lg-6
                          .q-gutter-md-xs
                            Field(name="sortBy" v-slot="{ field }")
                              q-btn(flat :label="$t('setlistsPage.searchForm.sort.submit')" :icon-right="getSortIcon('createdAt')" :text-color="field.value === 'createdAt' ? 'tech' : 'grey'" @click="changeSort('createdAt')")
                              q-btn(flat :label="$t('setlistsPage.searchForm.sort.update')" :icon-right="getSortIcon('updatedAt')" :text-color="field.value === 'updatedAt' ? 'tech' : 'grey'" @click="changeSort('updatedAt')")
                              q-btn(flat :label="$t('setlistsPage.searchForm.sort.name')" :icon-right="getSortIcon('name')" :text-color="field.value === 'name' ? 'tech' : 'grey'" @click="changeSort('name')")
                              q-btn(flat :label="$t('setlistsPage.searchForm.sort.rating')" :icon-right="getSortIcon('rating')" :text-color="field.value === 'rating' ? 'tech' : 'grey'" @click="changeSort('rating')")
        q-separator.q-my-md
    //- Setlists
    section.q-mx-auto.padding.q-my-md
      .container
        .row
          .col-12
            q-infinite-scroll.row.q-my-md.q-col-gutter-md(@load="loadScroll" :offset="200" :disable="scrollDisable" ref="infiniteScrollRef")
              .col-12.col-sm-6.col-md-4.col-lg-3(v-for="setlist in setlists" :key="setlist._id")
                SetlistCard(:setlist="setlist" :mine="false")
              template(#loading)
                q-spinner-dots(color="tech" size="40px")
            .text-center.text-body1(v-if="setlists.length === 0 && scrollDisable") {{ $t('setlistsPage.notFound') }}
</template>

<script setup>
import { ref, useTemplateRef, onMounted, nextTick } from 'vue'
import { useMeta } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import * as yup from 'yup'
import { Form, Field } from 'vee-validate'
import { useI18n } from 'vue-i18n'
import SetlistCard from 'src/components/SetlistCard.vue'
import api from 'src/utils/api'
import handleError from 'src/utils/handleError'
import { controls, CONTROL_TOUCH, CONTROL_KEYS, CONTROL_KM } from 'src/utils/control'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const metaData = () => ({
  title: `TECHMANIA | ${t('setlistsPage.title')}`,
  meta: {
    color: {
      name: 'theme-color',
      content: '#E74C3C',
    },
    title: {
      name: 'title',
      content: `TECHMANIA | ${t('setlistsPage.title')}`,
    },
    description: {
      name: 'description',
      content: 'Setlists for TECHMANIA.',
    },
    ogType: {
      property: 'og:type',
      content: 'website',
    },
    ogUrl: {
      property: 'og:url',
      content: new URL(route.fullPath, process.env.HOST_URL).toString(),
    },
    ogTitle: {
      property: 'og:title',
      content: `TECHMANIA | ${t('setlistsPage.title')}`,
    },
    ogDescription: {
      property: 'og:description',
      content: 'Setlists for TECHMANIA.',
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
      content: new URL(route.fullPath, process.env.HOST_URL).toString(),
    },
    twTitle: {
      name: 'twitter:title',
      content: `TECHMANIA | ${t('setlistsPage.title')}`,
    },
    twDescription: {
      name: 'twitter:description',
      content: 'Setlists for TECHMANIA.',
    },
    twImage: {
      name: 'twitter:image',
      content:
        'https://raw.githubusercontent.com/techmania-team/techmania-team.github.io/master/public/assets/Logo_black.png',
    },
  },
})
useMeta(metaData)

const setlists = ref([])

const controlOptions = [CONTROL_TOUCH, CONTROL_KEYS, CONTROL_KM]

// Search form template ref
const formRef = useTemplateRef('formRef')
// Search form initial values
const initialValues = {
  keywords: '',
  controls: [CONTROL_TOUCH, CONTROL_KEYS, CONTROL_KM],
  sort: -1,
  sortBy: 'createdAt',
}
// Search form validation schema
const schema = yup
  .object({
    keywords: yup.string(),
    controls: yup.array().of(yup.number().oneOf([CONTROL_TOUCH, CONTROL_KEYS, CONTROL_KM])),
    sort: yup.number().required().min(-1).max(1),
    sortBy: yup.string().required().oneOf(['createdAt', 'updatedAt', 'name', 'rating']),
  })
  .default(initialValues)
// Current search filters for API request
const search = ref({
  keywords: '',
  controls: [CONTROL_TOUCH, CONTROL_KEYS, CONTROL_KM],
  sort: -1,
  sortBy: 'createdAt',
})

// Infinite scroll disable flag
const scrollDisable = ref(true)

// Is the component mounted?
// Infinite scroll fires load event on mounted
// This will cause a fetch request before we parsed the query parameters
// And setlists will be duplicated
let mounted = false

/**
 * Fetch setlists from API
 * @param start - The start index of the setlists
 */
const fetchSetlists = async (start = 0) => {
  try {
    const { data } = await api.get('/setlists', {
      params: {
        start,
        keywords: search.value.keywords,
        controls: search.value.controls.join(),
        sort: search.value.sort,
        sortBy: search.value.sortBy,
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
  }
}

/**
 * Load more setlists
 * @param index - The index of the setlists
 * @param done - The callback function
 */
const loadScroll = async (index, done) => {
  if (!mounted) return done()
  await fetchSetlists((index - 1) * 12)
  done()
}

/**
 * On search form submit, apply search filters
 */
const onSearchSubmit = async (values) => {
  // Reset setlists
  setlists.value = []
  // Apply search filters
  search.value.keywords = values.keywords
  search.value.controls = values.controls
  search.value.sort = values.sort
  search.value.sortBy = values.sortBy
  // Reset infinite scroll disable flag
  scrollDisable.value = true
  // Fetch setlists
  await fetchSetlists()
  router.replace({
    query: {
      keywords: values.keywords,
      controls: values.controls.join(),
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
const getSortIcon = (sortBy) => {
  if (!formRef.value) return undefined
  if (formRef.value.values.sortBy === sortBy)
    return formRef.value.values.sort > 0 ? 'arrow_drop_up' : 'arrow_drop_down'
  else return undefined
}

/**
 * Change the sort field
 * @param sortBy - The sort by field
 */
const changeSort = (sortBy) => {
  const currentSortBy = formRef.value.values.sortBy
  const currentSort = formRef.value.values.sort
  if (currentSortBy === sortBy) formRef.value.setFieldValue('sort', currentSort * -1)
  else {
    formRef.value.setFieldValue('sort', -1)
    formRef.value.setFieldValue('sortBy', sortBy)
  }
}

onMounted(async () => {
  if (route.query) {
    // Wait for the form to be ready to get template ref
    await nextTick()

    // Parse query parameters
    const values = {
      keywords: route.query.keywords || initialValues.keywords,
      controls: route.query.controls ? route.query.controls.split(',') : initialValues.controls,
      sort: route.query.sort || initialValues.sort,
      sortBy: route.query.sortBy || initialValues.sortBy,
    }
    const parsed = schema.cast(values, { stripUnknown: true })

    // Set form values
    formRef.value.setValues(parsed)

    // Update query parameters
    router.replace({
      query: {
        keywords: formRef.value.values.keywords,
        controls: formRef.value.values.controls.join(),
        sort: formRef.value.values.sort,
        sortBy: formRef.value.values.sortBy,
      },
    })
    // Apply search filters
    await onSearchSubmit(parsed)
  } else {
    // Fetch setlists
    await fetchSetlists()
  }
  mounted = true
})
</script>
