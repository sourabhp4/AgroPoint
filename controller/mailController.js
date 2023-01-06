const asynchandler = require('express-async-handler')
const Joi = require('joi')
const transporter = require('../config/mailConfig')
const connection = require('../config/db')
const { decrypt } = require('../config/crypto')

const mailPassword = asynchandler(async (req, res) => {

    const result = validate(req.body)

    if(result){
        res.status(400)
        throw new Error(result.details[0].message)
    }

    connection.query(`select password from ${req.body.profile_type} where email = "${req.body.email}"`, async (err, results, field) => {
        if (err) {
            res.status(500).send({"message": "Server error"})
        } else {
            if (results.length == 0) {
                return res.status(401).send({"message": "The profile does not exist"})
            }
            results[0].password = decrypt(results[0].password)
            sendMail(req, res, results)
        }
    })

})

function sendMail(req, res, user){
    try{

        const mailOptions = {
            from: process.env.email,
            to: req.body.email,
            subject: 'Password for login to Agro-Point',
            text: `Your Agro-Point Account Password : ${user[0].password} 
            Don't share this with anyone`,
        }

        transporter.sendMail(mailOptions, (err, info) =>{
            if(err)
                throw new Error(err)
            res.status(200).send({'message': 'See for mail from us...You can close this tab now'})
        })


    }

    catch(err){
        res.status(400)
        throw new Error(err.message)
    }
}


function validate(obj){
    const schema = Joi.object({
        email: Joi.string()
        .email({ minDomainSegments: 2 })
        .required(),

        profile_type: Joi.string()
        .valid('user','org_user')
        .required()
    })

    return schema.validate(obj).error
}

module.exports = {
    mailPassword
}