const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'uteshop',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
};

// Execute query with error handling
const executeQuery = async (query, params = []) => {
    try {
        const [results] = await pool.execute(query, params);
        return results;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

// Get single row
const getOne = async (query, params = []) => {
    try {
        const [results] = await pool.execute(query, params);
        return results[0] || null;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

// Insert data and return inserted ID
const insert = async (query, params = []) => {
    try {
        const [result] = await pool.execute(query, params);
        return result.insertId;
    } catch (error) {
        console.error('Database insert error:', error);
        throw error;
    }
};

module.exports = {
    pool,
    testConnection,
    executeQuery,
    getOne,
    insert
};
