import { Strategy, Scope } from 'passport-discord-auth'
import User from '../models/users'
import handleServerError from '../utils/handleServerError'

export default new Strategy(
  {
    clientId: process.env.DISCORD_CLIENT,
    clientSecret: process.env.DISCORD_SECRET,
    callbackUrl: new URL('/api/auth/login/callback', process.env.HOST_URL).toString(),
    scope: [Scope.Identify, Scope.Guilds],
  },
  /**
   *
   * @param {string} accessToken Discord API access token
   * @param {string} refreshToken Discord API refresh token
   * @param {*} profile Discord user profile
   * @param {function} done Callback function
   */
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Find or create a user
      const user = await User.findOneAndUpdate(
        { discord: profile.id },
        {
          discord: profile.id,
          name: profile.global_name,
          avatar: profile.avatar,
        },
        { upsert: true, new: true },
      )
      // Return user info
      done(null, {
        _id: user._id,
        discord: user.discord,
        name: user.name,
        avatar: user.avatar,
        accessToken,
        refreshToken,
      })
    } catch (error) {
      handleServerError(error)
      // Return error
      done(error, null)
    }
  },
)
