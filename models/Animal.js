const { Model } = require('objection')

class Animal extends Model {
  static get tableName() {
    return 'animals'
  }

  static get relationMappings() {
    const Person = require('./Person')

    return {
      owner: {
        relation: Model.BelongsToOneRelation,
        modelClass: Person,
        join: {
          from: 'animals.ownerId',
          to: 'persons.id',
        },
      },
    }
  }
}

module.exports = Animal
