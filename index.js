require('dotenv').config()
const knexConfig = require('./knexfile')
const knex = require('knex')(
  process.env.NODE_ENV === 'development'
    ? knexConfig.development
    : knexConfig.production
)
const { Model } = require('objection')
Model.knex(knex)

//fetching user rows using knex
knex('user')
  .select()
  .then((users) => {
    console.log(users)
  })

//creating a model for table user and then fetching the rows
class User extends Model {
  //static getter property tableName is mandatory
  static get tableName() {
    return 'user'
  }
}

;(async () => {
  const users = await User.query()
  console.log(users)
})()
