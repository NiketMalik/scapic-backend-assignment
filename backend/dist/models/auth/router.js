const express = require('express')
const router = express.Router()

const Auth = require('./')

router.post('/link', Auth.link)
router.delete('/link', Auth.unLink)

router.post('/login', Auth.login)
router.post('/register', Auth.register)

module.exports = router