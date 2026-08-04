import { Router } from 'express'
import { getById } from '../controllers/users'

const router = Router()

router.get('/:id', getById)

export default router
