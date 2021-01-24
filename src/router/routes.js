const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue'), meta: { title: 'TECHMANIA', login: false } },
      { path: 'howtoplay', component: () => import('pages/HowToPlay.vue'), meta: { title: 'TECHMANIA | How To Play', login: false } },
      { path: 'changelog', component: () => import('pages/Changelog.vue'), meta: { title: 'TECHMANIA | Changelog', login: false } },
      { path: 'patterns', component: () => import('pages/Patterns.vue'), meta: { title: 'TECHMANIA | Patterns', login: false } },
      { path: 'mypage', component: () => import('pages/MyPage.vue'), meta: { title: 'TECHMANIA | My Page', login: true } }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
