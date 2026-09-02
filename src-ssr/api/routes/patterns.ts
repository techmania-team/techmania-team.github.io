import { Router } from 'express'
import { create, del, getImage, search, searchID, update } from '../controllers/patterns.js'
import { isAuthenticated } from '../middlewares/auth'
import guild from '../middlewares/guild'
import turnstile from '../middlewares/turnstile'

const router = Router()

router.post('/', turnstile({ expectedAction: 'pattern-create' }), isAuthenticated, guild, create)
router.get('/', search)
router.get('/:id', searchID)
router.get('/:id/image', getImage)
router.delete('/:id', isAuthenticated, guild, del)
router.patch(
  '/:id',
  turnstile({ expectedAction: 'pattern-update' }),
  isAuthenticated,
  guild,
  update,
)

export default router
