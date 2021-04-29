<template lang="pug">
  #q-app
    router-view
</template>
<script>
export default {
  name: 'App',
  async created () {
    this.login()

    if (this.user.locale) {
      this.$i18n.locale = this.user.locale
    } else {
      const locale = this.$q.lang.getLocale()
      this.$store.commit('user/setLocale', locale)
      this.$i18n.locale = locale
    }
  }
}
</script>
