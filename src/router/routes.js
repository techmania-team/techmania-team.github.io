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
        path: 'patterns/new',
        component: () => import('pages/PatternFormPage.vue'),
        meta: { login: true, recaptcha: true },
      },
      {
        path: 'patterns/:id/edit',
        component: () => import('pages/PatternFormPage.vue'),
        meta: { login: true, recaptcha: true },
      },
      {
        path: 'patterns/:id',
        component: () => import('pages/PatternPage.vue'),
        meta: { login: false, recaptcha: true },
      },
      {
        path: 'patterns',
        component: () => import('pages/PatternsPage.vue'),
        meta: { login: false },
      },
      {
        path: 'skins/new',
        component: () => import('pages/SkinFormPage.vue'),
        meta: { login: true, recaptcha: true },
      },
      {
        path: 'skins/:id/edit',
        component: () => import('pages/SkinFormPage.vue'),
        meta: { login: true, recaptcha: true },
      },
      {
        path: 'skins/:id',
        component: () => import('pages/SkinPage.vue'),
        meta: { login: false, recaptcha: true },
      },
      {
        path: 'skins',
        component: () => import('pages/SkinsPage.vue'),
        meta: { login: false },
      },
      {
        path: 'users/:id',
        component: () => import('src/pages/profile/IndexPage.vue'),
        meta: { login: false },
        children: [
          {
            path: '',
            component: () => import('src/pages/profile/PatternsPage.vue'),
            meta: { login: false },
          },
          {
            path: 'patterns',
            component: () => import('src/pages/profile/PatternsPage.vue'),
            meta: { login: false },
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
