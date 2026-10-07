<template lang="pug">
q-page#patternForm
  q-no-ssr
    //- Header
    q-parallax.header-parallax(:height="200")
      //- Header image background
      template(#media)
        img(src="/assets/header-pattern.png")
      //- Header content
      template(#content)
        .column.items-center
          .text-h4.text-center {{ $t('patternFormPage.titleNew') }}
    PatternForm
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import PatternForm from '@/components/PatternForm.vue'
import { useSeoMeta } from '@/composables/useSeoMeta'
import { useUserStore } from '@/stores/user'

const user = useUserStore()
const { t } = useI18n()

const title = computed(() =>
  user.isLogin
    ? t('patternFormPage.meta.title', { text: t('patternFormPage.titleNew') })
    : t('patternFormPage.meta.title', { text: t('patternFormPage.meta.login') }),
)

const description = computed(() =>
  user.isLogin
    ? t('patternFormPage.meta.description', { text: t('patternFormPage.titleNew') })
    : t('patternFormPage.meta.description', { text: t('patternFormPage.meta.login') }),
)

useSeoMeta({
  title,
  description,
  noindex: true,
})
</script>

<route lang="yaml">
name: pattern-form-new
meta:
  login: true
</route>
