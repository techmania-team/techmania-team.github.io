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
import turnstile from '../middlewares/turnstile'

const router = Router()

// Params description:
// pid = pattern id
// sid = skin id
// setid = setlist id
// uid = user id
// cid = comment id
// rid = reply id
router.post('/', turnstile({ expectedAction: 'comment-create' }), isAuthenticated, create)
router.get('/pattern/:pid/my', isAuthenticated, getMyCommmentByPattern)
router.get('/pattern/:pid', getByPattern)
router.get('/skin/:sid/my', isAuthenticated, getMyCommmentBySkin)
router.get('/skin/:sid', getBySkin)
router.get('/setlist/:setid/my', isAuthenticated, getMyCommmentBySetlist)
router.get('/setlist/:setid', getBySetlist)
router.get('/user/:uid', getByUser)
router.patch(
  '/:cid',
  turnstile({ expectedAction: 'comment-updateMyComment' }),
  isAuthenticated,
  updateMyComment,
)
router.post(
  '/:cid/replies',
  turnstile({ expectedAction: 'comment-createReply' }),
  isAuthenticated,
  createReply,
)
router.patch(
  '/:cid/replies/:rid',
  turnstile({ expectedAction: 'comment-updateMyReply' }),
  isAuthenticated,
  updateMyReply,
)
router.delete('/:cid/replies/:rid', isAuthenticated, deleteMyReply)
router.patch('/:cid/replies/:rid/votes', isAuthenticated, updateReplyVote)

export default router
