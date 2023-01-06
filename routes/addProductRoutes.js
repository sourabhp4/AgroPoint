const express = require('express')
const router = express.Router()

const { addProduct, updateProduct, deleteProduct } = require('../controller/addUpdateProductController')

router.route('/').post(addProduct).put(updateProduct).delete(deleteProduct)

module.exports = router