<template lang="pug">
q-layout(view='hHh lpR fff')
  //- Header
  q-header.bg-techgrey.text-white(reveal elevated)
    q-no-ssr
      .container
        //- Navbar
        q-toolbar
          //- Site Title
          q-toolbar-title
            q-btn(to="/" flat)
              q-avatar
                img(:src="'./assets/notes/basic.png'")
              | &nbsp;TECHMANIA
          //- PC navigation item
          q-tabs(active-color="tech")
            //- Docs
            q-tab.nav-desktop(@click="openLink('https://techmania-team.github.io/techmania-docs/', '_blank')" :label="$t('nav.manual')")
            //- Links
            q-route-tab.nav-desktop(v-for="(nav, idx) in navs" :key="idx" :to="nav.link" :label="$t(nav.label)")
            //- Login
            q-tab.nav-desktop(v-if="!user.isLogin" @click="openLink('/api/auth/login', '_self')" :label="$t('nav.login')")
            //- User dropdown
            q-btn-dropdown.nav-desktop(stretch flat v-if="user.isLogin")
              //- User avatar
              template(#label)
                q-avatar
                  img(:src="user.avatar")
              //- User dropdown items
              q-list
                //- User Profile
                q-item(clickable v-close-popup :to="'/users/'+user._id" active-class="text-white")
                  q-item-section
                    q-item-label {{ $t('nav.myPage') }}
                //- Logout
                q-item(clickable @click="$store.dispatch('user/logout')")
                  q-item-section
                    q-item-label {{ $t('nav.logout') }}
            //- Language options
            q-btn-dropdown.nav-desktop(stretch flat :label="$t('nav.lang')")
              q-list
                q-item(clickable v-close-popup v-for="(locale, lid) in localeOptions" :key="lid" @click="updateLocale(locale)")
                  q-item-section
                    q-item-label {{ locale.toUpperCase() }}
            //-   Nav Collapse button for mobile
            q-btn.nav-mobile(:label="user.isLogin ? '' : $t('nav.menu')" :icon-right="dropdown ? 'keyboard_arrow_up' : 'keyboard_arrow_down'" @click="dropdown = !dropdown")
              q-avatar(v-if="user.isLogin")
                img(:src="user.avatar")
              | &emsp;
        //- Separator for mobile dropdown
        q-separator.nav-mobile(v-show="dropdown")
      //- Mobile dropdown
      q-slide-transition
        .container.nav-mobile(v-show="dropdown")
          //- Nav items
          q-list
            //- Docs
            q-item.text-grey7(clickable v-if="!user.isLogin" @click="openLink('/api/auth/login', '_self'); dropdown = !dropdown" active-class="text-white")
              q-item-section {{ $t('nav.manual') }}
            //- Links
            q-item.text-grey7(clickable @click="dropdown = !dropdown" v-for="(nav, idx) in navs" :key="idx" :to="nav.link" active-class="text-white")
              q-item-section {{ $t(nav.label) }}
            //- Login
            q-item.text-grey7(clickable v-if="!user.isLogin" @click="openLink(discordLoginURL, '_self'); dropdown = !dropdown" active-class="text-white")
              q-item-section {{ $t('nav.login') }}
            //- User Profile
            q-item.text-grey7(clickable @click="dropdown = !dropdown" :to="'/users/'+user._id" v-if="user.isLogin" active-class="text-white")
              q-item-section {{ $t('nav.myPage') }}
            //- Logout
            q-item.text-grey7(clickable v-if="user.isLogin" @click="$store.dispatch('user/logout')" active-class="text-white")
              q-item-section {{ $t('nav.logout') }}
            //- Language options
            q-btn-dropdown.full-width(align="between" stretch flat :label="$t('nav.lang')")
              q-list
                q-item(clickable v-close-popup v-for="(locale, lid) in localeOptions" :key="lid" @click=" updateLocale(locale)")
                  q-item-section
                    q-item-label {{ locale.toUpperCase() }}
  //- Page Content
  q-page-container
    router-view.q-mb-xl(:key="$route.fullPath")
  //- Footer
  q-footer.bg-techgrey.text-white.relative-position(bordered)
    .container
      q-toolbar
        p.q-mb-none &copy; {{ new Date().getFullYear() }} TECHMANIA DEV TEAM
        q-space
        q-btn.q-mr-xs(flat round icon="fab fa-youtube" color="tech" @click="openLink('https://www.youtube.com/channel/UCoHxk7shdAKf7W3yqUJlDaA')")
        q-btn.q-mr-xs(flat round icon="fab fa-discord" color="tech" @click="openLink('https://discord.gg/K4Nf7AnAZt')")
        q-btn.q-mr-xs(flat round icon="fab fa-github" color="tech" @click="openLink('https://github.com/techmania-team/techmania')")
        q-btn(flat round icon="fab fa-reddit-alien" color="tech" @click="openLink('https://www.reddit.com/r/TechMania/')")
</template>

<script setup>
import { ref } from 'vue'
import { localeOptions } from 'src/i18n'
import { useUserStore } from 'src/stores/user'
import { useI18n } from 'vue-i18n'
import { openLink } from 'src/utils/link'

const user = useUserStore()
const { locale } = useI18n()

// Dropdown state
const dropdown = ref(false)

// Nav items
const navs = [
  {
    link: '/changelog',
    label: 'nav.changelog',
  },
  {
    link: '/patterns',
    label: 'nav.patterns',
  },
  {
    link: '/skins',
    label: 'nav.skins',
  },
]

/**
 * Update the locale of the user
 * @param {string} value - The new locale
 */
const updateLocale = (value) => {
  locale.value = value
  user.locale = value
}
</script>
