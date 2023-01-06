const express = require('express')
const router = express.Router()

const { validateProfile } = require('../controller/loginController')

router.route('/').get(validateProfile)

module.exports = router