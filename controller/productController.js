
const asynchandler = require('express-async-handler')
const Joi = require('joi')
const connection = require('../config/db')

const getProduct = asynchandler(async (req, res) => {
    
    const result = validate(req.body)

    if(result){
        res.status(400)
        throw new Error(result.details[0].message)
    }

    connection.query(`select pid, name, release_year, official_link, rating, description, category_id from products where pid = ${req.body.pid}`, 
    async (err, results, field) => {
        if (err) {
            res.status(500).send({"message": "Server error"})
        } else {
            if (results.length == 0)
                return res.status(401).send({"message": "This product does not exists"})
            else{
                connection.query(`select c.comment, c.rating, c.createdAt, c.updatedAt, u.name from comments c, user u  where c.p_id = ${req.body.pid} and c.user_id = u.uid`, 
                async (err, results1, field) => {
                    if (err) {
                        res.status(500).send({"message": "Server error"})
                    } else {
                        results[0].comments = results1
                        res.status(200).send(results[0])
                    }
                })
            }
        }
    })

})


function validate(obj){
    const schema = Joi.object({
        pid: Joi.number()
        .required()
    })

    return schema.validate(obj).error
}

module.exports = {
    getProduct
}