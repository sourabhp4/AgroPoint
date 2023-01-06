
const asynchandler = require('express-async-handler')
const Joi = require('joi')
const connection = require('../config/db')
const { encrypt, decrypt } = require('../config/crypto')

const getProfile = asynchandler(async (req, res) => {

    connection.query(`select email, password, name from ${req.body.profile_type} where email = "${req.body.email}"`, async (err, results, field) => {
        if (err) {
            res.status(500).send({"message": "Server error"})
        } else {
            if (results.length == 0) {
                return res.status(401).send({"message": "The profile does not exist"})
            }
            results[0].password = decrypt(results[0].password)
            res.status(200).send(results[0])
        }
    })

})

const updateProfile = asynchandler(async (req, res) => {

    const result = validate(req.body)

    if(result){
        res.status(400)
        throw new Error(result.details[0].message)
    }

    connection.query(`update ${req.body.profile_type} set name = "${req.body.name}", password = "${encrypt(req.body.password)}" where email = "${req.body.email}"`,
    async (err, results, field) => {
        if (err) {
            res.status(500).send({"message": "Server error"})
        } else {
            getProfile(req, res)
        }
    })

})

function validate(obj){
    const schema = Joi.object({
        password: Joi.string()
        .min(8)
        .max(20)
        .required(),

        name: Joi.string()
        .min(3)
        .max(20)
        .required(),

        email: Joi.string().required(),
        profile_type: Joi.string().required()
    })

    return schema.validate(obj).error
}

module.exports = {
    getProfile,
    updateProfile
}