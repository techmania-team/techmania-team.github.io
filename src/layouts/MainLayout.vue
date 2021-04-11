<template lang="pug">
  q-layout(view='hHh lpR fff')
    q-no-ssr
      q-header.bg-techgrey.text-white(reveal elevated)
        .container
          q-toolbar
            q-toolbar-title
              q-btn(to="/" flat)
                q-avatar
                  img(:src="'./assets/notes/basic.png'")
                | &nbsp;TECHMANIA
            q-tabs
              q-tab.nav-desktop(@click="openLink('https://techmania-team.github.io/techmania-docs/', '_blank')" label="Manual")
              q-route-tab.nav-desktop(v-for="(nav, idx) in navs" :key="idx" :to="nav.link" :label="nav.label")
              q-tab.nav-desktop(v-if="!isLogin" @click="openLink(discordURL.login, '_self')" label="Login")
              q-route-tab.nav-desktop(v-if="isLogin" to="/mypage" label="My Page")
              q-tab.nav-desktop(v-if="isLogin" @click="logout()" label="Logout")
              q-btn(round v-if="isLogin" to="/mypage")
                q-avatar
                  img(:src="user.avatar_url")
              q-btn.nav-mobile(:label="isLogin ? '' : 'Menu'" :icon-right="dropdown ? 'keyboard_arrow_up' : 'keyboard_arrow_down'" @click="dropdown = !dropdown")
          q-separator.nav-mobile(v-show="dropdown")
        q-slide-transition
          .container.nav-mobile(v-show="dropdown")
            q-list
              q-item.text-grey7(clickable v-if="!isLogin" @click="openLink('https://techmania-team.github.io/techmania-docs/', '_blank'); dropdown = !dropdown" active-class="text-white")
                q-item-section Manual
              q-item.text-grey7(clickable @click="dropdown = !dropdown" v-for="(nav, idx) in navs" :key="idx" :to="nav.link" active-class="text-white")
                q-item-section {{ nav.label }}
              q-item.text-grey7(clickable v-if="!isLogin" @click="openLink(discordURL.login, '_self'); dropdown = !dropdown" active-class="text-white")
                q-item-section Login
              q-item.text-grey7(clickable @click="dropdown = !dropdown" v-if="isLogin" to="/mypage" active-class="text-white")
                q-item-section My Page
              q-item.text-grey7(clickable v-if="isLogin" @click="logout()" active-class="text-white")
                q-item-section Logout
      q-page-container
        router-view(:key="$route.fullPath")
      q-footer.bg-techgrey.text-white.relative-position(bordered)
        .container
          q-toolbar
            p.q-mb-none &copy; {{ new Date().getFullYear() }} TECHMANIA DEV TEAM
            q-space
            q-btn.q-mr-xs(flat round icon="fab fa-discord" color="tech" @click="openLink('https://discord.gg/K4Nf7AnAZt')")
            q-btn.q-mr-xs(flat round icon="fab fa-github" color="tech" @click="openLink('https://github.com/techmania-team/techmania')")
            q-btn(flat round icon="fab fa-reddit-alien" color="tech" @click="openLink('https://www.reddit.com/r/TechMania/')")
</template>

<script>
export default {
  name: 'MainLayout',
  data () {
    return {
      dropdown: false,
      navs: [
        {
          link: '/changelog',
          label: 'Changelog'
        },
        {
          link: '/patterns',
          label: 'Patterns'
        }
      ]
    }
  },
  methods: {
    async logout () {
      try {
        await this.$axios.delete(new URL('/api/users/logout', process.env.HOST_URL), {
          headers: { Authorization: `Bearer ${this.user.jwt}` }
        })
      } catch (_) {}
      this.$store.commit('user/logout')
      if (this.$route.meta.login) this.$router.push('/')
    }
  }
}
</script>
