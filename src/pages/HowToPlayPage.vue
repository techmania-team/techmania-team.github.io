<template lang="pug">
q-page#how-to-play
  //- Header
  q-parallax.q-mb-xl.header-parallax(:height="200")
    //- Header image background
    template(#media)
      img(src="/assets/header-howtoplay.png")
    //- Header content
    template(#content)
      h4.text-center HOW TO PLAY
  //- Content
  section.q-mx-auto.padding
    .container
      .row
        .col-12.text-center
          img(src="/assets/guides/scan.gif")
          p.text-center.text-body1 When a scanline passes the center of a note, play it!
        .col-12
          q-tabs(v-model="tab" class="text-tech" align="center")
            q-tab(name="touch" :icon="getControlIcon(CONTROL_TOUCH)" label="Touch")
            q-tab(name="keys" :icon="getControlIcon(CONTROL_KEYS)" label="Keys")
            q-tab(name="km")
              q-icon.filter-tech.q-tab__icon(:name="getControlIcon(CONTROL_KM)")
              .q-tab__label KM
    .row
      .col-12
        q-tab-panels(v-model="tab" animated)
          q-tab-panel#how-to-touch(name="touch")
            .container.q-py-md(:class="$q.screen.gt.sm ? 'text-left' : 'text-center'")
              .row.items-center
                .col-12.col-md-6
                  q-img(src="/assets/notes/basic.png" height="100px" fit="contain")
                .col-12.col-md-6.description
                  h5.q-my-md Basic Note
                  p.text-grey Touch the note when the scanline passes its center.
              .row.items-center.q-my-md
                .col-12.col-md-6
                  q-img(src="/assets/notes/chain.png" height="100px" fit="contain")
                .col-12.col-md-6.description
                  h5.q-my-md Chain Note
                  p.text-grey Touch and drag along the chain, following the speed of the scanline.
              .row.items-center.q-my-md
                .col-12.col-md-6
                  q-img(src="/assets/notes/drag.png" height="100px" fit="contain")
                .col-12.col-md-6.description
                  h5.q-my-md Drag Note
                  p.text-grey
                    | Touch and drag along the curve, following the speed of the scanline.
                    br
                    | You do not need to release your finger on time.
              .row.items-center.q-my-md
                .col-12.col-md-6
                  q-img(src="/assets/notes/hold.png" height="100px" fit="contain")
                .col-12.col-md-6.description
                  h5.q-my-md Hold Note
                  p.text-grey
                    | Touch and hold your finger on the note head, until the scanline reaches the end of the note.
                    br
                    | You do not need to release your finger on time.
              .row.items-center
                .col-12.col-md-6
                  q-img(src="/assets/notes/repeat.png" height="100px" fit="contain")
                .col-12.col-md-6.description
                  h5.q-my-md Repeat Note
                  p.text-grey.q-mb-none
                    | Touch the note head when the scanline passes its center, as well as any little note after it.
                    br
                    | For long notes, hold your finger on the note head, the same way as with hold notes.
          q-tab-panel#how-to-keyboard(name="keys")
            .container.q-pt-md
              .text-center
                q-img(src="/assets/guides/keyboard.png" height="200px" fit="contain")
                p.text-white.q-mb-none.q-mt-md(:class="$q.screen.gt.sm ? 'text-center' : 'text-left'")
                  | The Keys control scheme uses these 4 rows of keys on your keyboard.
                  br
                  | Each row corresponds to one of four lanes on the screen.
                  br
                  | To play a note in a certain lane, press any key in the corresponding row.
            q-separator.q-my-lg
            .container.q-pb-md(:class="$q.screen.gt.sm ? 'text-left' : 'text-center'")
              .row.items-center
                .col-12.col-md-6
                  q-img(src="/assets/notes/basic.png" height="100px" fit="contain")
                .col-12.col-md-6.description
                  h5.q-my-md Basic Note
                  p.text-grey Press a key when the scanline passes the note’s center.
              .row.items-center.q-my-md
                .col-12.col-md-6
                  q-img(src="/assets/notes/chain.png" height="100px" fit="contain")
                .col-12.col-md-6.description
                  h5.q-my-md Chain Note
                  p.text-grey Play each node as a separate basic note.
              .row.items-center.q-my-md
                .col-12.col-md-6
                  q-img(src="/assets/notes/drag.png" height="100px" fit="contain")
                .col-12.col-md-6.description
                  h5.q-my-md Drag Note
                  p.text-grey
                    | Press and hold a key until the note head reaches the end of the curve.
                    br
                    | You do not need to release the key on time.
              .row.items-center.q-my-md
                .col-12.col-md-6
                  q-img(src="/assets/notes/hold.png" height="100px" fit="contain")
                .col-12.col-md-6.description
                  h5.q-my-md Hold Note
                  p.text-grey
                    | Press and hold a key until the scanline reaches the end of the note.
                    br
                    | You do not need to release the key on time.
              .row.items-center
                .col-12.col-md-6
                  q-img(src="/assets/notes/repeat.png" height="100px" fit="contain")
                .col-12.col-md-6.description
                  h5.q-my-md Repeat Note
                  p.text-grey.q-mb-none
                    | Press a key when the scanline passes the note head’s center, as well as any little note after it.
                    br
                    | For long notes, hold the key, the same way as with drag and hold notes.
          q-tab-panel#how-to-km(name="km")
            .container.q-pt-md
              p.text-white.q-m-none
                | KM stands for Keyboard and Mouse.
                br
                | In the KM control scheme, you use the mouse to play some types of notes (basic, chain, drag), and the keyboard to play the other types (hold, repeat).
                br
                | Different from the Keys control scheme, here you can press any key in any row to play the keyboard notes, wherever they are.
            q-separator.q-my-lg
            .container.q-pb-md(:class="$q.screen.gt.sm ? 'text-left' : 'text-center'")
              .row.items-center
                .col-12.col-md-6
                  q-img(src="/assets/notes/basic.png" height="100px" fit="contain")
                .col-12.col-md-6.description
                  h5.q-my-md Basic Note
                  p.text-grey Click the note when the scanline passes its center.
              .row.items-center.q-my-md
                .col-12.col-md-6
                  q-img(src="/assets/notes/chain.png" height="100px" fit="contain")
                .col-12.col-md-6.description
                  h5.q-my-md Chain Note
                  p.text-grey
                    | Click and drag along the chain, following the speed of the scanline.
              .row.items-center.q-my-md
                .col-12.col-md-6
                  q-img(src="/assets/notes/drag.png" height="100px" fit="contain")
                .col-12.col-md-6.description
                  h5.q-my-md Drag Note
                  p.text-grey
                    | Click and drag along the curve, following the speed of the scanline.
                    br
                    | You do not need to release the mouse button on time.
              .row.items-center.q-my-md
                .col-12.col-md-6
                  q-img(src="/assets/notes/hold.png" height="100px" fit="contain")
                .col-12.col-md-6.description
                  h5.q-my-md Hold Note
                  p.text-grey
                    | Press and hold any key until the scanline reaches the end of the note.
                    br
                    | You do not need to release the key on time.
              .row.items-center
                .col-12.col-md-6
                  q-img(src="/assets/notes/repeat.png" height="100px" fit="contain")
                .col-12.col-md-6.description
                  h5.q-my-md Repeat Note
                  p.text-grey
                    | Press any key when the scanline passes the note head’s center, as well as any little note after it.
                    br
                    | For long notes, hold the key, the same way as with hold notes.
    .container.q-mt-lg
      .row
        .col-12.text-center
          q-img(src="/assets/guides/fever.png" height="100px" fit="contain")
          p.text-body1.q-my-md Regardless of control scheme, you can activate Fever in any of the following ways.
          ul.text-left(style="display: inline-block; margin: auto")
            li Touching the Fever button
            li Pressing Space/Backspace/Numpad 0/Numpad Enter
            li Clicking the Fever button
          p.text-body1.q-my-md While active, Fever will improve the judgement of notes played.
</template>

<script setup>
import { getControlIcon, CONTROL_TOUCH, CONTROL_KEYS, CONTROL_KM } from 'src/utils/control'
import { ref } from 'vue'

const tab = ref('touch')
</script>
