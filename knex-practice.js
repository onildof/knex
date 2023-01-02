module.exports = function knexPractice(knex) {
  // SELECT title FROM books
  knex.select('title').from('books')
  knex.column('title').from('books')
  knex.columns('title').from('books')
  knex('books').select('title')
  knex('books').column('title')
  knex('books').columns('title')

  // SELECT title, author, year FROM books
  knex.select('title', 'author', 'year').from('books')
  knex.columns('title', 'author', 'year').from('books')
  knex('books').select('title', 'author', 'year')
  knex('books').columns('title', 'author', 'year')

  // SELECT * FROM books
  knex.select().from('books')
  knex.select().table('books')
  knex.select('*').from('books')
  knex.select('*').table('books')
}
