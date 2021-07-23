<template lang="pug">
  #q-app
    router-view
</template>
<script>
export default {
  name: 'App',
  methods: {
    async login () {
      if (this.$route.query.jwt && this.$route.query.token) {
        this.$store.commit('user/addjwt', this.$route.query.jwt)
        this.$store.commit('user/addtoken', this.$route.query.token)
        this.$store.commit('user/addid', this.$route.query.id)
        this.$router.replace({ query: {} })
      }
      if (this.user.jwt.length > 0) {
        // 5 days = 432000000 ms
        if (Date.now() - this.user.jwtReceived > 432000000) {
          await this.extendToken()
          return
        }
        this.getUserData(this.user.token)
      }
    },
    async getUserData (token) {
      try {
        const result = await this.$axios.get(this.discordURL.identity,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
        this.$store.commit('user/login', { ...result.data })
      } catch (error) {
        this.$store.commit('user/logout')
      }
    }
  },
  async created () {
    await this.login()
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
