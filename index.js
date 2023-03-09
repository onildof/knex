require('dotenv').config()
const knexConfig = require('./knexfile')
const knex = require('knex')(
  process.env.NODE_ENV === 'development'
    ? knexConfig.development
    : knexConfig.production
)
const { Model } = require('objection')
const Person = require('./models/Person')
const Movie = require('./models/Movie')
Model.knex(knex)

//fetching rows using knex
// knex('users').select().then(console.log)

//creating a model for table user and then fetching the rows
class User extends Model {
  //static getter property tableName is mandatory
  static get tableName() {
    return 'users'
  }
}

// ;(async () => {
//   try {
//     const { rows } = await knex.raw(
//       'SELECT first_name, last_name, role ' +
//         'FROM persons JOIN persons_movies ON persons.id = persons_movies.person_id AND persons_movies.role = ?',
//       ['Spy']
//     )
//     console.log(rows)
//   } catch (error) {
//     console.log(error)
//     process.exit(1)
//   } finally {
//     knex.destroy()
//   }
// })()

;(async function () {
  try {
    const [person] = await Person.query().where('firstName', 'Mônica')
    const pets = await person.$relatedQuery('pets')
    console.log(person, pets)
    const personGraph = await Person.query()
      .where('firstName', 'Magali')
      .withGraphFetched('pets')
    console.log(personGraph)
  } catch (error) {
    console.log(error)
  } finally {
    knex.destroy()
  }
})()
