import express from 'express'
import { create, search, searchID, del, update } from '../controllers/skins'
import { isAuthenticated } from '../middleware/auth'
import recaptcha from '../middleware/recaptcha'
import guild from '../middleware/guild'

const router = express.Router()

router.post('/', recaptcha, isAuthenticated, guild, create)
router.get('/', search)
router.get('/:id', searchID)
router.delete('/:id', isAuthenticated, guild, del)
router.patch('/:id', recaptcha, isAuthenticated, guild, update)

export default router
