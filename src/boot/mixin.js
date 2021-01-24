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
          login: `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT}&redirect_uri=${encodeURIComponent(process.env.BACK_URL)}&response_type=code&scope=identify%20guilds`,
          token: 'https://discord.com/api/oauth2/token',
          identity: 'https://discord.com/api/users/@me',
          guilds: 'https://discord.com/api/users/@me/guilds'
        },
        env: {
          BACK_URL: process.env.BACK_URL
        }
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
      }
    },
    computed: {
      user () {
        return this.$store.getters['user/getUserData']
      },
      isLogin () {
        return this.user.id.length !== 0
      }
    }
  })
}
