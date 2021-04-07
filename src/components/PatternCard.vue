<template lang="pug">
  q-card.full-height.card-pattern
    q-img(:src="`https://i.ytimg.com/vi_webp/${pattern.previews[0].link}/hqdefault.webp`" @click="$router.push('/patterns/'+pattern.id)" @error="imgerror" :ratio="16/9")
      .absolute-bottom
        .text-h6 {{ pattern.name }}
        .text-subtitle2  {{ pattern.composer }}
    q-card-section
      q-btn.btn-dl.absolute(v-if="!mine" fab icon="download" color="tech" text-color="black" @click="openLink(pattern.link)")
      q-btn.btn-dl.absolute(v-if="mine" fab icon="edit" color="tech" text-color="black" @click="$emit('edit')")
      .row.no-wrap.items-center
      q-list
        q-item(v-if="!mine")
          q-item-section Submitted by {{ pattern.user }}
        q-item
          q-item-section(:class="[{'text-red': pattern.keysounded === '0', 'text-positive': pattern.keysounded === '1'}]")
            div
              q-icon(:name="pattern.keysounded === '0' ? 'close' : 'check'")
              | &nbsp;Keysounded
        q-item
          q-item-section
            div.q-gutter-sm
              q-icon(
                v-for="(difficulty, index) in pattern.difficulties"
                :key="'D'+index"
                size="sm"
                :name="getControlIcon(difficulty.control, difficulty.level)"
                :class="getLevelColor(difficulty.level)"
              )
                q-tooltip(anchor="top middle" self="bottom middle" content-style="background: #000")
                  | {{ difficulty.control }} - {{ difficulty.name }}
                  br
                  span.text-bold(:class="getLevelColor(difficulty.level)") Lv.{{ difficulty.level }}
</template>

<script>
export default {
  name: 'PatternCard',
  props: {
    pattern: Object,
    mine: Boolean
  },
  methods: {
    imgerror () {
      console.log('a')
    }
  }
}
</script>
