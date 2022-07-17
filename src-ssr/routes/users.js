import express from 'express'
import { login, extend, logout, verify, getById, getAvatarById } from '../controllers/users.js'
import auth from '../middlewares/auth'
const router = express.Router()

router.get('/login', login)
router.post('/extend', auth, extend)
router.delete('/logout', auth, logout)
router.get('/verify', auth, verify)
router.get('/avatar/:id', getAvatarById)
router.get('/:id', getById)

export default router
