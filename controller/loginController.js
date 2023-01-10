
const asynchandler = require('express-async-handler')
const Joi = require('joi')
const { decrypt } = require('../config/crypto')
const { generateToken } = require('./signUpController')
const connection = require('../config/db')

const validateProfile = asynchandler(async (req, res) => {

    const result = validate(req.body)

    if(result){
        res.status(400)
        throw new Error(result.details[0].message)
    }
    
    connection.query(`select * from ${req.body.profile_type} where email = "${req.body.email}"`, async (err, results, field) => {
        if (err) {
            res.status(500).send({"message": "Server error"})
        } else {
            if (results.length == 0) {
                return res.status(401).send({"message": "The entered credentials do not match"})
            }
            
            const pwd = decrypt(results[0].password)
            if (pwd === req.body.password) {
                res.status(200).send({ token: generateToken(req) })
            } else {
                res.status(401).send({"message": "Wrong password"})
            }
        }
    })

})

function validate(obj){
    const schema = Joi.object({

        email: Joi.string()
        .email({ minDomainSegments: 2 })
        .required(),

        password: Joi.string() 
        .min(8)
        .max(20)
        .required(),

        profile_type: Joi.string()
        .valid('user','org_user')
        .required()
    })

    return schema.validate(obj).error
}

module.exports = {
    validateProfile
}