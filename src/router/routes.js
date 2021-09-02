const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue'), meta: { title: 'TECHMANIA', login: false } },
      { path: 'changelog', component: () => import('pages/Changelog.vue'), meta: { title: 'TECHMANIA | Changelog', login: false } },
      { path: 'patterns/new', component: () => import('pages/PatternForm.vue'), meta: { title: 'TECHMANIA | New Pattern', login: true } },
      { path: 'patterns/edit/:id', component: () => import('pages/PatternForm.vue'), meta: { title: 'TECHMANIA | Edit Pattern', login: true } },
      { path: 'patterns/:id', component: () => import('pages/Pattern.vue'), meta: { title: 'TECHMANIA', login: false } },
      { path: 'patterns', component: () => import('pages/Patterns.vue'), meta: { title: 'TECHMANIA | Patterns', login: false } },
      { path: 'skins/new', component: () => import('pages/SkinForm.vue'), meta: { title: 'TECHMANIA | New Skin', login: true } },
      { path: 'skins/edit/:id', component: () => import('pages/SkinForm.vue'), meta: { title: 'TECHMANIA | Edit Skin', login: true } },
      { path: 'skins/:id', component: () => import('pages/Skin.vue'), meta: { title: 'TECHMANIA', login: false } },
      { path: 'skins', component: () => import('pages/Skins.vue'), meta: { title: 'TECHMANIA | Skins', login: false } },
      { path: 'users/:id/', component: () => import('src/pages/Profile.vue'), meta: { title: 'TECHMANIA', login: true } }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue'),
    meta: { title: '404 | TECHMANIA', login: false }
  }
]

export default routes
