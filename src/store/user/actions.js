import router from '../../router'

export async function verify ({ commit, state }, query) {
  if (process.env.CLIENT) {
    try {
      if (state.jwt.length > 0) {
        await this._vm.$api.get('/users/verify',
          {
            headers: {
              Authorization: `Bearer ${state.jwt}`
            }
          })
      } else if (query.jwt && query.token) {
        commit('addjwt', query.jwt)
        commit('addtoken', query.token)
        commit('addid', query.id)
        router().replace({ query: {} })
      }

      if (state.token.length > 0) {
        const { data } = await this._vm.$axios.get('https://discord.com/api/users/@me',
          {
            headers: {
              Authorization: `Bearer ${state.token}`
            }
          }
        )
        commit('login', data)
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
