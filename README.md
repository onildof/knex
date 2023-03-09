# Knex practice

## What is Knex

Knex is a module for an SQL schema builder and query builder for Postgresql and others featuring:

- callback, promise and stream interfaces for async flow control (pick the one you like);
- connection pooling
- transactions

## Installation

The target environment for Knex is Node.js. It can be built for the browser using browserify or webpack, but due to security concerns that's discouraged outside of educational purposes.

Install knex and the database library of your choosing

```
npm install knex pg
```

## Configuration/Connection

knex's default export is a function. Pass to it a literal object we'll call _knex configuration_.

_knex configuration_ has a couple required properties:

- client
- connection

`client` is our database library, 'pg', which we just installed as a dependency.
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

In order to refer to tables and columns, the Query Builder uses an identifier syntax:

### Identifier Syntax

identifierName can be:

- `columnName`
- `tableName`
- `tableName.columnName`

Any identifierName can be aliased:

- `identifierName as aliasName`
- `{ aliasName: identifierName } // object syntax`

So,

- `columnName as aliasName`
- `tableName as aliasName`
- `tableName.columnName as aliasName`
- `{ aliasName: columnName }`
- `{ aliasName: tableName }`
- `{ aliasName: tableName.columnName }`

### Common

#### knex object

Every query uses the knex object

#### table name: knex() or from()

Either by passing it to a call to knex, or using the from method
knex('books').select()
knex.from('books').select()

#### column names: select() or column()

more succint:
knex('books').select('title', { by: 'author' }, 'year as published')
knex('books').select(['title', { by: 'author' }, 'year as published'])
knex('books').select()
knex('books').select('\*')

more verbose:
knex.from('books').column('title', { by: 'author' }, 'year as published').select()
knex.from('books').column(['title', { by: 'author' }, 'year as published']).select()
knex.from('books').column().select()
knex.from('books').column('\*').select()

#### offset and limit

qb.limit(10)
qb.offset(30)

#### union, unionAll, intersect

qb1.union(function () { this.qb2 },function () { this.qb3 }) // For the callback function syntax, apparently the union method internally binds its callback parameter to the knex object before calling it
qb1.union([qb2, qb3]) // array syntax
qb1.union(qb2, qb3) // list syntax
knex.union(qb1, qb2) // or any of the syntaxes above

#### insert

OBJECT SYNTAX:
succint:
knex('books').insert({title: 'Dune'})

verbose (use into() instead of from()):
knex.into('books').insert({title: 'Dune'})

one command for multiple insertions needs the ARRAY SYNTAX:
knex('books').insert([{title: 'Snow Crash'}, {title: 'The Diamond Age'}])

#### update (like insert but you'll want to follow up with a .where() call)

There's only the succint way (can't use from() or into())

OBJECT SYNTAX
knex('books').update({title: 'Dune'}).where({title: 'Arrakis'})

KEY, VALUE SYNTAX
knex('books').update('title', 'Dune').where({title: 'Arrakis'})

#### delete is a reserved word in JS, so del is used instead

knex('books').del().where({title:'Dune'})

So del() and update() use the succint syntax (receiving the tableName as a parameter)

#### returning (PostgreSQL) determines which columns must be returned by an insert/update/del

An insert query returns a knex object (not very useful).
An update or delete query return the number of affected rows.
If we'd like thesee operations to return columns of the affected rows, there's the returning() function:

insertQuery.returning('id')
updateQuery.returning(['id', 'title'])
delQuery.returning('\*')

these will return an array of objects containing a property for each specified column.

#### count and countDistinct

The value returned from an aggregate function such as count() is an array of columns

knex('users').count('active')
knex('users').count({ serviced: 'active' })
knex('books').countDistinct({ writer: 'author' })

#### aggregate functions (min, max, avg, count, sum)

qB.min('value')
qB.max('value')
qB.sum('value')
qB.avg('value')
qB.count('value')

I don't like the distinct methods (sumDistinct, avgDistinct, countDistinct). I'd rather use the regular ones plus knex.raw()

qB.sum(knex.raw('DISTINCT value'))
qB.avg(knex.raw('DISTINCT value'))
qB.count(knex.raw('DISTINCT value'))

#### increment, decrement (conveniences)

qB.increment('balance', 100)
qB.decrement({balance: 100, level: 1})

#### clone() clones the current query, to be reused in other queries

let clone = qB.clone()

### Where clauses

#### where

```
qB.where('columnName', 'value') // (key, value) syntax
qB.where({ columnName: value }) // object syntax
//two function syntaxes:
qB.where((builder) => builder.whereIn('id', [1, 11, 15]))
qB.where(function () {
  this.where('id', 1)
})
qB.where('columnName', 'like', '%value%') // operator syntax
```

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

```
const toStringQuery = knex.select('*').from('users').where('id', 1).toString()

// Outputs: console.log(toStringQuery);
// select \* from "users" where "id" = 1
```

### toSQL(), toSQL().toNative()

```
knex
  .select('_')
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

knex
  .select('_')
  .from('users')
  .where(knex.raw('id = ?', [1]))
  .toSQL()
  .toNative()
// Outputs for postgresql dialect:
// {
// bindings: [1],
// sql: 'select _ from "users" where id = $1',
// }
```

## The Schema Builder

Begins with knex.schema. All methods return a Promise.

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

All our schema changes are done through migrations.

Knex offers a command line interface for migrations (the migrate cli tool).

`knex init` creates the knexfile.js with the connection configuration

Once you have that knexfile filled with connection data, you can use the migrate cli tool to make a new migration file:
`knex migrate:make migration_name`

Then run all migrations that have not yet been run

`knex migrate:latest`
`knex migrate:latest --env development`

Or run the next migration that has not yet been run (just one)

`knex migrate:up`

Or even name the one you want

`knex migrate:up 001_migration_name.js`

List migrations

`knex migrate:list`

Rollback
`knex migrate:rollback -all`
`knex migrate:rollback`
`knex migrate:down`

## Seed files

Now to populate your brand new schema with dummy data, use the command line interface for seeds.

If no seed directory is specified in knexfile.js, then the files are created in ./seeds

Make the seed file
`knex seed:make seed_name`

To run all seed files in alphabetical order
`knex seed:run`

To run specific seed
`knex seed:run --specific=seed_name.js --specific=another_seed_name.js`

## Raw

Sometimes we may need to use a raw expression in a query. A raw query object can be injected anywhere we want. Proper bindings ensure
values are escaped properly, preventing SQL-injection attacks.

### Raw Parameter Binding

knex.raw(sql, bindings)

The sql string may contain positional parameters.
We must tell knex which parameters to interpret as values and which parameters to interpret as identifiers.

```
knex('users')
  .select(knex.raw('count(*) AS user_count, status'))
  .where(knex.raw(1)) // WHERE 1 means don't even filter. This is used if you find it necessary to add a WHERE clause but not filter anything.
  .orWhere(knex.raw('status <> ?', [1]))
  .groupBy('status')

knex('users').where(knex.raw('?? = ?', ['user.name', 1]))

knex('users')
  .where(
    knex.raw('LOWER("login") = ?', 'knex')
  )
  .orWhere(
    knex.raw('accesslevel = ?', 1)
  )
  .orWhere(
    knex.raw('updtime = ?', '01-01-2016')
  )
```

For when positional binding (? and ??) becomes inconvenient, we use named bindings. In named bindings, the bindings parameter ceases to be an array (as that's inherently positional) and becomes an object with named properties:

```
const raw =
  ':name: = :thisGuy or :name: = :otherGuy or :name: = :undefinedBinding'

knex('users').where(
  knex.raw(raw, {
    name: 'users.name',
    thisGuy: 'Chad',
    otherGuy: 'Tyrone',
    undefinedBinding: undefined,
  })
)
```

Here's a clever use of Array.prototype.map() to create positional bindings for values in a query

```
const bindings = [1, 2, 3]

knex.raw(
  `select * from users where id in (${bindings.map((value) => '?').join(',')})`,
  bindings
)
```

## Recipes

### Using parentheses with AND operator

```
SELECT "firstName", "lastName", "status"
  FROM "userInfo"
  WHERE "status" = 'active'
  AND ("firstName" ILIKE '%Ali%' OR "lastName" ILIKE '%Ali%');

queryBuilder
  .where('status', status.uuid)
  .andWhere((qB) =>
    qB
      .where('firstName', 'ilike', `%${q}%`)
      .orWhere('lastName', 'ilike', `%${q}%`)
  )
```

### Node instance doesn't stop after using knex

Make sure to close knex instance after execution to avoid Node process hanging due to open connections:

```
async function migrate() {
  try {
    await knex.migrate.latest({
      /**config**/
    })
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
```

migrate()

# Objection practice

## What is Objection

Objection.js is an ORM for Node.js that likes to call itself a relational query builder (emphasis on 'relational'). We get all the benefits of Knex query building, plus a powerful set of tools for working with relations between tables.

Objection is built on top of Knex.

Objection doesn't meddle with schema creation and migration. That's left to Knex.

## Installation

`npm install objection knex pg`

## Configuration

We've already configured a db client and connection when we created the Knex instance.

One of the properties in Objection's module.exports is the class Module, which we'll use to register the Knex instance:

`Model.knex(knex)`

This installs the knex instance globally for all models, even the ones not yet created, because they'll be defined as classes extending Model.

## Models

A Model subclass can define relationships to other models using the static getter property relationMappings

```
class Student extends Model {
  static get tableName() {
    return 'student'
  }

  static get relationMappings() {
    const Attendance = require('./Attendance') //another model

    return {
      attendances: {
        relation: Model.hasManyRelation,
        modelClass: Attendance,
        join: {
          from: 'student.id',
          to: 'attendance.studentId'
        }
      }
    }
  }
}
```

Models can optionally define a jsonSchema for input validation.
Each Model subclass inherits an idColumn property with value 'id'. You'll need to explicitly override it if your table differs in its primary key.
Each instance of such a class represents a table row.
Objection has no global configuration or state. There's no Objection instance. Everything is done through the Model subclasses.
Most of the time our models will share a similar configuration, which invites us to create a BaseModel class and inherit all our models from that.

Objection considers database schema to be a separate concern which should be dealt with using knex migrations only.

```
class Student extends Model {
  ...

  // instance methods can be defined at your convenience. It's a class afterall
  fullName() {
    return this.firstName + ' ' + this.lastName
  }

  // Whenever a model instance is created, be it explicitly or implicitly, it is checked against this schema (this is optional). http://json-schema.org has more details
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['firstName', 'lastName'],
      properties: {
        id: { type: 'integer' },
        parentId: { type: ['integer', 'null'] },
        firstName: { type: 'text' },
        lastName: { type: 'text' },
        age: { type: 'integer' }
      }
    }
  }

  static get relationMappings() {
    const Parent = require('./Parent')
    const Classe = require('./Classe')
    return {
      // Example of a many-to-many relation
      parents: {
        relation: Model.ManyToManyRelation,
        modelClass: Parent,
        join: {
          from: 'student.id'
          through: {
            from: 'student_parent.studentId',
            to: 'student_parent.parendId'
          }
          to: 'parent.id'
        }
      },
      // Example of a belongs-to-one relation
      classe: {
        relation: Model.BelongsToOneRelation,
        modelClass: Classe,
        join: {
          from: 'student.classeId',
          to: 'classe.id'
        }
      }
    }
  }
}
```

## Relations

Beware of require loops (aka circular dependencies, circular requires). These are very common when defining relations.
Whenever a module A requires a module B, which synchronously requires module A, a require loop is created, which node.js and objection cannot solve automatically.
So Objection throws an error.

One technique to prevent this is to take advantage of the lazy access of relationMappings. This getter property is only accessed when an executing query needs it. Therefore we require our models inside of it.

## Basic Queries

This is the hardest part.

All methods return a QueryBuilder instance, which extends Knex's QueryBuilder with some more methods by Objection.

Objection lets us print the executed query to console by chaining a call to .debug(). This is different from Knex's .toString() and .toSQL() in the sense that the query is actually executed.

### Fetch item by id

We begin by creating a QueryBuilder for User by calling `User.query()`

This is the same as calling `knex('user')` or `knex.from('user')`.

So we set the table for our query and at the same time the class of the to be returned instance, when that query is executed.

Then we chain query building methods, such as `.findById(1)`

Finally we use Knex's Promise interface to execute our formed query: `await` operator or `.then()` method.

Putting it all together:

```
const user = await User.query().findById(1)
console.log(user instanceof User) //true. Objection always gives you an instance of a Model
```

### Fetch all items

```
const users = await User.query()
```

### Knex didn't support arrow functions, Objection does

"Where knex requires you to use an old fashioned function and this, with objection you can use arrow functions"

From the docs, it seems Knex actually supports arrow functions. That quote must be old.

```
const nonMiddleAgedJennifers = await Person.query()
  .where(builder => builder.where('age', '<', 40).orWhere('age', '>', 60))
  .where('firstName', 'Jennifer')
  .orderBy('lastName');
```

### Insert

Where in Knex we had:

```
// returning an array with column values:
const book = await knex('books').insert({title: 'Dune'}).returning('*')
const book = await knex.into('books').insert({title: 'Dune'}).returning('*')
```

in Objection we have:

```
// returning an instance of Books
const book = await Books.query().insert({title: 'Dune'})

{
  method: 'insert',
  options: {},
  timeout: false,
  cancelOnTimeout: false,
  bindings: [ 'Dune' ],
  __knexQueryUid: 'soA3WaDjcSNndOwkQ_4tC',
  sql: 'insert into "books" ("title") values (?) returning "id"',
  returning: 'id'
}
Book { title: 'Dune', id: 3 }

// remember, an instance is ALWAYS returned by an Objection query. In this case, it'll have the properties we defined, plus the id of the created row
// now if we want to force even null table columns to be properties of the instance, then we use the returning method:

const book = await Books.query().insert({title: 'Dune'}).returning('*')

{
  method: 'insert',
  options: {},
  timeout: false,
  cancelOnTimeout: false,
  bindings: [ 'Dune' ],
  __knexQueryUid: 'eCvI23yZe0oZES0d3qUxP',
  sql: 'insert into "books" ("username") values (?) returning *',
  returning: [ '*' ]
}
Book { title: 'Dune', id: 4, author: null }

```

### Patch, Update, Delete

Patch, Update and Delete by default return the number of rows affected. We can use returning() to make it return instances.

```
const numUpdated = await Person.query()
  .where('id', 1234)
  .patch({
    firstName: 'Jennifer'
  })

const jennifer = await Person.query()
  .where('id', 1234)
  .patch({ firstName: 'Jenn', lastName: 'Lawrence' })
  .returning('*')

const numDeleted = await Person.query()
  .where({ firstName: 'Jennifer' })
  .delete()

const deletedJennifers = await Person.query()
  .where({ firstName: 'Jennifer' })
  .delete()
  .returning('*')
```

## Relation Queries - from Model.query() to Model.relatedQuery()

### Find queries

When is the relationMappings() static getter ever used?

By Model's static method relatedQuery(). It receives only one parameter: a name of a relation mapping.
Besides Model's static method, there's Model's instance method counterpart: $relatedQuery()

So Model.relatedQuery() and Model.$relatedQuery() both use ModelSubclass.relationMappings(). We never use relationMappings directly.

The instance method $relatedQuery() from Model requires... an instance from Model (obviously). So the example below needs two queries in order to get the dogs of a particular person:

```
const person = await Person.query()
  .findById(1)

const dogs = await person.$relatedQuery('pets')
  .where('species', 'dog')
```

For the same result, the static method relatedQuery() from Model requires no instance (obviously), therefore only one query is needed (BUT more methods are needed to be chained to the Query):

```
const dogs = await Person.relatedQuery('pets')
  .for(1)
  .where('species', 'dog')
```

This QueryBuilder.for(relationOwners) method is always used with relatedQuery() and takes as argument the owner(s) of the relation. The argument can be:

- a single identifier or an array of them
- a model instance or an array of them
- a query builder

With Model.HasManyRelation and Model.BelongsToOneRelation relations, we might as well just use regular query():

```
const dags = await Pet.query().where({ ownerId: 1, species: 'dog' })
```

It's just easier to write and read.

In a Model.ManyToManyRelation, though, a regular query() is more complicated than a relatedQuery():

```
//pure Knex, because we didn't write a Model subclass for the join table (as there's no reason to):
  const dags = await knex('persons')
    .innerJoin('persons_pets', 'persons.id', 'persons_pets.personId')
    .innerJoin('pets', 'persons_pets.petId', 'pets.id')
    .where({ 'person.id': 1, species: 'dog' })
    .toString()

//Objection's Model.relatedQuery() is the same code as for any other type of relation:
  const dags = await Person.relatedQuery('pets')
  .for(1)
  .where('species', 'dog')
```

### Insert queries

We want to insert a new object in a related table and have Objection do the necessary updates to the owner table to create the relationship for us.

We do the same Model.relatedQuery(relationMappingsPropertyName) or modelInstance.$relatedQuery(relationMappingsPropertyName) and then chain a call to the .insert() method:

```
  const person = await Person.query().where('id', 1)
  const newDag = await person.$relatedQuery('dogs').insert({ name: 'Fluffy' })

  const newDag = await Person.relatedQuery('pets')
    .for(1)
    .insert({ name: 'Fluffy' })
```

If we need to write to extra columns to the join table of a many-to-many relation, we need first to define those columns in the 'extra' property of the 'through' property of a Model's relation mapping. The 'extra' property is an array with the names of the columns. The details of those columns are not of Objection's concern; they're supposed to be in the schema defined in Knex's migration file:

```
class Person extends Model {
  ...

  static get relationMappings() {
    return {
      'pets': {
        relation: Model.ManyToManyRelation,
        from: 'person.id',
        through: {
          from: 'persons_pets.personId',
          to: 'persons_pets.petId',
          extra: ['responsibilityLevel']
        },
        to: 'pets.id'
      }
    }
  }
}

const newDag = await Person.for(1).relatedQuery('pets').insert({
  name: 'Fido',
  reponsibilityLevel: 100,
})
```

### Relate queries

Relating means attaching an EXISTING item to another through a relationship defined in the relationMappings property of the Model.

For that we'll use the QueryBuilder.relate() method:

```
    const [actor] = await Person.query().where('firstName', 'Josefa')
    const [movie] = await Movie.query().where(
      'name',
      'The Zé das Couves Supremacy'
    )

    const result = await actor.$relatedQuery('movies').relate(movie)
    console.log(result)
    const result2 = await actor
      .$relatedQuery('movies')
      .unrelate()
      .where('name', 'The Zé das Couves Supremacy')
    console.log(result2)
```

The same can be done using the static method Model.relatedQuery() before QueryBuilder.relate():

```
    const result = await Person.relatedQuery('movies').for(3).relate(2)
    const result2 = await Person.relatedQuery('movies')
      .for(3)
      .unrelate()
      .where('movies.id', 2)
    console.log(result, result2)
```

## Eager Loading

If we wanted both a Person instance and their Pet instances, we'd do two queries:

```
const [person] = await Person.query().where('firstName', 'Josefa')
const pets = await person.$relatedQuery('pets')
```

Alternatively, Objection offers some methods for us to all of that in just one query, and have the pets as a property of person (as well as any other relation). They call it Eager Loading for fetching a "graph of relations". In other words, they "load the relations eagerly".

The methods are QueryBuilder.withGraphFetched() and QueryBuilder.withGraphJoined(). While Model.relatedQuery() takes a relation name as its argument, QueryBuilder.withGraphFetched() and QueryBuilder.withGraphJoined() take a relation -expression-.

### allowGraph

The relation expression can be limited by what's passed to a call to QueryBuilder.allowGraph(). If it's not a subset of that, then the query is rejected and an error is thrown by withGraphFetched or withGraphJoined.

### withGraphFetched

withGraphJoined does multiple joins and then performs one single query over the joined tables to fetch the whole relation graph. withGraphFetched performs one query per level in the relation expression tree. For example, the expression children.children will make the method perform two additional queries.

withGraphFetched is the recommended choice.

```
const [person] = await Person.query().where('id', 1).withGraphFetched('pets')
console.log(person.pets[0].name)
```

Multiple relations on multiple levels can be eagerly loaded with withGraphFetched:

```
const people = await Person.query().withGraphFetched('[pets, children.[pets, children]]')

console.log(people[0].pets[0].name);
console.log(people[1].children[2].pets[1].name);
console.log(people[1].children[2].children[0].name);
```

Loading a relation recursively:

```
const people = await Person.query().withGraphFetched('children.^')
```

Limit the recursion to three levels:

```
const people = await Person.query().withGraphFetched('children.^3')
console.log(people[0].children[0].children[0].children[0].name)
```

#### Relation Modifiers

Relations can be modified/filtered using the modifyGraph() method:

`queryBuilder.modifyGraph(expressionWhereTheFilterShallBeApplied, theFilterItself)`

```
User.query()
  .withGraphFetched('[children.[pets,movies], movies]')
  .modifyGraph('children.[pets,movies]', (builder) => {
    builder.orderBy('id')
  })
```

A Model subclass can have modifiers:

```
class Movie extends Model {
  static get tableName() {
    return 'movies'
  }

  static get modifiers() {
    return {
      goodMovies(builder) {
        builder.where('rottenScore', '>', 3)
      },
      orderByName(builder) {
        builder.orderBy('name')
      }
    }
  }
}
```

by using QueryBuilder.modifyGraph(), we can make use of those static modifiers in our Eager Loading methods QueryBuilder.withGraphFetched and QueryBuilder.withGraphJoined:

```
const people = await Person.query()
  .withGraphFetched('movies')
  .modifyGraph('movies', 'goodMovies')

const people = await Person.query()
  .withGraphFetched('movies')
  .modifyGraph('movies', ['goodMovies', 'orderByName'])
```

we might also create modifiers on-the-fly:

```
const people = await Person.query()
  .withGraphFetched('movies')
  .modifiers({
    terror(builder) {
      builder.where('genre', 'terror')
    },
    pg13(builder) {
      builder.where('classification', 'pg13')
    },
  })
  .modifyGraph('movies', ['terror', 'pg13'])
```

### withGraphJoined

Instead of using graph modifiers we could just try this:

```
const people = await Person.query()
  .withGraphFetched('movies')
  .where({ 'movies.genre': 'terror', 'movies.classification': 'pg13' })
```

But that wouldn't work, because when using withGraphFetched, we can't refer to related items from the root query, and the reason is the tables are NOT joined.

withGraphJoined joins the tables before anything else, so we can actually refer to related tables in the root query:

```
const people = await Person.query()
  .withGraphJoined('movies')
  .where({ 'movies.genre': 'terror', 'movies.classification': 'pg13' })
```

## Graph Inserts

We've seen graph selects (eager loading). Of course graph inserts are possible.

allowGraph also limits which relations can be inserted using insertGraph

Inserted objects have ids added to them and related rows have foreign keys set, but no other columns get fetched from the database. You have to use insertGraphAndFetch for that.

```
await Person.query().insertGraph({
  firstName: 'Sylvester',
  lastName: 'Stallone',
  children: [{ firstName: 'Sage', lastName: 'Stallone' }],
})
```

In order to reference the same model in multiple places of the graph, we can use the special properties #id and #ref. Also, a second argument must be passed to insertGraph: an object with property allowRefs true.

```
  await Person.query().insertGraph(
    [
      {
        firstName: 'Jennifer',
        lastName: 'Lawrence',

        movies: [
          {
            '#id': 'silverLiningsPlaybook',
            name: 'Silver Linings Playbook',
            duration: 122,
          },
        ],
      },
      {
        firstName: 'Bradley',
        lastName: 'Cooper',

        movies: [
          {
            '#ref': 'silverLiningsPlaybook',
          },
        ],
      },
    ],
    { allowRefs: true }
  )
```

If we have to relate a new item with an existing one, the relate option has to be true

```
await Person.query().insertGraph(
  [
    {
      firstName: 'Jennifer',
      lastName: 'Lawrence',

      movies: [
        {
          id: 2636
        }
      ]
    }
  ],
  {
    relate: true
  }
);
```

## API Reference

### module Objection

Here's what we need:

```
  const {
    Model,
    snakeCaseMappers,
    ValidationError,
    NotFoundError,
    DBError,
    ConstraintViolationError,
    UniqueViolationError,
    NotNullViolationError,
    ForeignKeyViolationError,
    CheckViolationError,
    DataError,
  } = require('objection')
```

### class QueryBuilder

The most important component in objection. An instance of QueryBuilder is returned by every call to methods that fetch or modify items in the database.

It's a wrapper around knex's QueryBuilder. The fundamental difference is that knex's QueryBuilder returns plain JS objects, while objection's QueryBuilder returns Model subclass instances.

QueryBuilder is also a thenable, meaning we can use it like a promise. Actually the preferred way to use it is with the await operator.

#### methods

insert(), patch(), update(), delete()

#### Find Methods

Those that go together are the same query

```
await User.query().findById(3).debug()
await User.query().where('id', '=', 4).debug()

await User.query().findByIds([5, 6]).debug()
await User.query().whereIn('id', [7, 8]).debug()

// both below are the same and DO NOT add limit=1 to the query. All they do is return the first element if the result comes in an array
const a = await User.query().findOne('login', '=', 'admin')
const b = await User.query().where('login', '=', 'admin').first()
const c = await User.query().where('login', '=', 'admin') //control. returns an array of one element, so we'll have to use c[0] later
// or do destructuring assignment: const [c] = await User.query().where('login', '=', 'admin')
```

QueryBuilder.alias(alias) aliases the table used in the query
`await User.query().alias('u').where('u.id', 1).debug()`

QueryBuilder.aliasFor(tableNameOrModelClass, alias) gives an alias for any table in the query

```
  await User.query().aliasFor('user', 'u').where('u.id', 1).debug()
  await User.query().aliasFor(User, 'u').where('u.id', 1).debug()
```

QueryBuilder.whereComposite(columns, operator, values) is for composite primary keys
QueryBuilder.whereInComposite(columns, values) same

See Knex docs for those:
select()
as() // this aliases a subquery, not a table
columns()
column()
from()
into()
with()
withSchema()
table()
distinct()
distinctOn()
count(), countDistinct()
where(), andWhere(), orWhere(), whereNot(), orWhereNot(), whereExists(), orWhereExists(), whereNotExists(), orWhereNotExists(), whereIn(), orWhereIn(), whereNotIn(), orWhereNotIn(), whereNull(), orWhereNull(), whereNotNull(), orWhereNotNull(), whereBetween(), whereNotBetween(), orWhereBetween(), orWhereNotBetween(), whereColumn(), andWhereColumn(), orWhereColumn(), whereNotColumn(), andWhereNotColumn(), orWhereNotColumn()
min(), max(), sum(), avg(), avgDistinct(), groupBy()
orderBy()
limit(), offset()
union(), unionAll(), intersect()
returning(),
increment(), decrement(), truncate()

#### Mutating Methods

QueryBuilder.insert(modelsOrObjects).returning('_')
QueryBuilder.insertGraph(graph).returning('_')
QueryBuilder.patch(modelOrObject).returning('_')
QueryBuilder.update(modelOrObject).returning('_')
QueryBuilder.delete().returning('\*')
QueryBuilder.relate()
QueryBuilder.unrelate()

#### Eager Loading Methods

QueryBuilder.withGraphFetched()
QueryBuilder.withGraphJoined()
QueryBuilder.graphExpressionObject()
QueryBuilder.allowGraph()
QueryBuilder.modifyGraph()

#### Join Methods

QueryBuilder.innerJoinRelated()
QueryBuilder.outerJoinRelated()
QueryBuilder.leftJoinRelated()
QueryBuilder.leftOuterJoinRelated()
QueryBuilder.rightJoinRelated()
QueryBuilder.rightOuterJoinRelated()
QueryBuilder.fullOuterJoinRelated()

#### Other Methods

QueryBuilder.debug() // prints query
QueryBuilder.resolve() // fakes a query resolution
QueryBuilder.reject() // fakes a query rejection
QueryBuilder.execute() // executes query and returns a promise
QueryBuilder.clone()
QueryBuilder.resultSize() // better than count(), which returns an array of objects instead of a number
QueryBuilder.page(page, pageSize) //executes the actual query and another to get the total count. If Postgres has an empty result set, we don't get the total count.
QueryBuilder.first()
QueryBuilder.modify()
QueryBuilder.modifiers()

### class Model

We'll use this class before the QueryBuilder class.

It represents a database table and its instances represent rows.

The tableName getter property is mandatory. A Model class can define relationships via the static getter property relationMappings. A jsonSchema can be used to validate inputs. An idColumn property can be used to change the default primary key from 'id'.

Sometimes is a good idea to create a BaseModel subclass and inherit all our models from it.

```
const { Model } = require('objection')

class Parrot extends Model {
  static get tableName() {
    return 'parrot'
  }

  static get idColumn() {
    return 'beakNo'
  }

  static get relationMappings() {
    return {
      friends: {
        relation: Model.ManyToManyRelation,
        modelClass: Parrot,
        join: {
          from: 'parrot.id',
          through: {
            from: 'parrot_parrot.id1',
            to: 'parrot_parrot.id2',
          },
          to: 'parrot.id',
        },
      },
    }
  }
}
```

#### static virtualAttributes

The returned array of instance getter and method names means those will be actual properties of the JSON object returned by a call to toJSON() on an instance.

```
class Person extends Model {
  static get virtualAttributes() {
    return ['fullName', 'isFemale']
  }

  fullName() {
    return `${this.firstName} ${this.lastName}`
  }

  get isFemale() {
    return this.gender === 'female'
  }
}

const person = Person.fromJson({
  firstName: 'Jennifer',
  lastName: 'Aniston',
  gender: 'female'
});

// Note that `toJSON` is always called automatically
// when an object is serialized to a JSON string using
// JSON.stringify. You very rarely need to call `toJSON`
// explicitly. koa, express and all other frameworks I'm
// aware of use JSON.stringify to serialize objects to JSON.
const pojo = person.toJSON();

console.log(pojo.fullName); // --> 'Jennifer Aniston'
console.log(pojo.isFemale); // --> true
```

#### static modifiers

These are reusable functions for query building using QueryBuilder.modify() or QueryBuilder.modifyGraph().

```
class Animal extends Model {
  static get modifiers() {
    return {
      dogs(builder) {
        builder.where('species', 'dog');
      }
    };
  }
}

Person.query()
  .withGraphFetched('[pets]')
  .modifyGraph('pets', 'dogs');
```

#### static methods

Model.knex(knexInstance) //setter
Model.knex() //getter for Model.knex().raw(...args)
Model.query()
Model.relatedQuery(relationName).for(idModelsHere).relate(idForRelationHere)
//relatedQuery() without a for() can be used as a subquery.
Model.fetchGraph(modelInstances, relationExpression)

#### instance methods

Model.$query() // all queries only affect this Model instance

```
const person = await Person.query()
const reFetchedPerson = await person.$query() //refetches the same row. Doesn't affect the model instance in 'person', though
person.$set(refetchedPerson) //sets the values of this model instance to those of another model instance
```

`Model.$query()` returns a QueryBuilder, just as `Model.query()`. As we've already seen, the QueryBuilder is a thenable, meaning that an await operator will give us its resolving value. That's why `const person = await Person.query()` works

```
Model.$query().insert()
Model.$query().patch()
Model.$query().update()
Model.$query().delete()
```

So `const builder = Person.relatedQuery(relationName).for(person)` is the same as `const builder = person.$relatedQuery(relationName)`

```
Model.$relatedQuery().relate()
Model.$relatedQuery().unrelate()
```

With `Model.$relatedQuery().delete()` the related item is deleted, but in the case of a Model.ManyToManyRelation, the join table entry is not deleted, unless you used ON DELETE CASCADE in your database migrations to make the database properly delete the join table rows when either end of the relation is deleted.

`Model.$clone(options)` return a deep copy of a model instance. A shallow copy without relations can be created by passing the `shallow: true` option.

```
Model.$setRelated(relation, relatedModels)
Model.$appendRelated(relation, relatedModels)
```

`instance.$fetchGraph(expression)` is a shortcut for `Model.fetchGraph(instance, expression)`

```
   const [actor] = await Person.query().where('firstName', 'Josefa')
    console.log(actor)
    /*
    Person {
      id: 3,
      parentId: null,
      firstName: 'Josefa',
      lastName: 'Josefina',
      age: null
    }
    */
    await Person.fetchGraph(actor, 'movies')
    console.log(actor)
    /*
    Person {
      id: 3,
      parentId: null,
      firstName: 'Josefa',
      lastName: 'Josefina',
      age: null,
      movies: [
        Movie { id: 1, name: 'The Zé das Couves Identity', role: 'Spy' },
        Movie { id: 3, name: 'The Zé das Couves Ultimatum', role: 'Spy' }
      ]
    }
    */
    const [sameActor] = await Person.query()
      .where('firstName', 'Josefa')
      .withGraphFetched('movies')
    console.log(sameActor)
    /*
    Person {
      id: 3,
      parentId: null,
      firstName: 'Josefa',
      lastName: 'Josefina',
      age: null,
      movies: [
        Movie { id: 1, name: 'The Zé das Couves Identity', role: 'Spy' },
        Movie { id: 3, name: 'The Zé das Couves Ultimatum', role: 'Spy' }
      ]
    }
    */
```
