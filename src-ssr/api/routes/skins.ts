import { Router } from 'express'
import { create, del, search, searchID, update } from '../controllers/skins'
import { isAuthenticated } from '../middlewares/auth'
import guild from '../middlewares/guild'
import recaptcha from '../middlewares/recaptcha'

const router = Router()

router.post('/', recaptcha, isAuthenticated, guild, create)
router.get('/', search)
router.get('/:id', searchID)
router.delete('/:id', isAuthenticated, guild, del)
router.patch('/:id', recaptcha, isAuthenticated, guild, update)

export default router
