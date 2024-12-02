const { Pool } = require('pg')
const pool = new Pool({
   host: '172.5.0.3',
   port: 5432,
   user: 'postgres',
   password: '1234',
   database: 'arecanut'
})

module.exports = pool 