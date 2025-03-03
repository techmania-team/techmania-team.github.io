<template lang="pug">
q-page#patterns
  section.q-mx-auto.padding
    .container
      .row
        .col-12.q-mx-auto
          h4.text-center {{ $t('nav.patterns') }}
          q-separator.q-my-md
          br
          q-input(rounded outlined v-model="searchForm.keywords" :placeholder="$t('patterns.search')" @keydown.enter="applySearch")
            template(#after)
              q-btn(icon="search" round desnse flat @click="applySearch")
          br
          q-list.search
            q-item
              q-item-section {{ $t('pattern.keysounded') }}
              q-item-section
                div
                  q-btn(flat size="10px" :label="$t('patterns.all')" :text-color="searchForm.keysounded === -1 ? 'white' : 'grey'" @click="searchForm.keysounded = -1")
                  q-btn(flat size="10px" :label="$t('patterns.yes')" :text-color="searchForm.keysounded === 1 ? 'white' : 'grey'" @click="searchForm.keysounded = 1")
                  q-btn(flat size="10px" :label="$t('patterns.no')" :text-color="searchForm.keysounded === 0 ? 'white' : 'grey'" @click="searchForm.keysounded = 0")
            q-item
              q-item-section {{ $t('submitForm.control') }}
              q-item-section
                div
                  q-btn(flat size="10px" :label="$t('patterns.all')" :text-color="searchForm.control === '' ? 'white' : 'grey'" @click="searchForm.control = ''")
                  q-btn(flat size="10px" :label="$t('pattern.touch')" :text-color="searchForm.control === '0' ? 'white' : 'grey'" @click="searchForm.control = '0'")
                  q-btn(flat size="10px" :label="$t('pattern.keys')" :text-color="searchForm.control === '1' ? 'white' : 'grey'" @click="searchForm.control = '1'")
                  q-btn(flat size="10px" :label="$t('pattern.km')" :text-color="searchForm.control === '2' ? 'white' : 'grey'" @click="searchForm.control = '2'")
            q-item
              q-item-section {{ $t('submitForm.lanes') }}
              q-item-section
                div
                  q-option-group(inline :options="[{label: '2', value: 2}, {label: '3', value: 3}, {label: '4', value: 4}]" type="checkbox" v-model="searchForm.lanes")
            q-item
              q-item-section {{ $t('patterns.sort') }}
              q-item-section
                div
                  q-btn(flat size="10px" :label="$t('patterns.sortSubmit')" :icon-right="getSortIcon('submitDate')" :text-color="searchForm.sortBy === 'submitDate' ? 'white' : 'grey'" @click="changeSort('submitDate')")
                  q-btn(flat size="10px" :label="$t('patterns.sortUpdate')" :icon-right="getSortIcon('updateDate')" :text-color="searchForm.sortBy === 'updateDate' ? 'white' : 'grey'" @click="changeSort('updateDate')")
                  q-btn(flat size="10px" :label="$t('patterns.sortName')" :icon-right="getSortIcon('name')" :text-color="searchForm.sortBy === 'name' ? 'white' : 'grey'" @click="changeSort('name')")
                  q-btn(flat size="10px" :label="$t('pattern.rating')" :icon-right="getSortIcon('rating')" :text-color="searchForm.sortBy === 'rating' ? 'white' : 'grey'" @click="changeSort('rating')")
          q-separator.q-my-md
          q-infinite-scroll.row.q-my-md(@load="loadScroll" :offset="200" :disable="scrollDisable")
            .col-xs-12.col-sm-6.col-lg-3.q-pa-md.q-my-xs(v-for="pattern in patterns" :key="pattern.id")
              PatternCard(:pattern="pattern" :mine="false")
            template(#loading)
              q-spinner-dots(color="tech" size="40px")
          .text-center.text-body1(v-if="patterns.length === 0 && scrollDisable") {{ $t('patterns.notFound') }}
  q-no-ssr
    q-page-sticky(position="bottom-right" :offset="[36,36]" v-if="user.isLogin")
      q-btn(fab icon="add" color="tech" text-color="black" @click="$router.push('/patterns/new')")
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useMeta } from 'quasar'
import { useRoute } from 'vue-router'
import { useUserStore } from 'src/stores/user'
import PatternCard from 'src/components/PatternCard.vue'
import api from 'src/utils/api'

const route = useRoute()
const user = useUserStore()

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
const searchForm = ref({
  keywords: '',
  keysounded: -1,
  control: '',
  sort: -1,
  lanes: [2, 3, 4],
  sortBy: 'submitDate',
})
const search = ref({
  keywords: '',
  keysounded: -1,
  control: '',
  sort: -1,
  lanes: [2, 3, 4],
  sortBy: 'submitDate',
})
const scrollDisable = ref(false)

/**
 * Fetch patterns from API
 * @param start - The start index of the patterns
 */
const fetchPatterns = async (start = 0) => {
  try {
    const { data } = await api.get(
      `/patterns?start=${start}&keysounded=${search.value.keysounded}&control=${search.value.control}&keywords=${search.value.keywords}&lanes=${search.value.lanes.join()}&sort=${search.value.sort}&sortBy=${search.value.sortBy}&limit=12`,
    )
    if (data.success) {
      if (data.result.length > 0) patterns.value = patterns.value.concat(data.result)
      else scrollDisable.value = true
    } else {
      throw new Error('Error')
    }
  } catch (error) {
    error.value = true
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
 * Apply search filters
 */
const applySearch = () => {
  patterns.value = []
  search.value.keysounded = searchForm.value.keysounded
  search.value.control = searchForm.value.control
  search.value.lanes = searchForm.value.lanes
  search.value.sort = searchForm.value.sort
  search.value.sortBy = searchForm.value.sortBy
  scrollDisable.value = false
  fetchPatterns()
}

/**
 * Get the sort icon
 * @param sortBy - The sort by field
 * @returns The icon name
 */
const getSortIcon = (sortBy) => {
  if (searchForm.value.sortBy === sortBy)
    return searchForm.value.sort > 0 ? 'arrow_drop_up' : 'arrow_drop_down'
  else return undefined
}

/**
 * Change the sort field
 * @param sortBy - The sort by field
 */
const changeSort = (sortBy) => {
  if (searchForm.value.sortBy === sortBy) searchForm.value.sort *= -1
  else {
    searchForm.value.sortBy = sortBy
    searchForm.value.sort = -1
  }
}

onMounted(() => {
  fetchPatterns()
})
</script>
