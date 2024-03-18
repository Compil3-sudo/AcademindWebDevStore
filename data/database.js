const { Pool } = require('pg');
require('dotenv').config();

// Create a new pool instance
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

module.exports = pool;
