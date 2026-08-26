import { Router } from 'express'
import {
  create,
  createReply,
  deleteMyReply,
  getByPattern,
  getBySetlist,
  getBySkin,
  getByUser,
  getMyCommmentByPattern,
  getMyCommmentBySetlist,
  getMyCommmentBySkin,
  updateMyComment,
  updateMyReply,
  updateReplyVote,
} from '../controllers/comments.js'
import { isAuthenticated } from '../middlewares/auth'
import recaptcha from '../middlewares/recaptcha'

const router = Router()

// Params description:
// pid = pattern id
// sid = skin id
// setid = setlist id
// uid = user id
// cid = comment id
// rid = reply id
router.post('/', recaptcha, isAuthenticated, create)
router.get('/pattern/:pid/my', isAuthenticated, getMyCommmentByPattern)
router.get('/pattern/:pid', getByPattern)
router.get('/skin/:sid/my', isAuthenticated, getMyCommmentBySkin)
router.get('/skin/:sid', getBySkin)
router.get('/setlist/:setid/my', isAuthenticated, getMyCommmentBySetlist)
router.get('/setlist/:setid', getBySetlist)
router.get('/user/:uid', getByUser)
router.patch('/:cid', recaptcha, isAuthenticated, updateMyComment)
router.post('/:cid/replies', recaptcha, isAuthenticated, createReply)
router.patch('/:cid/replies/:rid', recaptcha, isAuthenticated, updateMyReply)
router.delete('/:cid/replies/:rid', recaptcha, isAuthenticated, deleteMyReply)
router.patch('/:cid/replies/:rid/votes', recaptcha, isAuthenticated, updateReplyVote)

export default router
