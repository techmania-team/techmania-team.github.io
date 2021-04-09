<template lang="pug">
  q-card.full-height.card-pattern
    q-img(:src="`http://i3.ytimg.com/vi/${pattern.previews[0].ytid}/hqdefault.jpg`" @click="$router.push('/patterns/'+pattern._id)" @error="imgerror" :ratio="16/9")
      .absolute-bottom
        .text-h6 {{ pattern.name }}
        .text-subtitle2  {{ pattern.composer }}
    q-card-section
      q-btn.btn-dl.absolute(v-if="!mine" fab icon="download" color="tech" text-color="black" @click="openLink(pattern.link)")
      q-btn.btn-dl.absolute(v-if="mine" fab icon="edit" color="tech" text-color="black" @click="$emit('edit')")
      .row.no-wrap.items-center
      q-list
        q-item
          q-item-section(v-if="!mine")
            | Pattern by {{ pattern.submitter.name }}
            br
            | Submitted {{ formattedTime }}
            br
            | Upadated {{ formattedUpdateTime }}
          q-item-section(v-else)
            | Submitted {{ formattedTime }}
            br
            | Upadated {{ formattedUpdateTime }}
        q-item
          q-item-section(:class="[{'text-red': !pattern.keysounded, 'text-positive': pattern.keysounded}]")
            div
              q-icon(:name="!pattern.keysounded ? 'close' : 'check'")
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
                  | {{ controls[difficulty.control] }} - {{ difficulty.name }}
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
  },
  computed: {
    formattedTime () {
      return new Date(this.pattern.submitDate).toLocaleString('en-US')
    },
    formattedUpdateTime () {
      return new Date(this.pattern.updateDate).toLocaleString('en-US')
    }
  }
}
</script>
