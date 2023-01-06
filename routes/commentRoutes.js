const express = require('express')
const router = express.Router()

const { addComment, updateComment, deleteComment } = require('../controller/commentController')

router.route('/').post(addComment).put(updateComment).delete(deleteComment)

module.exports = router