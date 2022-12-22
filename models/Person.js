const { Model } = require('objection')

class Person extends Model {
  static get tableName() {
    return 'persons'
  }

  static get relationMappgins() {
    const Animal = require('./Animal')
    const Movie = require('./Movie')

    return {
      parent: {
        relation: Model.BelongsToOneRelation,
        modelClass: Person,
        join: {
          from: 'persons.parentId',
          to: 'persons.id',
        },
      },

      children: {
        relation: Model.HasManyRelation,
        modelClass: Person,
        join: {
          from: 'persons.id',
          to: 'persons.parentId',
        },
      },

      pets: {
        relation: Model.HasManyRelation,
        modelClass: Animal,
        join: {
          from: 'persons.id',
          to: 'animals.ownerId',
        },
      },

      movies: {
        relation: Model.ManyToManyRelation,
        modelClass: Movie,
        join: {
          from: 'persons.id',
          through: {
            from: 'persons_movies.personId',
            to: 'persons_movies.movieId',
          },
          to: 'movies.id',
        },
      },
    }
  }
}

module.exports = Person
