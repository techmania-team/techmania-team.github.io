<template lang="pug">
q-avatar(v-bind="avatarOptions")
  q-img(:src="avatar" error-src="/assets/notes/basic.png" v-bind="imgOptions")
</template>

<script setup>
defineProps({
  avatar: {
    type: String,
    required: true,
  },
  avatarOptions: {
    type: Object,
  },
  imgOptions: {
    type: Object,
  },
})
</script>
