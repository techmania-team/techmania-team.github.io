import type { ISessionUser } from './session'
import 'express-session'

declare module 'express-session' {
  interface SessionData {
    passport?: {
      user?: ISessionUser
    }
  }
}
