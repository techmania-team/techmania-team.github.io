<template lang="pug">
q-avatar(v-bind="avatarOptions")
  q-img(:src="avatar" error-src="/assets/notes/basic.png" v-bind="imgOptions")
</template>

<script setup lang="ts">
import type { QAvatarProps, QImgProps } from 'quasar'
defineProps<{
  avatar: string
  avatarOptions?: QAvatarProps
  imgOptions?: QImgProps
}>()
</script>
