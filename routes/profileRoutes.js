const express = require('express')
const router = express.Router()

const { getProfile, updateProfile } = require('../controller/profileController')

router.route('/').put(updateProfile).get(getProfile)

module.exports = router