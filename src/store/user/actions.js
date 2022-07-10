import router from '../../router'

export async function verify ({ commit, state }, query) {
  if (process.env.CLIENT) {
    try {
      if (query.jwt) {
        commit('addjwt', query.jwt)
        router().replace({ query: {} })
      }

      if (state.jwt.length > 0) {
        const { data: loginData } = await this._vm.$api.get('/users/verify',
          {
            headers: {
              Authorization: `Bearer ${state.jwt}`
            }
          }
        )
        commit('login', loginData.result)
        const { data } = await this._vm.$axios.get('https://discord.com/api/users/@me',
          {
            headers: {
              Authorization: `Bearer ${state.token}`
            }
          }
        )
        commit('loginDiscord', data)
      }
    } catch (error) {
      console.log(error)
      commit('logout')
    }
  }
}

export async function logout ({ commit, state }) {
  try {
    if (state.jwt.length > 0) {
      await this._vm.$api.delete('/users/logout', {
        headers: { Authorization: `Bearer ${state.jwt}` }
      })
    }
  } catch (error) {
    console.log(error)
  }
  commit('logout')
  router().push('/').catch(() => {})
}
