// import something here
import dotenv from 'dotenv'
dotenv.config()

// "async" is optional;
// more info on params: https://quasar.dev/quasar-cli/boot-files
export default async ({ Vue }) => {
  Vue.mixin({
    data () {
      return {
        discordURL: {
          login: `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT.replace(/abc/g, '')}&redirect_uri=${encodeURIComponent(new URL('/api/users/login', process.env.HOST_URL))}&response_type=code&scope=identify%20guilds`,
          token: 'https://discord.com/api/oauth2/token',
          identity: 'https://discord.com/api/users/@me',
          guilds: 'https://discord.com/api/users/@me/guilds'
        },
        controls: ['touch', 'keys', 'km']
      }
    },
    methods: {
      openLink (url, target = '_blank') {
        open(url, target)
      },
      GetIDFromYouTubeLink (url) {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
        const match = url.match(regExp)
        return (match && match[7].length === 11) ? match[7] : false
      },
      getLevelColor (level) {
        const cls = []
        if (level <= 5) {
          cls.push({ 'text-yellow-8': true })
        } else if (level <= 10) {
          cls.push({ 'text-blue': true })
        } else {
          cls.push({ 'text-red-6': true })
        }
        return cls
      },
      getControlIcon (control, level) {
        let icon = ''
        switch (control) {
          case 0:
            icon = 'touch_app'
            break
          case 1:
            icon = 'keyboard'
            break
          case 2:
            icon = level <= 5 ? 'img:./assets/icons/KM_NM.svg' : level <= 10 ? 'img:./assets/icons/KM_HD.svg' : 'img:./assets/icons/KM_MX.svg'
            break
        }
        return icon
      },
      async extendToken () {
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
        }
      },
      async logout () {
        try {
          await this.$axios.delete(new URL('/api/users/logout', process.env.HOST_URL), {
            headers: { Authorization: `Bearer ${this.user.jwt}` }
          })
        } catch (_) {}
        this.$store.commit('user/logout')
        if (this.$route.meta.login) this.$router.push('/')
      },
      updateLocale (value) {
        this.$i18n.locale = value
        this.$store.commit('user/setLocale', value)
      }
    },
    computed: {
      user () {
        return this.$store.getters['user/getUserData']
      },
      isLogin () {
        return this.user.id.length !== 0
      }
    },
    beforeEnter (to, from, next) {
      if (to.meta.login && this.store.getters['user/getUserData'].id.length === 0) {
        next('/')
      } else {
        next()
      }
    }
  })
}
