/**
 * See types in node_modules/knex/types/index.d.ts
 *
 * createTable has a callback that receives as argument an instance of interface TableBuilder
 */
exports.up = function (knex) {
  return knex.schema
    .createTable('persons', function (table) {
      // id is type SERIAL, also the primary key. primary() is redundant, but gives better readability
      table.increments('id').primary()

      //parentId. Deleting the parent won't deleted the child
      table
        .integer('parentId')
        .unsigned()
        .references('id')
        .inTable('persons')
        .onDelete('SET NULL')

      //other columns
      table.string('firstName')
      table.string('lastName')
      table.integer('age')
    })
    .createTable('movies', function (table) {
      table.increments('id')
      table.primary('id')

      table.string('name')
    })
    .createTable('persons_movies', function (table) {
      table.increments('id')
      table.primary('id')

      table
        .integer('personId')
        .unsigned()
        .references('id')
        .inTable('persons')
        .onDelete('CASCADE')
      table
        .integer('movieId')
        .unsigned()
        .references('id')
        .inTable('movies')
        .onDelete('CASCADE')
    })
    .createTable('animals', function (table) {
      table.increments('id')
      table.primary('id')

      // Deleting the owner will delete the animals
      table
        .integer('ownerId')
        .unsigned()
        .references('id')
        .inTable('persons')
        .onDelete('CASCADE')

      table.string('name')
      table.string('species')
    })
    .createTable('books', function (table) {
      table.increments('id') //serial, primary
      table.text('title')
      table.text('author')
      table.integer('year')
    })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('persons_movies')
    .dropTableIfExists('animals')
    .dropTableIfExists('movies')
    .dropTableIfExists('persons')
}
