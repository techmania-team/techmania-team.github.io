import express from 'express'
import {
  create,
  getRatingByPattern,
  getByPattern,
  getMyCommmentByPattern,
  getRatingBySkin,
  getBySkin,
  getMyCommmentBySkin,
  updateComment,
  createReply,
  updateReply,
  updateReplyVote,
  deleteMyComment,
  getByUser,
} from '../controllers/comments.js'
import { isAuthenticated } from '../middleware/auth'
import recaptcha from '../middleware/recaptcha'

const router = express.Router()

router.post('/', recaptcha, isAuthenticated, create)
router.get('/patterns/:id/rating', getRatingByPattern)
router.get('/patterns/:id/my', isAuthenticated, getMyCommmentByPattern)
router.get('/patterns/:id', getByPattern)
router.get('/skins/:id/rating', getRatingBySkin)
router.get('/skins/:id/my', isAuthenticated, getMyCommmentBySkin)
router.get('/skins/:id', getBySkin)
router.get('/user/:id', getByUser)
router.patch('/:id', recaptcha, isAuthenticated, updateComment)
router.post('/:cid/replies', recaptcha, isAuthenticated, createReply)
router.patch('/:cid/replies/:rid', recaptcha, isAuthenticated, updateReply)
router.patch('/:cid/replies/:rid/votes', isAuthenticated, updateReplyVote)
router.delete('/:cid/', isAuthenticated, deleteMyComment)

export default router
