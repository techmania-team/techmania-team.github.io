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
    if (this.user.jwt.length > 0) {
      try {
        const response = await this.$axios.post(new URL('/api/users/extend', process.env.HOST_URL), {}, {
          headers: { Authorization: `Bearer ${this.user.jwt}` }
        })
        this.getUserData(response.data.token)
        this.$store.commit('user/addjwt', response.data.jwt)
        this.$store.commit('user/addtoken', response.data.token)
        this.$store.commit('user/addid', response.data.id)
      } catch (error) {
        this.$store.commit('user/logout')
      }
    } else if (this.query.jwt && this.query.token) {
      this.getUserData(this.query.token)
      this.$store.commit('user/addjwt', this.query.jwt)
      this.$store.commit('user/addtoken', this.query.token)
      this.$store.commit('user/addid', this.query.id)
      this.$router.replace({ query: {} })
    }
  }
}
</script>
