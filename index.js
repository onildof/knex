require('dotenv').config()
const knexConfig = require('./knexfile')
const knex = require('knex')(
  process.env.NODE_ENV === 'development'
    ? knexConfig.development
    : knexConfig.production
)

knex('user')
  .select()
  .then((users) => {
    console.log(users)
  })
