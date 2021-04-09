const express = require('express')
const { create, search, searchID, del } = require('../controllers/patterns.js')
const auth = require('../middleware/auth')
const router = express.Router()

router.post('/', auth, create)
router.get('/', search)
router.get('/:id', searchID)
router.delete('/:id', auth, del)

module.exports = router
