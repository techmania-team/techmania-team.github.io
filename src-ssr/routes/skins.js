import express from 'express'
import { create, search, searchID, del, update } from '../controllers/skins.js'
import auth from '../middlewares/auth'
import recaptcha from '../middlewares/recaptcha'
import guild from '../middlewares/guild'
const router = express.Router()

router.post('/', recaptcha, auth, guild, create)
router.get('/', search)
router.get('/:id', searchID)
router.delete('/:id', auth, guild, del)
router.patch('/:id', recaptcha, auth, guild, update)

export default router
