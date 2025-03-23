import { localeOptions } from 'src/i18n'

const routes = [
  {
    path: `/:locale(${localeOptions.join('|')})?`,
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/IndexPage.vue'),
        name: 'index',
        meta: { login: false },
      },
      {
        path: 'changelog',
        component: () => import('pages/ChangelogPage.vue'),
        name: 'changelog',
        meta: { login: false },
      },
      // {
      //   path: 'howtoplay',
      //   component: () => import('pages/HowToPlayPage.vue'),
      //   meta: { login: false },
      // },
      {
        path: 'patterns',
        children: [
          {
            path: '',
            component: () => import('pages/PatternsPage.vue'),
            name: 'patterns',
            meta: { login: false },
          },
          {
            path: 'new',
            component: () => import('pages/PatternFormNewPage.vue'),
            name: 'pattern-form-new',
            meta: { login: true, recaptcha: true },
          },
          {
            path: ':id',
            component: () => import('pages/PatternPage.vue'),
            name: 'pattern',
            meta: { login: false, recaptcha: true },
          },
          {
            path: ':id/edit',
            component: () => import('pages/PatternFormEditPage.vue'),
            name: 'pattern-form-edit',
            meta: { login: true, recaptcha: true },
          },
        ],
      },
      {
        path: 'skins',
        children: [
          {
            path: '',
            component: () => import('pages/SkinsPage.vue'),
            name: 'skins',
            meta: { login: false },
          },
          {
            path: 'new',
            component: () => import('pages/SkinFormNewPage.vue'),
            name: 'skin-form-new',
            meta: { login: true, recaptcha: true },
          },
          {
            path: ':id',
            component: () => import('pages/SkinPage.vue'),
            name: 'skin',
            meta: { login: false, recaptcha: true },
          },
          {
            path: ':id/edit',
            component: () => import('pages/SkinFormEditPage.vue'),
            name: 'skin-form-edit',
            meta: { login: true, recaptcha: true },
          },
        ],
      },
      {
        path: 'users/:id/:tab?',
        component: () => import('src/pages/profile/IndexPage.vue'),
        meta: { login: false },
        name: 'profile',
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
    meta: { login: false },
  },
]

export default routes
