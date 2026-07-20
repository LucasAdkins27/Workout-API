// Database connection setup
// Connects to a local Postgres database using the pg package.
// (Replace the values below with your own local Postgres setup)

const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'workout_tracker',
  password: 'postgres123',
  port: 5432
});

module.exports = pool;
