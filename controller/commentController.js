
const asynchandler = require('express-async-handler')
const Joi = require('joi')
const connection = require('../config/db')

const addComment = asynchandler(async (req, res) => {
    
    const result = validate(req.body)

    if(result){
        res.status(400)
        throw new Error(result.details[0].message)
    }

    if(req.body.pid == null)
        throw new Error('product id is required')

    if(req.body.profile_type != 'user')
        return res.status(403).send({'message': 'No access'})

    connection.query(`select uid from user where email = "${req.body.email}"`, async (err, results, field) => {
        if (err) {
            res.status(500).send({"message": "Server error"})
        } else {
            if (results.length == 0) {
                return res.status(403).send({"message": "User has no privileges to add a comment"})
            }
            else{
                connection.query(`select * from comments where user_id = ${results[0].uid} and p_id = ${req.body.pid}`,
                async (err, results1, fields) => {
                    if(err)
                        return res.status(500).send({ "message": "Server Error"})
                    if(results1[0] != null)
                        return res.status(403).send({ "message": "You already commented, if you want, you can update the comment"})

                    insertComment(req, res, results[0].uid)
                })
            }
        }
    })

})

const updateComment = asynchandler(async (req, res) => {

    const result = validate(req.body)

    if(result){
        res.status(400)
        throw new Error(result.details[0].message)
    }
    
    if(req.body.pid == null)
        throw new Error('Product id is required')

    if(req.body.profile_type != 'user')
        return res.status(403).send({'message': 'No access'})

    connection.query(`select user_id, cid from comments where p_id = ${req.body.pid} and user_id in (select uid from user where email = "${req.body.email}") `, 
        async (err, results, field) => {
        if (err) {
            res.status(500).send({"message": "Server Error"})   
        } else {
            if (results.length == 0) {
                return res.status(403).send({"message": "User has no privileges to update a comment"})
            }
            else if(results[0].cid == null)
                return res.status(403).send({"message": "No comment found"})
            else{
                req.body.cid = results[0].cid
                connection.query(`update comments set comment = "${req.body.comment}", rating = ${req.body.rating} where cid = ${req.body.cid}`,
                async (err, results1, field) => {
                    if (err) {
                        res.status(500).send({"message": "Server Error"})
                    } else {
                        updateRating(req, res)
                    }
                })
            }
        }
    })

})

const deleteComment = asynchandler(async (req, res) => {
    
    if(req.body.pid == null)
        throw new Error('Product id is required')

    if(req.body.profile_type != 'user')
        return res.status(403).send({'message': 'No access'})

    connection.query(`select user_id, cid from comments where p_id = ${req.body.pid} and user_id in (select uid from user where email = "${req.body.email}" )`, 
        async (err, results, field) => {
        if (err) {
            res.status(500).send({"message": "Server error"})
        } else {
            if (results.length == 0) {
                return res.status(403).send({"message": "User has no privileges to delete a comment"})
            }
            else if(results[0].cid == null)
                return res.status(403).send({"message": "No comment found"})
            else{
                req.body.cid = results[0].cid
                connection.query(`delete from comments where cid = ${req.body.cid}`,
                async (err, results, field) => {
                    if (err) {
                        res.status(500).send({"message": "Server error"})
                    } else {
                        updateRating(req, res)
                    }
                })
            }
        }
    })

})

function insertComment(req, res, uid){
    connection.query(`insert into comments (comment, rating, user_id, p_id) values ("${req.body.comment}", ${req.body.rating}, ${uid}, ${req.body.pid} )`,
        async (err, results1, field) => {
            if (err) {
                console.log(err)
                if (err.errno === 1062) {
                    res.status(401).send(err.message)
                }
                res.status(500).send({'message': 'Server error'})
            } 
            else{
                updateRating(req, res)
            }
        }
    )
}

function updateRating(req, res){

    connection.query(`update products set rating = (select avg(rating) from comments) where pid = ${req.body.pid}`,
    async (err, results, field) => {
        if (err) {
            res.status(500).send({"message": "Server error"})
        } else {
            res.status(200).send({'message': 'Successfull'})
        }
    })

}

function validate(obj){
    const schema = Joi.object({
        pid: Joi.number(),
        cid: Joi.number(),

        rating: Joi.number()
        .valid(1, 2, 3, 4, 5)
        .required(),

        comment: Joi.string()
        .min(3)
        .max(255)
        .required(),

        email: Joi.string().required(),
        profile_type: Joi.string().required()
    })

    return schema.validate(obj).error
}

module.exports = {
    addComment,
    updateComment,
    deleteComment
}