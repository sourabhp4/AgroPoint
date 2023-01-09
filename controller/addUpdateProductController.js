
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
    
    if(req.body.pid == null){
        res.status(400)
        throw new Error('Category id is required')
    }
    

    connection.query(`select o_uid from org_user where email = "${req.body.email}"`, async (err, results, field) => {
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

const updateProduct = asynchandler(async (req, res) => {
    
    const result = validate(req.body)

    if(result){
        res.status(400)
        throw new Error(result.details[0].message)
    }

    if(req.body.profile_type != 'org_user')
        return res.status(403).send({'message': 'No access'})

    if(req.body.pid == null){
        res.status(400)
        throw new Error('Product id is required')
    }

    connection.query(`select pid from products where pid = ${req.body.pid} and org_uid in (select o_uid from org_user where email = "${req.body.email}")`, 
        async (err, results, field) => {
        if (err) {
            res.status(500).send({"message": "Server error"})   
        } else {
            if (results.length == 0) {
                return res.status(403).send({"message": "User has no privileges to update this product"})
            }
            else{
                connection.query(`update products set name = ?, release_year = ?, official_link = ?, description = ? where pid = ${req.body.pid}`, [req.body.name, req.body.release_year, req.body.official_link, req.body.description],
                async (err, results, field) => {
                    if (err) {
                        res.status(500).send({"message": err})
                    } else {
                        res.status(200).send({'message': 'Product updated successfully'})
                    }
                })
            }
        }
    })

})

const deleteProduct = asynchandler(async (req, res) => {

    if(req.body.profile_type != 'org_user')
        return res.status(403).send({'message': 'No access'})

    if(req.body.pid == null){
        res.status(400)
        throw new Error('Product id is required')
    }

    connection.query(`select pid from products where pid = ${req.body.pid} and org_uid in (select o_uid from org_user where email = "${req.body.email}")`, 
        async (err, results, field) => {
        if (err) {
            res.status(500).send({"message": "Server error"})   
        } else {
            if (results.length == 0) {
                return res.status(403).send({"message": "User has no privileges to delete this product"})
            }
            else{
                connection.query(`delete from products where pid = ${req.body.pid}`,
                async (err, results, field) => {
                    if (err) {
                        res.status(500).send({"message": err})
                    } else {
                        res.status(200).send({'message': 'Product deleted successfully'})
                    }
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

        category_id: Joi.number(),

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