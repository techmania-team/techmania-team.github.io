<template lang="pug">
  q-card.full-height.card-pattern
    q-video(:src="`https://www.youtube.com/embed/${pattern.previews[0].ytid}`")
    q-card-section
      q-btn.btn-dl.absolute(v-if="!mine" fab icon="download" color="tech" text-color="black" type="a" :href="pattern.link" target="__blank")
      q-btn.btn-dl.absolute(v-if="mine" fab icon="edit" color="tech" text-color="black" @click="$router.push('/patterns/edit/' + pattern._id)")
      q-list
        q-item
          q-item-section.card-title
            router-link(:to="'/patterns/' + pattern._id")
              .text-h6 {{ pattern.name }}
              .text-subtitle {{ pattern.composer }}
        q-item
          q-item-section
            p
              span(v-if="!mine")
                | {{ $t('pattern.submittedBy') }} &nbsp;
                router-link.no-underline(:to='`/users/${pattern.submitter._id}/#patterns`') {{ pattern.submitter.name }}
              br(v-if="!mine")
              span {{ $t('pattern.submitted') }} {{ formattedTime.relative }}
                q-tooltip(anchor="top middle" self="bottom middle" content-style="background: #000")
                  | {{ formattedTime.text }}
              br
              span {{ $t('pattern.updated') }} {{ formattedUpdateTime.relative }}
                q-tooltip(anchor="top middle" self="bottom middle" content-style="background: #000")
                  | {{ formattedUpdateTime.text }}
        q-item
          q-item-section
            div(:class="[{'text-red': !pattern.keysounded, 'text-positive': pattern.keysounded}]")
              q-icon(size="sm" :name="!pattern.keysounded ? 'close' : 'check'")
              | &nbsp;{{ $t('pattern.keysounded') }}
        q-item
          q-item-section
            div.q-gutter-sm.q-my-sm
              span(v-for="lanes in hasLanes" :key="lanes.count")
                //- q-icon(:class="[{'text-red': !lanes.value, 'text-positive': lanes.value}]" size="sm" :name="!lanes.value ? 'close' : 'check'")
                q-icon(:class="[{'filter-negative': !lanes.value, 'filter-positive': lanes.value}]" size="sm" :name="`img:./assets/icons/${lanes.count}L.png`")
        q-item
          q-item-section
            div.q-gutter-sm
              q-icon.text-black(
                v-for="(difficulty, index) in pattern.difficulties"
                :key="'D'+index"
                size="sm"
                :name="getControlIcon(difficulty.control, difficulty.level)"
                :class="getLevelFilter(difficulty.level)"
              )
                q-tooltip(anchor="top middle" self="bottom middle" content-style="background: #000")
                  | {{ $t('pattern.'+controls[difficulty.control]) }} / {{ difficulty.lanes }}L / {{ difficulty.name }}
                  br
                  span.text-bold(:class="getLevelColor(difficulty.level)") Lv.{{ difficulty.level }}
</template>

<script>
import parseISO from 'date-fns/fp/parseISO'
export default {
  name: 'PatternCard',
  props: {
    pattern: Object,
    mine: Boolean
  },
  computed: {
    formattedTime () {
      return {
        relative: this.$date.formatDistanceToNow(parseISO(this.pattern.submitDate), { locale: this.$date.locales[this.user.locale2], addSuffix: true }),
        text: new Date(this.pattern.submitDate).toLocaleString(this.user.locale)
      }
    },
    formattedUpdateTime () {
      return {
        relative: this.$date.formatDistanceToNow(parseISO(this.pattern.updateDate), { locale: this.$date.locales[this.user.locale2], addSuffix: true }),
        text: new Date(this.pattern.updateDate).toLocaleString(this.user.locale)
      }
    },
    hasLanes () {
      return [
        { count: 2, value: this.pattern.difficulties.some(difficulty => difficulty.lanes === 2) },
        { count: 3, value: this.pattern.difficulties.some(difficulty => difficulty.lanes === 3) },
        { count: 4, value: this.pattern.difficulties.some(difficulty => difficulty.lanes === 4) }
      ]
    }
  }
}
</script>
