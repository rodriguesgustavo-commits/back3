const mysql = require("mysql2")
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "escola"
})
module.exports = { pool }