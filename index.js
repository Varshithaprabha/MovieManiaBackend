const mysql = require('mysql2');
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// THIS FIXES THE "connection closed" ERROR FOREVER
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 30000
});

// Test connection on startup
db.getConnection((err, connection) => {
  if (err) {
    console.error('DB Connection Failed:', err);
  } else {
    console.log('MySQL Connected Successfully!');
    connection.release();
  }
});

// Add this middleware to handle DB reconnect
app.use((req, res, next) => {
  db.getConnection((err, connection) => {
    if (err) {
      console.error('DB Error:', err);
      return res.status(500).json({ error: "Database unavailable" });
    }
    connection.release();
    next();
  });
});