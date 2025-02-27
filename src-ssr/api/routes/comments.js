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
import auth from '../middleware/auth'
import recaptcha from '../middleware/recaptcha'

const router = express.Router()

router.post('/', recaptcha, auth, create)
router.get('/patterns/:id/rating', getRatingByPattern)
router.get('/patterns/:id/my', auth, getMyCommmentByPattern)
router.get('/patterns/:id', getByPattern)
router.get('/skins/:id/rating', getRatingBySkin)
router.get('/skins/:id/my', auth, getMyCommmentBySkin)
router.get('/skins/:id', getBySkin)
router.get('/user/:id', getByUser)
router.patch('/:id', recaptcha, auth, updateComment)
router.post('/:cid/replies', recaptcha, auth, createReply)
router.patch('/:cid/replies/:rid', recaptcha, auth, updateReply)
router.patch('/:cid/replies/:rid/votes', auth, updateReplyVote)
router.delete('/:cid/', auth, deleteMyComment)

export default router
