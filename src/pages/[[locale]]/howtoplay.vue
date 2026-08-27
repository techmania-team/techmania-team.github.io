<template lang="pug">
q-page#how-to-play
  //- Header
  q-parallax.q-mb-xl.header-parallax(:height="200")
    //- Header image background
    template(#media)
      img(src="/assets/header-howtoplay.png")
    //- Header content
    template(#content)
      h4.text-center {{ $t('howtoplayPage.title') }}
  //- Content
  section.q-mx-auto.padding
    .container
      .row
        .col-12.text-center
          img(src="/assets/guides/scan.gif")
          p.text-center.text-body1 {{ $t('howtoplayPage.scanlineNotice') }}
        .col-12
          q-tabs(v-model="tab" class="text-tech" align="justify")
            q-tab(name="touch" :icon="getControlIcon(CONTROLTYPE.TOUCH)" :label="$t('howtoplayPage.tabs.touch')")
            q-tab(name="keys" :icon="getControlIcon(CONTROLTYPE.KEYS)" :label="$t('howtoplayPage.tabs.keys')")
            q-tab(name="km")
              q-icon.filter-tech.q-tab__icon(:name="getControlIcon(CONTROLTYPE.KM)")
              .q-tab__label {{ $t('howtoplayPage.tabs.km') }}
    .row
      .col-12
        q-tab-panels(v-model="tab" animated)
          //- Touch Panel
          q-tab-panel#how-to-touch(name="touch")
            .container.q-py-md(:class="$q.screen.gt.sm ? 'text-left' : 'text-center'")
              .row.items-center
                .col-12.col-md-6
                  q-img(src="/assets/notes/basic.png" height="100px" fit="contain")
                .col-12.col-md-6.description
                  h5.q-my-md {{ $t('howtoplayPage.notes.basic.title') }}
                  p.text-grey {{ $t('howtoplayPage.notes.basic.touchDesc') }}
              .row.items-center.q-my-md
                .col-12.col-md-6
                  q-img(src="/assets/notes/chain.png" height="100px" fit="contain")
                .col-12.col-md-6.description
                  h5.q-my-md {{ $t('howtoplayPage.notes.chain.title') }}
                  p.text-grey {{ $t('howtoplayPage.notes.chain.touchDesc') }}
              .row.items-center.q-my-md
                .col-12.col-md-6
                  q-img(src="/assets/notes/drag.png" height="100px" fit="contain")
                .col-12.col-md-6.description
                  h5.q-my-md {{ $t('howtoplayPage.notes.drag.title') }}
                  p.text-grey(style="white-space: pre-line") {{ $t('howtoplayPage.notes.drag.touchDesc') }}
              .row.items-center.q-my-md
                .col-12.col-md-6
                  q-img(src="/assets/notes/hold.png" height="100px" fit="contain")
                .col-12.col-md-6.description
                  h5.q-my-md {{ $t('howtoplayPage.notes.hold.title') }}
                  p.text-grey(style="white-space: pre-line") {{ $t('howtoplayPage.notes.hold.touchDesc') }}
              .row.items-center
                .col-12.col-md-6
                  q-img(src="/assets/notes/repeat.png" height="100px" fit="contain")
                .col-12.col-md-6.description
                  h5.q-my-md {{ $t('howtoplayPage.notes.repeat.title') }}
                  p.text-grey.q-mb-none(style="white-space: pre-line") {{ $t('howtoplayPage.notes.repeat.touchDesc') }}

          //- Keys Panel
          q-tab-panel#how-to-keyboard(name="keys")
            .container.q-pt-md
              .text-center
                q-img(src="/assets/guides/keyboard.png" height="200px" fit="contain")
                p.text-white.q-mb-none.q-mt-md(
                  :class="$q.screen.gt.sm ? 'text-center' : 'text-left'"
                  style="white-space: pre-line"
                ) {{ $t('howtoplayPage.keysDesc') }}
            q-separator.q-my-lg
            .container.q-pb-md(:class="$q.screen.gt.sm ? 'text-left' : 'text-center'")
              .row.items-center
                .col-12.col-md-6
                  q-img(src="/assets/notes/basic.png" height="100px" fit="contain")
                .col-12.col-md-6.description
                  h5.q-my-md {{ $t('howtoplayPage.notes.basic.title') }}
                  p.text-grey {{ $t('howtoplayPage.notes.basic.keysDesc') }}
              .row.items-center.q-my-md
                .col-12.col-md-6
                  q-img(src="/assets/notes/chain.png" height="100px" fit="contain")
                .col-12.col-md-6.description
                  h5.q-my-md {{ $t('howtoplayPage.notes.chain.title') }}
                  p.text-grey {{ $t('howtoplayPage.notes.chain.keysDesc') }}
              .row.items-center.q-my-md
                .col-12.col-md-6
                  q-img(src="/assets/notes/drag.png" height="100px" fit="contain")
                .col-12.col-md-6.description
                  h5.q-my-md {{ $t('howtoplayPage.notes.drag.title') }}
                  p.text-grey(style="white-space: pre-line") {{ $t('howtoplayPage.notes.drag.keysDesc') }}
              .row.items-center.q-my-md
                .col-12.col-md-6
                  q-img(src="/assets/notes/hold.png" height="100px" fit="contain")
                .col-12.col-md-6.description
                  h5.q-my-md {{ $t('howtoplayPage.notes.hold.title') }}
                  p.text-grey(style="white-space: pre-line") {{ $t('howtoplayPage.notes.hold.keysDesc') }}
              .row.items-center
                .col-12.col-md-6
                  q-img(src="/assets/notes/repeat.png" height="100px" fit="contain")
                .col-12.col-md-6.description
                  h5.q-my-md {{ $t('howtoplayPage.notes.repeat.title') }}
                  p.text-grey.q-mb-none(style="white-space: pre-line") {{ $t('howtoplayPage.notes.repeat.keysDesc') }}

          //- Keyboard & Mouse Panel
          q-tab-panel#how-to-km(name="km")
            .container.q-pt-md
              p.text-white.q-m-none(style="white-space: pre-line") {{ $t('howtoplayPage.kmDesc') }}
            q-separator.q-my-lg
            .container.q-pb-md(:class="$q.screen.gt.sm ? 'text-left' : 'text-center'")
              .row.items-center
                .col-12.col-md-6
                  q-img(src="/assets/notes/basic.png" height="100px" fit="contain")
                .col-12.col-md-6.description
                  h5.q-my-md {{ $t('howtoplayPage.notes.basic.title') }}
                  p.text-grey {{ $t('howtoplayPage.notes.basic.kmDesc') }}
              .row.items-center.q-my-md
                .col-12.col-md-6
                  q-img(src="/assets/notes/chain.png" height="100px" fit="contain")
                .col-12.col-md-6.description
                  h5.q-my-md {{ $t('howtoplayPage.notes.chain.title') }}
                  p.text-grey {{ $t('howtoplayPage.notes.chain.kmDesc') }}
              .row.items-center.q-my-md
                .col-12.col-md-6
                  q-img(src="/assets/notes/drag.png" height="100px" fit="contain")
                .col-12.col-md-6.description
                  h5.q-my-md {{ $t('howtoplayPage.notes.drag.title') }}
                  p.text-grey(style="white-space: pre-line") {{ $t('howtoplayPage.notes.drag.kmDesc') }}
              .row.items-center.q-my-md
                .col-12.col-md-6
                  q-img(src="/assets/notes/hold.png" height="100px" fit="contain")
                .col-12.col-md-6.description
                  h5.q-my-md {{ $t('howtoplayPage.notes.hold.title') }}
                  p.text-grey(style="white-space: pre-line") {{ $t('howtoplayPage.notes.hold.kmDesc') }}
              .row.items-center
                .col-12.col-md-6
                  q-img(src="/assets/notes/repeat.png" height="100px" fit="contain")
                .col-12.col-md-6.description
                  h5.q-my-md {{ $t('howtoplayPage.notes.repeat.title') }}
                  p.text-grey.q-mb-none(style="white-space: pre-line") {{ $t('howtoplayPage.notes.repeat.kmDesc') }}

    //- Fever System
    .container.q-mt-lg
      .row
        .col-12.text-center
          q-img(src="/assets/guides/fever.png" height="100px" fit="contain")
          p.text-body1.q-my-md {{ $t('howtoplayPage.fever.activateNotice') }}
          ul.text-left(style="display: inline-block; margin: auto")
            li {{ $t('howtoplayPage.fever.methods.touch') }}
            li {{ $t('howtoplayPage.fever.methods.keyboard') }}
            li {{ $t('howtoplayPage.fever.methods.click') }}
          p.text-body1.q-my-md {{ $t('howtoplayPage.fever.effect') }}
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CONTROLTYPE, getControlIcon } from '@/utils/control'

const tab = ref('touch')
</script>

<route lang="yaml">
name: howtoplay
meta:
  login: false
</route>
