
const asynchandler = require('express-async-handler')
const Joi = require('joi')
const connection = require('../config/db')

const addProduct = asynchandler(async (req, res) => {
    
    const result = validate(req.body)

    if(result){
        res.status(400)
        throw new Error(result.details[0].message)
    }

    if(req.body.profile_type != 'org_user')
        return res.status(403).send({'message': 'No access'})

    connection.query(`select o_uid from org_user where email = "${req.body.email}"`, async (err, results, field) => {
        if (err) {
            res.status(500).send({"message": "Server error"})
        } else {
            if (results.length == 0) {
                return res.status(401).send({"message": "User has no privileges to add a product"})
            }
            else{
                connection.query(`update products (name, release_year, official_link, description, category_id, org_uid) values 
                ("${req.body.name}", ${req.body.release_year}, "${req.body.official_link}", "${req.body.description}", ${req.body.category_id}, ${results[0].o_uid})`,
                 (err, results, field) => {
                    if (err) {
                        console.log(err)
                        if (err.errno === 1062) {
                            res.status(401).send(err.message)
                        }
                        res.status(500).send({'message': 'Server error'})
                    } 
                    else 
                        res.status(200).send({'message': 'Product created successfully'})
                })
            }
        }
    })

})

const updateProduct = asynchandler(async (req, res) => {
    
    const result = validate(req.body)

    if(result){
        res.status(400)
        throw new Error(result.details[0].message)
    }

    if(req.body.pid == null){
        res.status(400)
        throw new Error('Product id is required')
    }

    if(req.body.profile_type != 'org_user')
        return res.status(403).send({'message': 'No access'})

    connection.query(`select u.uid, c.cid, c.p_id from user u, comments c where u.email = "${req.body.email}" and c.cid = ${req.body.cid}`, async (err, results, field) => {
        if (err) {
            res.status(500).send({"message": "Server error"})   
        } else {
            if (results.length == 0) {
                return res.status(403).send({"message": "User has no privileges to update a comment"})
            }
            else if(results[0].cid == null)
                return res.status(403).send({"message": "No comment found"})
            else{
                req.body.pid = results[0].p_id
                connection.query(`update comments set comment = "${req.body.comment}", rating = ${req.body.rating} where cid = ${req.body.cid}`,
                async (err, results1, field) => {
                    if (err) {
                        res.status(500).send({"message": err})
                    } else {
                        
                    }
                })
            }
        }
    })

})

const deleteProduct = asynchandler(async (req, res) => {
    
    const result = validate(req.body)

    if(result){
        res.status(400)
        throw new Error(result.details[0].message)
    }

    connection.query(`select email, o_uid from org_user where email = "${req.body.email}"`, async (err, results, field) => {
        if (err) {
            res.status(500).send({"message": "Server error"})
        } else {
            if (results.length == 0) {
                return res.status(401).send({"message": "User has no privileges to add a product"})
            }
            else{
                connection.query(`insert into products (name, release_year, official_link, description, category_id, org_uid) values 
                ("${req.body.name}", ${req.body.release_year}, "${req.body.official_link}", "${req.body.description}", ${req.body.category_id}, ${results[0].o_uid})`,
                 (err, results, field) => {
                    if (err) {
                        console.log(err)
                        if (err.errno === 1062) {
                            res.status(401).send(err.message)
                        }
                        res.status(500).send({'message': 'Server error'})
                    } 
                    else 
                        res.status(200).send({'message': 'Product created successfully'})
                })
            }
        }
    })

})

function validate(obj){
    const schema = Joi.object({
        name: Joi.string()
        .max(45)
        .required(),

        release_year: Joi.number()
        .required(),

        official_link: Joi.string()
        .required(),

        description: Joi.string()
        .required(),

        category_id: Joi.number()
        .required(),

        pid: Joi.number(),

        email: Joi.string().required(),
        profile_type: Joi.string().required()
    })

    return schema.validate(obj).error
}

module.exports = {
    addProduct,
    updateProduct,
    deleteProduct
}