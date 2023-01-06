const express = require('express')
const router = express.Router()

const { mailPassword } = require('../controller/mailController')

router.route('/').post(mailPassword)

module.exports = router