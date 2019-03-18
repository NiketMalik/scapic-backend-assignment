const express = require('express')
const router = express.Router()

const User = require('./')
router.get('/profile', User.profile)
router.delete('/profile', User.deleteProfile)

module.exports = router