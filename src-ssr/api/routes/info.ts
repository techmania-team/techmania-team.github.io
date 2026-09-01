import { Router } from 'express'
import { getChangelogs, getReleases } from '../controllers/info'

const router = Router()

router.get('/releases', getReleases)
router.get('/changelogs', getChangelogs)

export default router
