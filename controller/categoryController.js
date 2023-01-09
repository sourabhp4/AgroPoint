
const asynchandler = require('express-async-handler')
const Joi = require('joi')
const connection = require('../config/db')

const getProducts = asynchandler(async (req, res) => {
    
    const result = validate(req.body)

    if(result){
        res.status(400)
        throw new Error(result.details[0].message)
    }

    connection.query(`select * from category where category_id = ${req.body.category_id}`, async (err, results, field) => {
        if (err) {
            res.status(500).send({"message": "Server error"})
        } else {
            if (results.length == 0) {
                return res.status(401).send({"message": "This category does not exists"})
            }
            else{
                connection.query(`select pid, name, rating from products where category_id = ${req.body.category_id}`,(err, results, field) => {
                    if (err)
                        res.status(500).send({'message': 'Server error'})
                    else 
                        res.status(200).send(results)
                })
            }
        }
    })

})

// const getCategories = asynchandler(async (req, res) => {

//     connection.query(`select category_id, category_name from category`, async (err, results, field) => {
//         if (err) {
//             res.status(500).send({"message": "Server error"})
//         } else {
//             return res.status(200).send(results)
//         }
//     })

// })


function validate(obj){
    const schema = Joi.object({
        category_id: Joi.number()
        .required()
    })

    return schema.validate(obj).error
}

module.exports = {
    getProducts
}