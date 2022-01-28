const express = require('express')
const { create, search, searchID, del, update, indexvideo } = require('../controllers/patterns.js')
const auth = require('../middleware/auth')
const recaptcha = require('../middleware/recaptcha')
const router = express.Router()

router.post('/', recaptcha, auth, create)
router.get('/', search)
router.get('/indexvideo', indexvideo)
router.get('/:id', searchID)
router.delete('/:id', auth, del)
router.patch('/:id', recaptcha, auth, update)

module.exports = router
