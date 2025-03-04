import passport from 'passport'

export const discordLogin = passport.authenticate('discord')

export const discordCallback = (req, res, next) => {
  // Authenticate with Discord
  passport.authenticate(
    'discord',
    {
      failureRedirect: '/api/auth/login',
    },
    (error, user) => {
      // Handle error
      if (error || !user) {
        return res.status(500).send({ success: false, message: 'Server Error' })
      }
      // Login
      req.logIn(user, (error) => {
        // Handle error
        if (error) {
          return res.status(500).send({ success: false, message: 'Server Error' })
        }
        // Next middleware
        next()
      })
    },
  )(req, res, next)
}

export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    next()
  } else {
    res.status(401).json({ success: false, message: 'Unauthorized' })
  }
}
