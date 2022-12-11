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
