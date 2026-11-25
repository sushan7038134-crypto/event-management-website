
const mysql = require("mysql2/promise");

const db = mysql.createPool({
    host: "127.0.0.1",
    port: 3307,
    user: "eventora_user",
    password: "eventora_pass123",
    database: "eventora",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = db;
