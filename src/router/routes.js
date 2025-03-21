const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/IndexPage.vue'),
        meta: { login: false },
      },
      {
        path: 'changelog',
        component: () => import('pages/ChangelogPage.vue'),
        meta: { login: false },
      },
      {
        path: 'howtoplay',
        component: () => import('pages/HowToPlayPage.vue'),
        meta: { login: false },
      },
      {
        path: 'patterns',
        children: [
          {
            path: '',
            component: () => import('pages/PatternsPage.vue'),
            meta: { login: false },
          },
          {
            path: 'new',
            component: () => import('pages/PatternFormPage.vue'),
            meta: { login: true, recaptcha: true },
          },
          {
            path: ':id',
            component: () => import('pages/PatternPage.vue'),
            meta: { login: false, recaptcha: true },
          },
          {
            path: ':id/edit',
            component: () => import('pages/PatternFormPage.vue'),
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
            meta: { login: false },
          },
          {
            path: 'new',
            component: () => import('pages/SkinFormPage.vue'),
            meta: { login: true, recaptcha: true },
          },
          {
            path: ':id',
            component: () => import('pages/SkinPage.vue'),
            meta: { login: false, recaptcha: true },
          },
          {
            path: ':id/edit',
            component: () => import('pages/SkinFormPage.vue'),
            meta: { login: true, recaptcha: true },
          },
        ],
      },
      {
        path: 'users/:id',
        component: () => import('src/pages/profile/IndexPage.vue'),
        meta: { login: false },
        children: [
          {
            path: 'patterns',
            component: () => import('src/pages/profile/PatternsPage.vue'),
            meta: { login: false },
            alias: '',
          },
          {
            path: 'skins',
            component: () => import('src/pages/profile/SkinsPage.vue'),
            meta: { login: false },
          },
          {
            path: 'comments',
            component: () => import('src/pages/profile/CommentsPage.vue'),
            meta: { login: false },
          },
        ],
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
