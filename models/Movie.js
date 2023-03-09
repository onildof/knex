const { Model } = require('objection')

class Movie extends Model {
  static get tableName() {
    return 'movies'
  }

  static get relationMappings() {
    const Person = require('./Person')

    return {
      actors: {
        relation: Model.ManyToManyRelation,
        modelClass: Person,
        join: {
          from: 'movies.id',
          through: {
            from: 'persons_movies.movieId',
            to: 'persons_movies.personId',
            extra: ['role'],
          },
          to: 'persons.id',
        },
      },
    }
  }
}

module.exports = Movie
