'use strict'

const express = require('express')
const router = express.Router()

// Routes
router.use('/auth', require('./models/auth/router'))
router.use('/user', require('./models/user/router'))

module.exports = router