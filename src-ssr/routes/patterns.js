const express = require('express')
const { create, search, searchID, del, update, indexvideo } = require('../controllers/patterns.js')
const auth = require('../middleware/auth')
const recaptcha = require('../middleware/recaptcha')
const guild = require('../middleware/guild')
const router = express.Router()

router.post('/', recaptcha, auth, guild, create)
router.get('/', search)
router.get('/indexvideo', indexvideo)
router.get('/:id', searchID)
router.delete('/:id', auth, guild, del)
router.patch('/:id', recaptcha, auth, guild, update)

module.exports = router
