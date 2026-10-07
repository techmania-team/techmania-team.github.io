<template lang="pug">
q-page#setlistForm
  q-no-ssr
    //- Header
    q-parallax.header-parallax(:height="200")
      //- Header image background
      template(#media)
        img(src="/assets/header-setlist.png")
      //- Header content
      template(#content)
        .column.items-center.q-mb-md
          .text-h4.text-center {{ $t('setlistFormPage.titleNew') }}
    SetlistForm
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import SetlistForm from '@/components/SetlistForm.vue'
import { useSeoMeta } from '@/composables/useSeoMeta'
import { useUserStore } from '@/stores/user'

const user = useUserStore()
const { t } = useI18n()

const title = computed(() =>
  user.isLogin
    ? t('setlistFormPage.meta.title', { text: t('setlistFormPage.titleNew') })
    : t('setlistFormPage.meta.title', { text: t('setlistFormPage.meta.login') }),
)

const description = computed(() =>
  user.isLogin
    ? t('setlistFormPage.meta.description', { text: t('setlistFormPage.titleNew') })
    : t('setlistFormPage.meta.description', { text: t('setlistFormPage.meta.login') }),
)

useSeoMeta({
  title,
  description,
  noindex: true,
})
</script>

<route lang="yaml">
name: setlist-form-new
meta:
  login: true
</route>
