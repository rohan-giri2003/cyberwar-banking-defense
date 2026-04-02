const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'cyber_defense',
  password: 'Aapka_Postgres_Password', // Jo password apne pgAdmin mein dala tha
  port: 5432,
});

module.exports = pool;