<template lang="pug">
  q-layout(view='hHh lpR fff')
    q-header.bg-techgrey.text-white(reveal elevated)
      q-no-ssr
        .container
          q-toolbar
            q-toolbar-title
              q-btn(to="/" flat)
                q-avatar
                  img(:src="'./assets/notes/basic.png'")
                | &nbsp;TECHMANIA
            q-tabs
              q-tab.nav-desktop(@click="openLink('https://techmania-team.github.io/techmania-docs/', '_blank')" :label="$t('nav.manual')")
              q-route-tab.nav-desktop(v-for="(nav, idx) in navs" :key="idx" :to="nav.link" :label="$t(nav.label)")
              q-tab.nav-desktop(v-if="!isLogin" @click="openLink(discordURL.login, '_self')" :label="$t('nav.login')")
              q-btn-dropdown.nav-desktop(stretch flat v-if="isLogin")
                template(#label)
                  q-avatar
                    img(:src="user.avatar_url")
                q-list
                  q-item(clickable v-close-popup :to="'/user/'+user.id" active-class="text-white")
                    q-item-section
                      q-item-label {{ $t('nav.myPage') }}
                  q-item(clickable @click="logout()")
                    q-item-section
                      q-item-label {{ $t('nav.logout') }}
              q-btn-dropdown.nav-desktop(stretch flat :label="$t('nav.lang')")
                q-list
                  q-item(clickable v-close-popup v-for="(locale, lid) in localeOptions" :key="lid" @click="updateLocale(locale)")
                    q-item-section
                      q-item-label {{ locale.toUpperCase() }}
              q-btn.nav-mobile(:label="isLogin ? '' : $t('nav.menu')" :icon-right="dropdown ? 'keyboard_arrow_up' : 'keyboard_arrow_down'" @click="dropdown = !dropdown")
                q-avatar(v-if="isLogin")
                  img(:src="user.avatar_url")
                | &emsp;
          q-separator.nav-mobile(v-show="dropdown")
        q-slide-transition
          .container.nav-mobile(v-show="dropdown")
            q-list
              q-item.text-grey7(clickable v-if="!isLogin" @click="openLink('https://techmania-team.github.io/techmania-docs/', '_blank'); dropdown = !dropdown" active-class="text-white")
                q-item-section {{ $t('nav.manual') }}
              q-item.text-grey7(clickable @click="dropdown = !dropdown" v-for="(nav, idx) in navs" :key="idx" :to="nav.link" active-class="text-white")
                q-item-section {{ $t(nav.label) }}
              q-item.text-grey7(clickable v-if="!isLogin" @click="openLink(discordURL.login, '_self'); dropdown = !dropdown" active-class="text-white")
                q-item-section {{ $t('nav.login') }}
              q-item.text-grey7(clickable @click="dropdown = !dropdown" :to="'/user/'+user.id" v-if="isLogin" active-class="text-white")
                q-item-section {{ $t('nav.myPage') }}
              q-item.text-grey7(clickable v-if="isLogin" @click="logout()" active-class="text-white")
                q-item-section {{ $t('nav.logout') }}
              q-btn-dropdown.full-width(align="between" stretch flat :label="$t('nav.lang')")
                q-list
                  q-item(clickable v-close-popup v-for="(locale, lid) in localeOptions" :key="lid" @click=" updateLocale(locale)")
                    q-item-section
                      q-item-label {{ locale.toUpperCase() }}
    q-page-container
      router-view.q-mb-xl(:key="$route.fullPath")
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
import { localeOptions } from '../i18n'

export default {
  name: 'MainLayout',
  data () {
    return {
      dropdown: false,
      navs: [
        {
          link: '/changelog',
          label: 'nav.changelog'
        },
        {
          link: '/patterns',
          label: 'nav.patterns'
        },
        {
          link: '/skins',
          label: 'nav.skins'
        }
      ],
      localeOptions
    }
  }
}
</script>
