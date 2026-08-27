<template lang="pug">
div(ref="turnstileContainer")
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

interface TurnstileRenderOptions {
  sitekey: string
  action?: string
  theme?: 'light' | 'dark' | 'auto'
  size?: 'normal' | 'flexible' | 'compact'
  callback?: (token: string) => void
  'error-callback'?: (code: string) => void
  'expired-callback'?: () => void
}

interface Turnstile {
  render: (container: string | HTMLElement, options: TurnstileRenderOptions) => string
  reset: (widgetId?: string) => void
  remove: (widgetId?: string) => void
  getResponse: (widgetId?: string) => string | undefined
}

declare global {
  interface Window {
    turnstile?: Turnstile
  }
}

const siteKey = import.meta.env.QCLI_TURNSTILE_SITE_KEY || ''

const props = withDefaults(
  defineProps<{
    modelValue?: string
    action?: string
    theme?: 'light' | 'dark' | 'auto'
    size?: 'normal' | 'flexible' | 'compact'
  }>(),
  {
    action: '',
    theme: 'auto',
    size: 'normal',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', token: string): void
  (e: 'error', code: string): void
  (e: 'expired'): void
}>()

const turnstileContainer = ref<HTMLElement | null>(null)
let widgetId: string | undefined = undefined

const renderWidget = () => {
  if (!window.turnstile || !turnstileContainer.value) return

  if (widgetId !== undefined) {
    window.turnstile.remove(widgetId)
  }

  widgetId = window.turnstile.render(turnstileContainer.value, {
    sitekey: siteKey,
    action: props.action,
    theme: props.theme,
    size: props.size,
    callback: (token: string) => {
      emit('update:modelValue', token)
    },
    'error-callback': (code: string) => {
      emit('error', String(code))
    },
    'expired-callback': () => {
      emit('update:modelValue', '')
      emit('expired')
    },
  })
}

onMounted(() => {
  if (!window.turnstile) {
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.defer = true
    script.onload = renderWidget
    document.head.appendChild(script)
  } else {
    renderWidget()
  }
})

onBeforeUnmount(() => {
  if (widgetId !== undefined && window.turnstile) {
    window.turnstile.remove(widgetId)
  }
})

const reset = () => {
  if (widgetId !== undefined && window.turnstile) {
    emit('update:modelValue', '')
    window.turnstile.reset(widgetId)
  }
}
defineExpose({ reset })
</script>
