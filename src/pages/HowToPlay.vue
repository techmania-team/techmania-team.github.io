<template lang="pug">
  q-page#how-to-play
    section.q-mx-auto.padding.text-center
      .container
        .row
          .col-12.q-mx-auto
            h4 How To Play
            q-separator.q-my-md
            img(:src="'./assets/guides/scan.gif'")
            p.text-body1 When a scanline passes the center of a note, play it!
            q-tabs(v-model="tab" class="text-tech" align="center")
              q-tab(name="touch" icon="touch_app" label="Touch")
              q-tab(name="keyboard" icon="keyboard" label="Keyboard")
              q-tab(name="km" icon="svguse:./assets/icons/KM.svg#tech" label="KM")
            q-separator
            q-tab-panels(v-model="tab" animated)
              q-tab-panel#how-to-touch(name="touch")
                .row.q-my-lg.items-center
                  .col-12.col-md-6
                    img.note(:src="'./assets/notes/basic.png'")
                  .col-12.col-md-6.description
                    h5.q-my-md Basic Note
                    p.text-grey Touch the note when the scanline passes its center.
                .row.q-my-lg.items-center
                  .col-12.col-md-6
                    img.full-width.note(:src="'./assets/notes/chain.png'")
                  .col-12.col-md-6.description
                    h5.q-my-md Chain Note
                    p.text-grey Touch and drag along the chain, following the speed of the scanline.
                .row.q-my-lg.items-center
                  .col-12.col-md-6
                    img.full-width.note(:src="'./assets/notes/drag.png'")
                  .col-12.col-md-6.description
                    h5.q-my-md Drag Note
                    p.text-grey
                      | Touch and drag along the curve, following the speed of the scanline.
                      br
                      | You do not need to release your finger on time.
                .row.q-my-lg.items-center
                  .col-12.col-md-6
                    img.full-width.note(:src="'./assets/notes/hold.png'")
                  .col-12.col-md-6.description
                    h5.q-my-md Hold Note
                    p.text-grey
                      | Touch and hold your finger on the note head, until the scanline reaches the end of the note.
                      br
                      | You do not need to release your finger on time.
                .row.q-my-lg.items-center
                  .col-12.col-md-6
                    img.full-width.note(:src="'./assets/notes/repeat.png'")
                  .col-12.col-md-6.description
                    h5.q-my-md Repeat Note
                    p.text-grey
                      | Touch the note head when the scanline passes its center, as well as any little note after it.
                      br
                      | For long notes, hold your finger on the note head, the same way as with hold notes.
              q-tab-panel#how-to-keyboard(name="keyboard")
                .full-width.text-center.q-my-lg
                  img.full-width#keyboard-scheme(:src="'./assets/guides/keyboard.png'")
                  p.text-white
                    | The Keys control scheme uses these 4 rows of keys on your keyboard.
                    br
                    | Each row corresponds to one of four lanes on the screen.
                    br
                    | To play a note in a certain lane, press any key in the corresponding row.
                q-separator
                .row.q-my-lg.items-center
                  .col-12.col-md-6
                    img.note(:src="'./assets/notes/basic.png'")
                  .col-12.col-md-6.description
                    h5.q-my-md Basic Note
                    p.text-grey Press a key when the scanline passes the note’s center.
                .row.q-my-lg.items-center
                  .col-12.col-md-6
                    img.full-width.note(:src="'./assets/notes/chain.png'")
                  .col-12.col-md-6.description
                    h5.q-my-md Chain Note
                    p.text-grey Play each node as a separate basic note.
                .row.q-my-lg.items-center
                  .col-12.col-md-6
                    img.full-width.note(:src="'./assets/notes/drag.png'")
                  .col-12.col-md-6.description
                    h5.q-my-md Drag Note
                    p.text-grey
                      | Press and hold a key until the note head reaches the end of the curve.
                      br
                      | You do not need to release the key on time.
                .row.q-my-lg.items-center
                  .col-12.col-md-6
                    img.full-width.note(:src="'./assets/notes/hold.png'")
                  .col-12.col-md-6.description
                    h5.q-my-md Hold Note
                    p.text-grey
                      | Press and hold a key until the scanline reaches the end of the note.
                      br
                      | You do not need to release the key on time.
                .row.q-my-lg.items-center
                  .col-12.col-md-6
                    img.full-width.note(:src="'./assets/notes/repeat.png'")
                  .col-12.col-md-6.description
                    h5.q-my-md Repeat Note
                    p.text-grey
                      | Press a key when the scanline passes the note head’s center, as well as any little note after it.
                      br
                      | For long notes, hold the key, the same way as with drag and hold notes.
              q-tab-panel#how-to-km(name="km")
                .full-width.text-center.q-my-lg
                  p.text-white
                    | KM stands for Keyboard and Mouse.
                    br
                    | In the KM control scheme, you use the mouse to play some types of notes (basic, chain, drag), and the keyboard to play the other types (hold, repeat).
                    br
                    | Different from the Keys control scheme, here you can press any key in any row to play the keyboard notes, wherever they are.
                q-separator
                .row.q-my-lg.items-center
                  .col-12.col-md-6
                    img.note(:src="'./assets/notes/basic.png'")
                  .col-12.col-md-6.description
                    h5.q-my-md Basic Note
                    p.text-grey Click the note when the scanline passes its center.
                .row.q-my-lg.items-center
                  .col-12.col-md-6
                    img.full-width.note(:src="'./assets/notes/chain.png'")
                  .col-12.col-md-6.description
                    h5.q-my-md Chain Note
                    p.text-grey
                      | Click and drag along the chain, following the speed of the scanline.
                .row.q-my-lg.items-center
                  .col-12.col-md-6
                    img.full-width.note(:src="'./assets/notes/drag.png'")
                  .col-12.col-md-6.description
                    h5.q-my-md Drag Note
                    p.text-grey
                      | Click and drag along the curve, following the speed of the scanline.
                      br
                      | You do not need to release the mouse button on time.
                .row.q-my-lg.items-center
                  .col-12.col-md-6
                    img.full-width.note(:src="'./assets/notes/hold.png'")
                  .col-12.col-md-6.description
                    h5.q-my-md Hold Note
                    p.text-grey
                      | Press and hold any key until the scanline reaches the end of the note.
                      br
                      | You do not need to release the key on time.
                .row.q-my-lg.items-center
                  .col-12.col-md-6
                    img.full-width.note(:src="'./assets/notes/repeat.png'")
                  .col-12.col-md-6.description
                    h5.q-my-md Repeat Note
                    p.text-grey
                      | Press any key when the scanline passes the note head’s center, as well as any little note after it.
                      br
                      | For long notes, hold the key, the same way as with hold notes.
            h4 Fever
            q-separator.q-my-md
            img(:src="'./assets/guides/fever.png'")
            p.text-body1 Regardless of control scheme, you can activate Fever in any of the following ways.
            br
            p.text-body1.q-my-sm Touching the Fever button
            p.text-body1.q-my-sm Pressing Space/Backspace/Numpad 0/Numpad Enter
            p.text-body1.q-my-sm Clicking the Fever button
            br
            p.text-body1 While active, Fever will improve the judgement of notes played.
            br
</template>

<script>
export default {
  name: 'PageHowToPlay',
  data () {
    return {
      tab: 'touch'
    }
  }
}
</script>
