import express from 'express'
import { getById, getAvatarById } from '../controllers/users'

const router = express.Router()

router.get('/avatar/:id', getAvatarById)
router.get('/:id', getById)

export default router
