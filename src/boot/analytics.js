import gtm from 'src/components/gtm.js'

export default ({ router }) => {
  router.afterEach((to, from) => {
    gtm.logPage(to.path)
  })
}
