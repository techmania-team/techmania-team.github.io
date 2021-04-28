const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue'), meta: { title: 'TECHMANIA', login: false } },
      { path: 'changelog', component: () => import('pages/Changelog.vue'), meta: { title: 'Changelog | TECHMANIA', login: false } },
      { path: 'patterns/new', component: () => import('pages/PatternForm.vue'), meta: { title: 'New Pattern | TECHMANIA', login: true } },
      { path: 'patterns/edit/:id', component: () => import('pages/PatternForm.vue'), meta: { title: 'Edit Pattern | TECHMANIA', login: true } },
      { path: 'patterns/:id', component: () => import('pages/Pattern.vue'), meta: { title: 'TECHMANIA', login: false } },
      { path: 'patterns', component: () => import('pages/Patterns.vue'), meta: { title: 'Patterns | TECHMANIA', login: false } },
      { path: 'mypage', component: () => import('pages/MyPage.vue'), meta: { title: 'My Page | TECHMANIA', login: true } }
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
