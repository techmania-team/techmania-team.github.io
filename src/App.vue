<template lang="pug">
  #q-app
    router-view
</template>
<script>
export default {
  name: 'App',
  async created () {
    if (this.user.locale) {
      this.$i18n.locale = this.user.locale
    } else {
      const locale = this.$q.lang.getLocale()
      this.$store.commit('user/setLocale', locale)
      this.$i18n.locale = locale
    }

    try {
      // verify jwt
      if (this.user.jwt.length > 0) {
        await this.$axios.get(new URL('/api/users/verify', process.env.HOST_URL).toString(),
          {
            headers: {
              Authorization: `Bearer ${this.user.jwt}`
            }
          })
        if (Date.now() - this.user.jwtReceived > 432000000) {
          const { data } = await this.$axios.post(new URL('/api/users/extend', process.env.HOST_URL), {}, {
            headers: { Authorization: `Bearer ${this.user.jwt}` }
          })
          this.getUserData(data.token)
          this.$store.commit('user/addjwt', data.jwt)
          this.$store.commit('user/addtoken', data.token)
          this.$store.commit('user/addid', data.id)
        }
      } else if (this.$route.query.jwt && this.$route.query.token) {
        this.$store.commit('user/addjwt', this.$route.query.jwt)
        this.$store.commit('user/addtoken', this.$route.query.token)
        this.$store.commit('user/addid', this.$route.query.id)
        this.$router.replace({ query: {} })
      }

      if (this.user.token.length > 0) {
        const { data } = await this.$axios.get(this.discordURL.identity,
          {
            headers: {
              Authorization: `Bearer ${this.user.token}`
            }
          }
        )
        this.$store.commit('user/login', { ...data })
      }
    } catch (error) {
      console.log(error)
      this.$store.commit('user/logout')
    }
  }
}
</script>
