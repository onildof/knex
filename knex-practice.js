module.exports.knexQueryBuilderPractice = function (knex) {
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

  // WITH tolkien_books AS (SELECT * FROM books WHERE author = 'tolkien') SELECT * FROM tolkien_books WHERE year = 1950
  /* 
    QueryInterface.with(alias, callback|builder|raw) 
    knex.raw(sql, bindings)
  */
  knex
    .with('tolkien_books', (qb) => {
      qb.select('*').from('books').where('author', 'Tolkien')
    })
    .select('*')
    .from('tolkien_books')
    .where('year', 1950)

  {
    const qb = knex.select('*').from('books').where('author', 'Tolkien')
    knex
      .with('tolkien_books', qb)
      .select('*')
      .from('tolkien_books')
      .where('year', 1950)
  }

  knex
    .with(
      'tolkien_books',
      knex.raw('select * FROM books WHERE author = ?', 'Tolkien')
    )
    .select('*')
    .from('tolkien_books')
    .where('year', 1950)

  /* 
WITH RECURSIVE ancestors AS 
  (SELECT * FROM persons 
    WHERE persons.id = 1 
  UNION 
  SELECT * FROM persons INNER JOIN ancestors 
    ON ancestors.parentId = persons.id) 
SELECT * FROM ancestors
*/
  /*
QueryInterace.withRecursive(alias, callback|builder|raw)
*/
  knex
    .withRecursive('ancestors', (qb) => {
      qb.select()
        .from('persons')
        .where('persons.id', 1)
        .union((qb) => {
          qb.select()
            .from('persons')
            .innerJoin('ancestors', 'ancestors.parentId', 'persons.id')
        })
    })
    .select()
    .from('ancestors')

  /*
  SELECT * FROM persons OFFSET 1 LIMIT 1
*/
  knex.select().from('persons').offset(1).limit(1)

  /*
SELECT * FROM persons WHERE last_name IS NULL
UNION
SELECT * FROM persons WHERE first_name IS NULL
*/
  /*
QueryInterface.union([callback|builder|raw], wrap) 
always use wrap as true for better readability
*/

  knex
    .select()
    .from('persons')
    .whereNull('last_name')
    .union(
      [
        function () {
          this.select().from('persons').whereNull('first_name')
        },
      ],
      true
    )

  knex
    .select()
    .from('persons')
    .whereNull('last_name')
    .union([knex.select().from('persons').whereNull('first_name')], true)
  {
    const qb = knex.select().from('persons').whereNull('first_name')
    knex.select().from('persons').whereNull('last_name').union([qb], true)
  }

  knex
    .select()
    .from('persons')
    .where('last_name', null)
    .union([knex.raw('select * from persons where first_name IS NULL')])

  /*
INSERT INTO books (title) VALUES ('Slaughterhouse Five') RETURNING *
*/
  knex('books').insert({ title: 'Slaughterhouse Five' }).returning('*')
  knex
    .insert([{ title: 'Dune' }, { title: 'Interview with the Vampire' }])
    .into('books')
    .returning('*')

  /*
UPDATE books SET title = 'The Hitchhiker's Guide to the Galaxy' WHERE id = 42 RETURNING *
*/
  knex('books')
    .where({ id: 42 })
    .update({ title: "The Hitchhiker's Guide to the Galaxy" })
    .returning('*')

  /*
DELETE FROM books WHERE id = 42
*/
  knex('books').where('id', 42).del()

  /*
Aggregate functions count, min, max, sum, avg:

count(*) yields the total number of input rows; 
count(f1) yields the number of input rows in which f1 is non-null; 
count(distinct f1) yields the number of distinct non-null values of f1.
Note that in Postgres, count returns a bigint type which will be a String and not a Number

SELECT COUNT(*) FROM books
SELECT COUNT(title, author) FROM books
SELECT COUNT(DISTINCT author) AS authorCount FROM books
*/

  knex('books').count('*')
  knex('books').count('title', 'author')
  knex('books').countDistinct({ authorCount: 'author' })

  /*
SELECT id FROM persons WHERE first_name = 'Test' AND last_name = 'User'
*/
  knex('persons').where({ firstName: 'Test', lastName: 'User' }).select('id')

  /*
SELECT * FROM persons WHERE (id IN VALUES(1, 11, 15) AND id NOT IN VALUES(17, 19)) AND WHERE id > 10
*/
  knex('persons')
    .where((qb) => qb.whereIn('id', [1, 11, 15]).whereNotIn('id', [17, 19]))
    .andWhere(function () {
      this.where('id', '>', 10)
    })

  /*
SELECT * FROM persons WHERE (id = 1 OR id > 10) OR name = 'Tester'
*/
  knex('persons')
    .where(function () {
      this.where('id', 1).orWhere('id', '>', 10)
    })
    .orWhere({ name: 'Tester' })

  /*
SELECT * FROM persons WHERE name LIKE %John%
*/
  knex('persons').where('name', 'like', '%John%')

  /* 
SELECT DISTINCT first_name FROM persons 
*/
  knex('persons').distinct('first_name')

  /*
SELECT DISTINCT ON (url) url, request_duration
FROM logs
ORDER BY url, timestamp DESC
*/
  knex('logs')
    .distinctOn('url')
    .columns('url', 'request_duration')
    .orderBy(
      { column: 'url' },
      { column: 'timestamp', order: 'desc', nulls: 'first' }
    )

  /*
JOIN METHODS
*/
  // implicit ON clause
  knex('users')
    .innerJoin('contacts', 'users.id', '=', 'contacts.user_id')
    .select()
  knex
    .select()
    .from('users')
    .innerJoin('contacts', 'users.id', '=', 'contacts.user_id')

  // implicit ON clause and = operator
  knex('users')
    .fullOuterJoin('contacts', 'users.id', 'contacts.user_id')
    .select()
  knex
    .select()
    .from('users')
    .fullOuterJoin('contacts', 'users.id', 'contacts.user_id')

  // join with more than one ON clause (aka grouped joins)
  knex('users')
    .innerJoin('accounts', function () {
      this.on('users.account_id', '=', 'accounts.id').orOn(
        'users.id',
        '=',
        'accounts.owner_id'
      )
    })
    .select()

  // in Knex, we've seen that an anonymous function as an argument is used for nesting anything in parentheses
  knex
    .select()
    .from('users')
    .leftJoin('accounts', function () {
      this.on(function () {
        this.on('users.account_id', '=', 'accounts.id')
        this.orOn('users.id', '=', 'accounts.owner_id')
      })
    })

  // object syntax
  knex
    .select()
    .from('users')
    .rightJoin('accounts', { 'users.account_id': 'accounts.id' })

  // on clauses
  knex('users')
    .innerJoin('contacts', function () {
      this.on('users.id', '=', 'contacts.user_id')
      this.onIn('contacts.id', [7, 15, 23])
      this.onNull('contacts.criminalFile')
      this.onExists(function () {
        this.select()
          .from('accounts')
          .whereRaw('users.account_id = accounts.id')
      })
      this.onBetween('contacts.id', [1, 1000])
    })
    .select()

  // having clauses
  /*
SELECT product, sum(amount)
FROM orders
WHERE date BETWEEN 2021-01-01 and 2022-01-01
GROUP BY product
HAVING quantity >= 2 
*/
  knex('orders')
    .whereBetween('date', '2022-01-01', '2023-01-01')
    .groupBy('product')
    .having('quantity', '>', 2)
    .havingIn('id', [5, 3, 10, 17])
    .havingNull('extendedWarranty')
    .havingExists(function () {
      this.select('*')
        .from('accounts')
        .whereRaw('orders.account_id = accounts.id')
    })
    .havingBetween('id', [5, 10])
    .select('product')
    .sum({ amountSum: 'amount' })
}
