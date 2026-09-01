import type { DiscordProfile, VerifyCallback } from 'discord-strategy'
import { DiscordScope, Strategy } from 'discord-strategy'
import User from '../models/user'

export default new Strategy(
  {
    clientID: import.meta.env.DISCORD_CLIENT || '',
    clientSecret: import.meta.env.DISCORD_SECRET || '',
    callbackURL: new URL(
      '/api/auth/login/callback',
      import.meta.env.QCLI_HOST_URL || '',
    ).toString(),
    scope: [DiscordScope.Identify],
    // Note:
    // According to documentation, these fields are not required.
    // But we needs these fields to prevent TS error.
    tokenURL: '',
    authorizationURL: '',
  },
  // Note:
  // No async await here
  // Promise returned in function argument where a void return was expected. eslint@typescript-eslint/no-misused-promises
  (accessToken: string, refreshToken: string, profile: DiscordProfile, done: VerifyCallback) => {
    // Find or create a user
    User.findOneAndUpdate(
      { discord: profile.id },
      {
        discord: profile.id,
        name: profile.global_name,
        avatar: profile.avatar,
      },
      { upsert: true, returnDocument: 'after' },
    )
      .then((user) => {
        // Return user info
        done(null, user)
      })
      .catch((error) => {
        // Return error
        done(error)
      })
  },
)
