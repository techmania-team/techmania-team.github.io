import express from 'express'
import { getById } from '../controllers/users'

const router = express.Router()

router.get('/:id', getById)

export default router
