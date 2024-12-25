const { Pool } = require('pg');
const pool = new Pool({
  host: '172.118.0.5',
  port: 5432,
  user: 'postgres',
  password: '1234',
  database: 'arecanut'
});

module.exports = pool;
