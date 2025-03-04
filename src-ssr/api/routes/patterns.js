import express from 'express'
import { create, search, searchID, del, update, indexvideo } from '../controllers/patterns.js'
import { isAuthenticated } from '../middleware/auth'
import recaptcha from '../middleware/recaptcha'
import guild from '../middleware/guild'

const router = express.Router()

router.post('/', recaptcha, isAuthenticated, guild, create)
router.get('/', search)
router.get('/indexvideo', indexvideo)
router.get('/:id', searchID)
router.delete('/:id', isAuthenticated, guild, del)
router.patch('/:id', recaptcha, isAuthenticated, guild, update)

export default router
