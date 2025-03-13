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
        h4.text-center {{ $t('nav.patterns') }}
    //- Search form
    section.q-mx-auto.padding.q-my-md
      .container
        .row
          //- Search form
          .col-12.q-mx-auto
            //- Search form
            Form(v-slot="{ handleSubmit, isSubmitting }" :validation-schema="schema" :initial-values="initialValues" ref="form" as="")
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
                    :placeholder="$t('patterns.search')"
                  )
                    template(#after)
                      //- NOTE:
                      //- Button type Submit in slot does not trigger the submit event
                      //- https://quasar.dev/vue-components/button#controlling-the-button-for-form-submission
                      q-btn(icon="search" round desnse flat @click="handleSubmit($event, onSearchSubmit)" :loading="isSubmitting")
                //- Filters
                q-list
                  //- Keysounded
                  q-item
                    q-item-section {{ $t('pattern.keysounded') }}
                    q-item-section
                      div.q-gutter-xs
                        Field(name="keysounded" v-slot="{ field }")
                          q-btn(flat :label="$t('patterns.all')" :text-color="field.value === '' ? 'tech' : 'grey'" @click="field.onChange('')")
                          q-btn(flat :label="$t('patterns.yes')" :text-color="field.value === 'true' ? 'tech' : 'grey'" @click="field.onChange('true')")
                          q-btn(flat :label="$t('patterns.no')" :text-color="field.value === 'false' ? 'tech' : 'grey'" @click="field.onChange('false')")
                  //- Controls
                  q-item
                    q-item-section {{ $t('submitForm.control') }}
                    q-item-section
                      div.q-gutter-xs
                        template(v-for="(controlOption) in controlOptions" :key="controlOption")
                          Field(name="controls" v-slot="{ field }" type="checkbox" :value="controlOption")
                            q-checkbox(
                              keep-color color="tech"
                              :name="`controls`+controlOption"
                              :model-value="field.checked"
                              @update:model-value="field.onInput($event)"
                              :label="$t('pattern.'+controls[controlOption])"
                            )
                  //- Lanes
                  q-item
                    q-item-section {{ $t('submitForm.lanes') }}
                    q-item-section
                      div.q-gutter-xs
                        template(v-for="(lanesOption) in lanesOptions" :key="lanesOption")
                          Field(name="lanes" v-slot="{ field }" type="checkbox" :value="lanesOption")
                            q-checkbox(
                              keep-color color="tech"
                              :name="`lanes`+lanesOption"
                              :model-value="field.checked"
                              @update:model-value="field.onInput($event)"
                              :label="lanesOption + `L`"
                            )
                  //- Sort
                  q-item
                    q-item-section {{ $t('patterns.sort') }}
                    q-item-section
                      div.q-gutter-xs
                        Field(name="sortBy" v-slot="{ field }")
                          q-btn(flat :label="$t('patterns.sortSubmit')" :icon-right="getSortIcon('createdAt')" :text-color="field.value === 'createdAt' ? 'tech' : 'grey'" @click="changeSort('createdAt')")
                          q-btn(flat :label="$t('patterns.sortUpdate')" :icon-right="getSortIcon('updatedAt')" :text-color="field.value === 'updatedAt' ? 'tech' : 'grey'" @click="changeSort('updatedAt')")
                          q-btn(flat :label="$t('patterns.sortName')" :icon-right="getSortIcon('name')" :text-color="field.value === 'name' ? 'tech' : 'grey'" @click="changeSort('name')")
                          q-btn(flat :label="$t('pattern.rating')" :icon-right="getSortIcon('rating')" :text-color="field.value === 'rating' ? 'tech' : 'grey'" @click="changeSort('rating')")
        q-separator.q-my-md
    //- Patterns
    section.q-mx-auto.padding.q-my-md
      .container
        .row
          .col-12.q-mx-auto
            q-infinite-scroll.row.q-my-md(@load="loadScroll" :offset="200" :disable="scrollDisable")
              .col-xs-12.col-sm-6.col-md-4.col-lg-3.q-pa-md.q-my-xs(v-for="pattern in patterns" :key="pattern.id")
                PatternCard(:pattern="pattern" :mine="false")
              template(#loading)
                q-spinner-dots(color="tech" size="40px")
            .text-center.text-body1(v-if="patterns.length === 0 && scrollDisable") {{ $t('patterns.notFound') }}
    //- Back to top button
    q-page-scroller(position="bottom-right" :scroll-offset="150" :offset="[18, 18]")
      q-btn(fab icon="keyboard_arrow_up" color="tech" text-color="black")
</template>

<script setup>
import { ref, useTemplateRef } from 'vue'
import { useMeta } from 'quasar'
import { useRoute } from 'vue-router'
import * as yup from 'yup'
import { Form, Field } from 'vee-validate'
import PatternCard from 'src/components/PatternCard.vue'
import api from 'src/utils/api'
import { controls, CONTROL_TOUCH, CONTROL_KEYS, CONTROL_KM } from 'src/utils/control'

const route = useRoute()

const metaData = {
  title: 'TECHMANIA | Patterns',
  meta: {
    color: {
      name: 'theme-color',
      content: '#E74C3C',
    },
    title: {
      name: 'title',
      content: 'TECHMANIA | Patterns',
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
      content: new URL(route.fullPath, process.env.HOST_URL).toString(),
    },
    ogTitle: {
      property: 'og:title',
      content: 'TECHMANIA | Patterns',
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
      content: new URL(route.fullPath, process.env.HOST_URL).toString(),
    },
    twTitle: {
      name: 'twitter:title',
      content: 'TECHMANIA | Patterns',
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
}
useMeta(metaData)

const patterns = ref([])

// // Search form schema lanes select options
const lanesOptions = [2, 3, 4]
const controlOptions = [CONTROL_TOUCH, CONTROL_KEYS, CONTROL_KM]
// Search form template ref
const form = useTemplateRef('form')
// Search form validation schema
const schema = yup.object({
  keywords: yup.string(),
  keysounded: yup.string().oneOf(['', 'true', 'false']),
  controls: yup.array().of(yup.number().oneOf([CONTROL_TOUCH, CONTROL_KEYS, CONTROL_KM])),
  lanes: yup.array().of(yup.number().min(2).max(4)),
  sort: yup.number().required().min(-1).max(1),
  sortBy: yup.string().required().oneOf(['createdAt', 'updatedAt', 'name', 'rating']),
})
// Search form initial values
const initialValues = {
  keywords: '',
  keysounded: '',
  controls: [CONTROL_TOUCH, CONTROL_KEYS, CONTROL_KM],
  lanes: [2, 3, 4],
  sort: -1,
  sortBy: 'createdAt',
}

// Current search filters for API request
const search = ref({
  keywords: '',
  keysounded: '',
  controls: [CONTROL_TOUCH, CONTROL_KEYS, CONTROL_KM],
  lanes: [2, 3, 4],
  sort: -1,
  sortBy: 'createdAt',
})
// Infinite scroll disable flag
const scrollDisable = ref(false)

/**
 * Fetch patterns from API
 * @param start - The start index of the patterns
 */
const fetchPatterns = async (start = 0) => {
  try {
    const { data } = await api.get('/patterns', {
      params: {
        start,
        keysounded: search.value.keysounded,
        controls: search.value.controls.join(),
        keywords: search.value.keywords,
        lanes: search.value.lanes.join(),
        sort: search.value.sort,
        sortBy: search.value.sortBy,
        limit: 12,
      },
    })
    if (data.result.length > 0) patterns.value = patterns.value.concat(data.result)
    else scrollDisable.value = true
  } catch (error) {
    console.error(error)
    scrollDisable.value = true
  }
}

/**
 * Load more patterns
 * @param index - The index of the patterns
 * @param done - The callback function
 */
const loadScroll = async (index, done) => {
  await fetchPatterns((index - 1) * 12)
  done()
}

/**
 * On search form submit, apply search filters
 */
const onSearchSubmit = async (values) => {
  // Reset patterns
  patterns.value = []
  // Apply search filters
  search.value.keywords = values.keywords
  search.value.keysounded = values.keysounded
  search.value.controls = values.controls
  search.value.lanes = values.lanes
  search.value.sort = values.sort
  search.value.sortBy = values.sortBy
  // Reset infinite scroll disable flag
  scrollDisable.value = false
  // Fetch patterns
  await fetchPatterns()
}

/**
 * Get the sort icon
 * @param sortBy - The sort by field
 * @returns The icon name
 */
const getSortIcon = (sortBy) => {
  if (!form.value) return undefined
  if (form.value.values.sortBy === sortBy)
    return form.value.values.sort > 0 ? 'arrow_drop_up' : 'arrow_drop_down'
  else return undefined
}

/**
 * Change the sort field
 * @param sortBy - The sort by field
 */
const changeSort = (sortBy) => {
  const currentSortBy = form.value.values.sortBy
  const currentSort = form.value.values.sort
  if (currentSortBy === sortBy) form.value.setFieldValue('sort', currentSort * -1)
  else {
    form.value.setFieldValue('sort', -1)
    form.value.setFieldValue('sortBy', sortBy)
  }
}
</script>
