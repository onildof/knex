require('dotenv').config()
const { knexSnakeCaseMappers } = require('objection')

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: 'pg',
    connection: process.env.CONNECTION_STRING, //we're not hardcoding our credentials. Let's use .env files and the dotenv module
    pool: {
      min: 0,
      max: 10,
    },
    debug: false,
    asyncStackTraces: true,
    ...knexSnakeCaseMappers(),
  },
  production: {
    client: 'pg',
    connection: process.env.CONNECTION_STRING, //we're not hardcoding our credentials. Let's use .env files and the dotenv module
    pool: {
      min: 0,
      max: 10,
    },
    debug: false,
    asyncStackTraces: false,
    ...knexSnakeCaseMappers(),
  },
}
