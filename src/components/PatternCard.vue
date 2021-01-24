<template lang="pug">
  q-card.full-height.card-pattern
    q-img(:src="`https://img.youtube.com/vi/${GetIDFromYouTubeLink(pattern.link)}/0.jpg`")
      .absolute-bottom.text-h6 {{ pattern.name }}
    q-card-section
      q-btn.btn-dl.absolute(v-if="!mine" fab icon="download" color="tech" text-color="black" @click="openLink(pattern.link)")
      q-btn.btn-dl.absolute(v-if="mine" fab icon="edit" color="tech" text-color="black" @click="$emit('edit')")
      .row.no-wrap.items-center
      q-list(separator)
        q-item
          q-item-section Composer: {{ pattern.composer }}
        q-item
          q-item-section Keysounded: {{ pattern.keysounded === 0 ? 'No' : 'Yes' }}
        q-expansion-item(label="Difficulties")
          ul
            li(v-for="(difficulty, index) in pattern.difficulties" :key="'D'+index") {{ difficulty.name }}: {{ difficulty.level }}
        q-expansion-item(label="Previews")
          ul
            li(v-for="(preview, index) in pattern.previews" :key="'P'+index")
              | {{ preview.name }}
              q-btn(flat round icon="fab fa-youtube" color="tech" @click="openLink(preview.link)")
        q-expansion-item(label="Description")
          q-item.description
            | {{ pattern.description }}
        q-item(v-if="!mine")
          q-item-section Submitted by {{ pattern.user }}
</template>

<script>
export default {
  name: 'PatternCard',
  props: {
    pattern: Object,
    mine: Boolean
  }
}
</script>
