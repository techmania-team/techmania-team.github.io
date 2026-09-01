<template lang="pug">
q-avatar(v-bind="avatarOptions")
  q-img(:src="avatar || DEFAULT_AVATAR" :error-src="DEFAULT_AVATAR" v-bind="imgOptions")
</template>

<script setup lang="ts">
import type { QAvatarProps, QImgProps } from 'quasar'
defineProps<{
  avatar: string
  avatarOptions?: QAvatarProps
  imgOptions?: QImgProps
}>()

const DEFAULT_AVATAR = '/assets/notes/basic.png'
</script>
