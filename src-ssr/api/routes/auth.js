import express from 'express'
import { discordLogin, discordCallback, isAuthenticated } from '../middleware/auth'
import { getInfo } from '../controllers/auth'

const router = express.Router()

router.get('/login', discordLogin)
router.get('/login/callback', discordCallback, (req, res) => {
  res.redirect('/')
})
router.get('/user', isAuthenticated, getInfo)

export default router
