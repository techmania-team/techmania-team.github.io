const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/IndexPage.vue'),
        meta: { title: 'TECHMANIA', login: false },
      },
      {
        path: 'changelog',
        component: () => import('pages/ChangelogPage.vue'),
        meta: { title: 'TECHMANIA | Changelog', login: false },
      },
      {
        path: 'patterns/new',
        component: () => import('pages/PatternForm.vue'),
        meta: { title: 'TECHMANIA | New Pattern', login: true, recaptcha: true },
      },
      {
        path: 'patterns/edit/:id',
        component: () => import('pages/PatternForm.vue'),
        meta: { title: 'TECHMANIA | Edit Pattern', login: true, recaptcha: true },
      },
      {
        path: 'patterns/:id',
        component: () => import('pages/Pattern.vue'),
        meta: { title: 'TECHMANIA', login: false, recaptcha: true },
      },
      {
        path: 'patterns',
        component: () => import('pages/PatternsPage.vue'),
        meta: { title: 'TECHMANIA | Patterns', login: false },
      },
      {
        path: 'skins/new',
        component: () => import('pages/SkinForm.vue'),
        meta: { title: 'TECHMANIA | New Skin', login: true, recaptcha: true },
      },
      {
        path: 'skins/edit/:id',
        component: () => import('pages/SkinForm.vue'),
        meta: { title: 'TECHMANIA | Edit Skin', login: true, recaptcha: true },
      },
      {
        path: 'skins/:id',
        component: () => import('pages/Skin.vue'),
        meta: { title: 'TECHMANIA', login: false, recaptcha: true },
      },
      {
        path: 'skins',
        component: () => import('pages/Skins.vue'),
        meta: { title: 'TECHMANIA | Skins', login: false },
      },
      {
        path: 'users/:id',
        component: () => import('src/pages/profile/Index.vue'),
        meta: { title: 'TECHMANIA', login: false },
        children: [
          {
            path: '',
            component: () => import('src/pages/profile/Patterns.vue'),
            meta: { title: 'TECHMANIA', login: false },
          },
          {
            path: 'patterns',
            component: () => import('src/pages/profile/Patterns.vue'),
            meta: { title: 'TECHMANIA', login: false },
          },
          {
            path: 'skins',
            component: () => import('src/pages/profile/Skins.vue'),
            meta: { title: 'TECHMANIA', login: false },
          },
          {
            path: 'comments',
            component: () => import('src/pages/profile/Comments.vue'),
            meta: { title: 'TECHMANIA', login: false },
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
    meta: { title: '404 | TECHMANIA', login: false },
  },
]

export default routes
