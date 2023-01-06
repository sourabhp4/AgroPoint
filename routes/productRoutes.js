const express = require('express')
const router = express.Router()

const { getProduct } = require('../controller/productController')

router.route('/').get(getProduct)

module.exports = router