<template lang="pug">
q-page#skinForm
  q-no-ssr
    //- Header
    q-parallax.header-parallax(:height="200")
      //- Header image background
      template(#media)
        img(src="/assets/header-skin.png")
      //- Header content
      template(#content)
        .column.items-center
          .text-h4.text-center {{ $t('skinFormPage.titleNew') }}
    SkinForm
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import SkinForm from '@/components/SkinForm.vue'
import { useSeoMeta } from '@/composables/useSeoMeta'
import { useUserStore } from '@/stores/user'

const user = useUserStore()
const { t } = useI18n()

const title = computed(() =>
  user.isLogin
    ? t('skinFormPage.meta.title', { text: t('skinFormPage.titleNew') })
    : t('skinFormPage.meta.title', { text: t('skinFormPage.meta.login') }),
)

const description = computed(() =>
  user.isLogin
    ? t('skinFormPage.meta.description', { text: t('skinFormPage.titleNew') })
    : t('skinFormPage.meta.description', { text: t('skinFormPage.meta.login') }),
)

useSeoMeta({
  title,
  description,
  noindex: true,
})
</script>

<route lang="yaml">
name: skin-form-new
meta:
  login: true
</route>
