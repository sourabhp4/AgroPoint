
const asynchandler = require('express-async-handler')
const Joi = require('joi')
const jwt = require('jsonwebtoken')
const { encrypt } = require('../config/crypto')
const connection = require('../config/db')

const createProfile = asynchandler(async (req, res) => {

    const result = validate(req.body)

    if(result){
        res.status(400)
        throw new Error(result.details[0].message)
    }

    try{
        const pwd = encrypt(req.body.password)

        connection.query(`insert into ${req.body.profile_type}(name, email, password) values ("${req.body.name}", "${req.body.email}", "${pwd}")`, (err, results, field) => {
            if (err) {
                console.log(err)
                if (err.errno === 1062) {
                    res.status(401).send(err.message)
                }
                res.status(500).send({'message': 'Server error'})
            } 
            else 
                res.status(200).send({ token: generateToken(req) })
        })
    }

    catch(err){
        throw new Error(err.message)
    }

})

function generateToken(req) {

    const data = {
        time: Date(),
        email: req.body.email,
        profile_type: req.body.profile_type
    }
  
    return jwt.sign(data, process.env.JWT_SECRET_KEY, { expiresIn: '2h' })
}

function validate(obj){
    const schema = Joi.object({
        name: Joi.string()
        .min(3)
        .max(20)
        .required(),

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
    createProfile,
    generateToken,
    validate
}