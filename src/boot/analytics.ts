import { createGtag, pageview } from 'vue-gtag'
import { defineBoot } from '#q-app'

const gtag = createGtag({
  tagId: 'G-TFLEGL8F3K',
})

export default defineBoot(({ app, router }) => {
  app.use(gtag)

  router.afterEach((to) => {
    pageview(to.path)
  })
})
