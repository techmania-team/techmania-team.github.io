import express from 'express'
import { create, searchID } from '../controllers/setlists'
import { isAuthenticated } from '../middleware/auth'
import recaptcha from '../middleware/recaptcha'
import guild from '../middleware/guild'

const router = express.Router()

router.post('/', recaptcha, isAuthenticated, guild, create)
router.get('/:id', searchID)

export default router
