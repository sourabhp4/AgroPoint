const express = require('express')
const router = express.Router()

const { createProfile } = require('../controller/signUpController')

router.route('/').post(createProfile)

module.exports = router