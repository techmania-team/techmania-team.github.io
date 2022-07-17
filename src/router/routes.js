const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/PageIndex.vue'), meta: { title: 'TECHMANIA', login: false } },
      { path: 'changelog', component: () => import('pages/PageChangelog.vue'), meta: { title: 'TECHMANIA | Changelog', login: false } },
      { path: 'patterns/new', component: () => import('pages/PagePatternForm.vue'), meta: { title: 'TECHMANIA | New Pattern', login: true, recaptcha: true } },
      { path: 'patterns/edit/:id', component: () => import('pages/PagePatternForm.vue'), meta: { title: 'TECHMANIA | Edit Pattern', login: true, recaptcha: true } },
      { path: 'patterns/:id', component: () => import('pages/PagePattern.vue'), meta: { title: 'TECHMANIA', login: false, recaptcha: true } },
      { path: 'patterns', component: () => import('pages/PagePatterns.vue'), meta: { title: 'TECHMANIA | Patterns', login: false } },
      { path: 'skins/new', component: () => import('pages/PageSkinForm.vue'), meta: { title: 'TECHMANIA | New Skin', login: true, recaptcha: true } },
      { path: 'skins/edit/:id', component: () => import('pages/PageSkinForm.vue'), meta: { title: 'TECHMANIA | Edit Skin', login: true, recaptcha: true } },
      { path: 'skins/:id', component: () => import('pages/PageSkin.vue'), meta: { title: 'TECHMANIA', login: false, recaptcha: true } },
      { path: 'skins', component: () => import('pages/PageSkins.vue'), meta: { title: 'TECHMANIA | Skins', login: false } },
      {
        path: 'users/:id',
        component: () => import('src/pages/profile/PageIndex.vue'),
        meta: { title: 'TECHMANIA', login: false },
        children: [
          { path: '', component: () => import('src/pages/profile/PagePatterns.vue'), meta: { title: 'TECHMANIA', login: false } },
          { path: 'patterns', component: () => import('src/pages/profile/PagePatterns.vue'), meta: { title: 'TECHMANIA', login: false } },
          { path: 'skins', component: () => import('src/pages/profile/PageSkins.vue'), meta: { title: 'TECHMANIA', login: false } },
          { path: 'comments', component: () => import('src/pages/profile/PageComments.vue'), meta: { title: 'TECHMANIA', login: false } }
        ]
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:pathMatch(.*)*',
    component: () => import('pages/NotFound.vue'),
    meta: { title: '404 | TECHMANIA', login: false }
  }
]

export default routes
