import type { TUserDocument } from '../models/user'

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends TUserDocument {}
  }
}
