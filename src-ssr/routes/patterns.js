const express = require('express')
const { create, search, searchID, del, update, indexvideo } = require('../controllers/patterns.js')
const auth = require('../middleware/auth')
const router = express.Router()

router.post('/', auth, create)
router.get('/', search)
router.get('/indexvideo', indexvideo)
router.get('/:id', searchID)
router.delete('/:id', auth, del)
router.patch('/:id', auth, update)

module.exports = router
