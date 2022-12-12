# Knex practice

## What is Knex

Knex is a module for an SQL query builder and schema builder for Postgresql and others featuring:

- callback, promise and stream interfaces for async flow control (pick the one you like);
- connection pooling
- transactions

## Installation

The target environment for Knex is Node.js. It can be built for the browser using browserify or webpack, but that's discouraged outside of educational purposes, due to security concerns.

Install knex and the database library of your choosing

```
npm install knex pg
```

## Configuration/Connection

knex's module is actually a function. Call it on a literal object, which we'll call the _knex configuration_.

The _knex configuration_ has a couple required properties:

- client
- connection

`client` will be our database library, 'pg', which we just installed.
`connection` accepts a string, a literal object, or a function (for dynamically determined connection configurations).

The function takes no parameters and returns either a literal object or a promise for one. By default the returned object is cached and reused for further connections. That behavior can be changed if say we need to work with a temporary authentication token. The `expirationChecker` property does that job.

It's a function that is run everytime new connections are created. If it returns true, then a new connection object is made.

`userParams` is optional and you can put whatever you like in there and access it through `knex.userParams`

Initializing the knex library must be done only once, as it creates a connection pool at that point.

`pool` is not mandatory but desirable, because the default min is 2 for historical reasons and could be troublesome, so we should replace it with a zero.

### Properties for the development environment

`debug: true` enables the use of the _debug_ library
`asyncStackTraces: true` more detail on errors

## The Query Builder

It's the interface for _building_ and _executing_ queries.

This API uses identifiers for tables and columns a lot, so there's a syntax for those.

### Identifier Syntax

identifierName can be:

- `columnName`
- `tableName`
- `tableName.columnName`

An identifierName can be aliased:

- `identifierName as aliasName`
- `{ aliasName: identifierName } // object syntax`

### Common

#### knex object

Every query uses the knex object

#### table name: knex() or from()

Either by passing it to a call to knex, or using the from method
knex('books').select()
knex.select().from('books')

#### column names: select() or column()

knex('books').select('title', { by: 'author' })
knex('books').select(['title', 'author as by'])
knex('books').select('title', 'author as by')
knex('books').select()

knex('books').column('title', { by: 'author' }).select()
knex('books').column(['title', 'author as by']).select()
knex('books').column('title', 'author as by').select()
knex('books').column().select()

#### offset and limit

qb.limit(10)
qb.offset(30)

#### union, intersect,

qb.union(function { this.qb }) // apparently the union method internally binds the callback to the knex object before calling it
qb.union([qb, qb])
qb.union(qb, qb)

#### insert

knex('books').insert({title: 'Dune'})
knex.insert({title: 'Dune'}).into('books')
knex('books').insert([{title: 'Snow Crash'}, {title: 'The Diamond Age'}]) //several inserts in one command

#### update (like insert but you'll want to follow up with a .where() call)

knex('books').update({title: 'Dune'}).where({title: 'Arrakis'})

#### delete is a reserved word in JS, so del is used instead

knex('books').del().where({title:'Dune'})

#### returning (PostgreSQL) determines which columns must be returned by an insert/update/del

insertQuery.returning('id')
updateQuery.returning(['id', 'title'])

#### count and countDistinct

knex('users').count('active')
knex('users').count({ serviced: 'active' })
knex('books').countDistinct({ writer: 'author' })

#### min, max

qB.min('value')
qB.max('value')

#### sum, avg, sumDistinct, avgDistinct

qB.sum('value')
qB.avgDistinct('value')

#### increment, decrement (conveniences)

qB.increment('balance', 100)
qB.decrement({balance: 100, level: 1})

#### clone() clones the current query, to be reused in other queries

let clone = qB.clone()

### Where clauses

#### where

qB.where('columnName', 'value') // (key, value) syntax
qB.where({ columnName: value }) // object syntax
//two function syntaxes:
qB.where((builder) =>
builder.whereIn('id', [1, 11, 15])
)
qB.where(function () {
this.where('id', 1)
})
qB.where('columnName', 'like', '%value%') // operator syntax

#### whereNot

qB.whereNot(...)
qB.whereNot('columnName', 'in', subquery) //WRONG
qB.where('columnName', 'not in', subquery) //Use the 'not in' operator instead of whereNot function + in operator

#### whereNull, whereNotNull

qB.whereNull('columnName')
qB.whereNotNull('columnName')

#### whereExists(builder | callback), whereNotExists

qB.whereExists(qB)
qB.whereExists(function () { this.select()... })

#### whereBetween(columnName, range), whereNotBetween

qB.whereBetween('column', [1,100])

#### whereLike, whereILike

qB.whereLike('email', '%mail%')
qB.whereILike('email', '%mail%')

### Join methods, OnClauses, HavingClauses, groupBy, orderBy

...

## Interfaces

These interfaces run the built queries

### Promises

The preferred way.

qB.then((rows) => { ... }).catch((error) => { ... })

### Callbacks

qB.asCallback(function (err, rows) { ... })

### toString()

const toStringQuery = knex.select('\*')
.from('users')
.where('id', 1)
.toString();

// Outputs: console.log(toStringQuery);
// select \* from "users" where "id" = 1

### toSQL(), toSQL().toNative()

knex.select('_')
.from('users')
.where(knex.raw('id = ?', [1]))
.toSQL()
// Outputs:
// {
// bindings: [1],
// method: 'select',
// sql: 'select _ from "users" where id = ?',
// options: undefined,
// toNative: function () {}
// }

knex.select('_')
.from('users')
.where(knex.raw('id = ?', [1]))
.toSQL()
.toNative()
// Outputs for postgresql dialect:
// {
// bindings: [1],
// sql: 'select _ from "users" where id = $1',
// }

## The Schema Builder

Begins with knex.schema

### createTable(tableName, callbackThatModifiesTheCreatedTable)

knex.schema.createTable('tableName', function (table) {
...
})

### alterTable(tableName, callbackThatModifiesTheTable)

### dropTable(tableName)

## Methods of a table

### dropColumn, dropColumns, renameColumn

### increments(name, options)

Adds an autoincrementing column (a serial in PostgreSQL). By default it'll be a primary key, unless you use options.primaryKey: false or

### integer, text, boolean, datetime

### timestamps(false, true, false)

Adds created_at and updated_at columns using datetime and defaulting to now()

### primary, unique, references, unsigned, notNullable, nullable,

references(tableName.columnName)
references(columnName).inTable(tableName)

## Migrations

For easy changes to an existing database, and for determining the initial schema as well
First things first, migrations use a **knexfile.js**, which is created by running:

`knex init`

It'll create a knexfile.js with the configurations. We might as well use that file as a config when importing the knex library.

There's a command line tool:

`npx knex migrate:latest --help`

We might create a new migration using

`npx knex migrate:make migration_name`

Now update the database matching your NODE_ENV by running

`npx knex migrate:latest`

Rolling back the last batch (?) of migrations

`knex migrate:rollback`
`knex migrate:rollback --all`

To run the next migration that has not yet been run, or undo it

`knex migrate:up`
`knex migrate:up migration_name`
`knex migrate:down`
`knex migrate:down migration_name`

To list both completed and pending migrations:

`knex migrate:list`

## Seed files

Seed files populate the schema we created through migrations.

There's a CLI for them as well.

`knex seed:make seed_name`

The seeds directory can be specified by our knexfile.js for each environment. If it isn't, then the files are created in ./seeds

To run all the seed files in alphabetical order, execute:

`knex seed:run`

To run specific seed files, do:

`knex seed:run --specific=seed-filename.js --specific=another-seed-filename.js`

## Recipes

### Using parentheses with AND operator

SELECT "firstName", "lastName", "status"
FROM "userInfo"
WHERE "status" = 'active'
AND ("firstName" ILIKE '%Ali%' OR "lastName" ILIKE '%Ali%');

queryBuilder
.where('status', status.uuid)
.andWhere((qB) => qB
.where('firstName', 'ilike', `%${q}%`)
.orWhere('lastName', 'ilike', `%${q}%`)
)

### Node instance doesn't stop after using knex

Make sure to close knex instance after execution to avoid Node process hanging due to open connections:
`async function migrate() {
try {
await knex.migrate.latest({/**config**/})
} catch (e) {
process.exit(1)
} finally {
try {
knex.destroy()
} catch (e) {
// ignore
}
}
}

migrate()`

# Objection practice

## What is Objection

Objection.js is an ORM for Node.js that likes to call itself a relational query builder (emphasis on 'relational'). We get all the benefits of Knex query building, plus a powerful set of tools for working with relations between tables.

Objection is built on top of Knex.

Objection doesn't meddle with schema creation and migration. That's left to Knex.

## Installation

`npm install objection knex pg`

## Configuration

We've already configured a db client and connection when we created the knex instance. We pass this instance to Objection using

`Model.knex(knex)`

This installs the knex instance globally for all models, even the ones not yet created, because they'll be defined as classes extending Model.
