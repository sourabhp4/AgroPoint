const mysql = require('mysql2')
require('dotenv').config()

const connection = mysql.createConnection({
    user: process.env.dbUser,
    password: process.env.dbPassword,
    host: process.env.dbHost,
    database: process.env.dbName,
    port: process.env.dbPort,
    multipleStatements: true
})

module.exports = connection