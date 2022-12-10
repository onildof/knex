require('dotenv').config()
const knex = require('knex')({
  client: 'pg',
  connection: process.env.CONNECTION_STRING, //we're not hardcoding our credentials. Let's use .env files and the dotenv module
  pool: {
    min: 0,
    max: 10
  },
  debug: true,
  asyncStackTraces: true
})