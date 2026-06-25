const mysql = require('mysql2/promise');
const logger = require('../utils/logger.util');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'your_mysql_password',
  database: process.env.DB_NAME || 'thikana_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Immediately verify connection database pool status
(async () => {
  try {
    const connection = await pool.getConnection();
    logger.info(`Successfully connected to MySQL database: ${process.env.DB_NAME || 'thikana_db'}`);
    connection.release();
  } catch (error) {
    logger.error(`Failed to connect to MySQL database: ${error.message}`);
  }
})();

module.exports = pool;
