const express = require('express')
require('dotenv').config()

const { errorHandler } = require('./middleware/errorMiddleware')
const { checkAuth } = require('./middleware/jwtTokenValidation')
const connection = require('./config/db')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false}))

connection.connect((err) => {
    if (err) {
        console.log('Connection to DB Failed')
        throw err
    } else {
        console.log('Connection to DB Successful')
    }
})

app.use('/api/signUp', require('./routes/signUpRoutes'))

app.use('/api/login', require('./routes/loginRoutes'))

app.use('/api/profile', checkAuth, require('./routes/profileRoutes'))

app.use('/api/forgotPassword', require('./routes/forgotPasswordRoutes'))

app.use('/api/addProduct', checkAuth, require('./routes/addProductRoutes'))

app.use('/api/category', require('./routes/categoryRoutes'))

app.use('/api/product', require('./routes/productRoutes'))

app.use('/api/comment', checkAuth, require('./routes/commentRoutes'))

app.use(errorHandler)

const port = process.env.PORT || 6000
app.listen(port, () => console.log(`Server started at port ${port}`))
