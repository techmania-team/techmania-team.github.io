<template lang="pug">
q-layout(view='hHh lpR fff')
  //- Header
  q-header.bg-techgrey.text-white(reveal elevated)
    .container
      //- Navbar
      q-toolbar
        //- Site Title
        q-toolbar-title
          q-btn(:to="getI18nRoute({ name: 'index' })" flat)
            q-avatar
              img(:src="'/assets/notes/basic.png'")
            | &nbsp;TECHMANIA
        //- Navbar items
        q-tabs(active-color="tech")
          //- PC navigation item
          template(v-if="$q.screen.gt.sm")
            //- Links
            q-route-tab(v-for="(nav, idx) in navs" :key="idx" v-bind="nav")
            //- Login
            q-route-tab(v-if="!user.isLogin" href="/api/auth/login" :label="$t('nav.login')")
            //- Language options
            q-btn-dropdown(stretch flat)
              template(#label)
                q-icon(name="translate")
              q-list
                q-item(clickable v-close-popup v-for="(locale, lid) in localeOptions" :key="lid" @click="setLocaleOption(locale)")
                  q-item-section
                    q-item-label {{ locale.toUpperCase() }}
            //- User dropdown
            q-btn-dropdown(stretch flat v-if="user.isLogin")
              //- User avatar
              template(#label)
                q-avatar
                  img(:src="user.avatar")
              //- User dropdown items
              q-list
                template(v-for="(nav, idx) in loginNavs" :key="idx")
                  //- User Profile
                  q-item(clickable v-close-popup v-bind="nav" active-class="text-white")
                    q-item-section
                      q-item-label {{ nav.label }}
          //-   Nav Collapse button for mobile
          template(v-else)
            q-btn(:label="user.isLogin ? '' : $t('nav.menu')" :icon-right="dropdown ? 'keyboard_arrow_up' : 'keyboard_arrow_down'" @click="dropdown = !dropdown")
              q-avatar(v-if="user.isLogin")
                img(:src="user.avatar")
      //- Separator for mobile dropdown
      q-separator(v-if="!$q.screen.gt.sm && dropdown")
    //- Mobile dropdown
    q-slide-transition
      //- Set position to absolute to prevent the dropdown from pushing the content down
      .container.bg-techgrey.absolute(v-if="!$q.screen.gt.sm && dropdown")
        //- Nav items
        q-list
          //- Links
          q-item.text-grey7(clickable v-close-popup @click="dropdown = !dropdown" v-for="(nav, idx) in navs" :key="idx" v-bind="nav" active-class="text-white")
            q-item-section {{ nav.label }}
          //- Login
          q-item.text-grey7(clickable v-if="!user.isLogin" href="/api/auth/login" active-class="text-white")
            q-item-section {{ $t('nav.login') }}
          //- User dropdown
          template(v-if="user.isLogin")
            template(v-for="(nav, idx) in loginNavs" :key="idx")
              q-item.text-grey7(clickable v-bind="nav" @click="dropdown = !dropdown" active-class="text-white")
                q-item-section {{ nav.label }}
          //- Language options
          q-btn-dropdown.full-width(align="between" stretch flat :label="$t('nav.language')")
            q-list
              q-item(clickable v-close-popup v-for="(locale, lid) in localeOptions" :key="lid" @click="setLocaleOption(locale)")
                q-item-section
                  q-item-label {{ locale.toUpperCase() }}
  //- Page Content
  q-page-container
    router-view.q-mb-xl(:key="$route.name")
    //- Back to top button
    q-page-scroller(position="bottom-right" :scroll-offset="150" :offset="[18, 18]")
      q-btn(fab icon="keyboard_arrow_up" color="tech" text-color="black")
  //- Footer
  q-footer.bg-techgrey.text-white.relative-position(bordered)
    .container
      q-toolbar
        p.q-mb-none &copy; {{ new Date().getFullYear() }} TECHMANIA
        q-space
        q-btn.q-mr-xs(flat round icon="fab fa-youtube" color="tech" href="https://www.youtube.com/channel/UCoHxk7shdAKf7W3yqUJlDaA" target="_blank")
        q-btn.q-mr-xs(flat round icon="fab fa-discord" color="tech" href="https://discord.gg/K4Nf7AnAZt" target="_blank")
        q-btn.q-mr-xs(flat round icon="fab fa-github" color="tech" href="https://github.com/techmania-team/techmania" target="_blank")
        q-btn(flat round icon="fab fa-reddit-alien" color="tech" href="https://www.reddit.com/r/TechMania/" target="_blank")
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { localeOptions, setLocale, getI18nRoute } from 'src/i18n'
import { useUserStore } from 'src/stores/user'

const user = useUserStore()
const { t } = useI18n()
const router = useRouter()
const route = useRoute()

// Dropdown state
const dropdown = ref(false)

// Nav items
const navs = computed(() => [
  // {
  //   to: '/howtoplay',
  //   label: t('nav.howtoplay'),
  // },
  {
    href: 'https://techmania-team.github.io/techmania-docs/',
    label: t('nav.documentations'),
    target: '_blank',
  },
  {
    to: getI18nRoute({ name: 'changelog' }),
    label: t('nav.changelog'),
  },
  {
    to: getI18nRoute({ name: 'patterns' }),
    label: t('nav.patterns'),
  },
  {
    to: getI18nRoute({ name: 'skins' }),
    label: t('nav.skins'),
  },
])

const loginNavs = computed(() => [
  {
    to: getI18nRoute({ name: 'profile', params: { tab: 'patterns', id: user._id } }),
    label: t('nav.myPage'),
  },
  {
    to: getI18nRoute({ name: 'pattern-form-new' }),
    label: t('nav.submitNewPattern'),
  },
  {
    to: getI18nRoute({ name: 'skin-form-new' }),
    label: t('nav.submitNewSkin'),
  },
  {
    to: getI18nRoute({ name: 'setlist-form-new' }),
    label: t('nav.submitNewSetlist'),
  },
  {
    href: '/api/auth/logout',
    label: t('nav.logout'),
  },
])

const setLocaleOption = async (locale) => {
  await setLocale(locale)
  router.replace(getI18nRoute(route))
  dropdown.value = false
}
</script>
