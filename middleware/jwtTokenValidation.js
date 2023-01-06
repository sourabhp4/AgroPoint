const jwt = require('jsonwebtoken')

const checkAuth = (req, res, next) => {
  try{
    jwt.verify(req.headers.authtoken, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if(err)
          throw new Error(err)

        req.body.email = decoded.email
        req.body.profile_type = decoded.profile_type
    
        next()
      })
  }
  catch(err){
    res.status(403)
    throw new Error(err.message)
  }
}

module.exports = { checkAuth }