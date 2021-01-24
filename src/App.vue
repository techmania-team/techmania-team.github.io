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
  watch: {
    query: {
      handler (value) {
        if (value.token) {
          this.getUserData(value.token)
          this.$router.replace({ query: {} })
        }
      },
      deep: true
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
        this.$store.commit('user/login', { ...result.data, token })
      } catch (error) {
        console.log(error)
      }
    }
  }
}
</script>
