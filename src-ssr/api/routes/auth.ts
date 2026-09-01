import { Router } from 'express'
import { getInfo } from '../controllers/auth'
import { discordCallback, discordLogin, discordLogout, isAuthenticated } from '../middlewares/auth'

const router = Router()

router.get('/login', discordLogin)
router.get('/login/callback', discordCallback, (req, res) => {
  res.redirect('/')
})
router.get('/logout', discordLogout)
router.get('/user', isAuthenticated, getInfo)

export default router
