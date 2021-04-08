<template lang="pug">
  #q-app
    router-view
</template>
<script>
export default {
  name: 'App',
  computed: {
    query () {
      return this.$route.query
    }
  },
  methods: {
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
        console.log(error)
      }
    }
  },
  async mounted () {
    if (this.query.jwt && this.query.token) {
      this.getUserData(this.query.token)
      this.$store.commit('user/addjwt', this.query.jwt)
      this.$store.commit('user/addtoken', this.query.token)
      this.$router.replace({ query: {} })
    }
  }
}
</script>
