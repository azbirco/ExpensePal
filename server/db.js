const mysql = require('mysql2');
require('dotenv').config();

// Gumagawa tayo ng "pool" para efficient ang connections
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3308, // <--- Dinagdag natin ito para tumugma sa XAMPP mo
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection logic with full error report
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Database connection failed!');
        console.error('Error Code:', err.code);       
        console.error('Error Message:', err.message); 
    } else {
        console.log('✅ Connected to MySQL Database: expensepal_db');
        connection.release();
    }
});

module.exports = pool.promise();