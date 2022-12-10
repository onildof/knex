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
## Coding
knex's module is actually a function. Call it on a literal object, which we'll call the *knex configuration*.

The *knex configuration* has a couple required properties:
- client
- connection

`client` will be our database library, 'pg', which we just installed.
`connection` accepts a string, a literal object, or a function (for dynamically determined connection configurations). 

The function takes no parameters and returns either a literal object or a promise for one. By default the returned object is cached and reused for further connections. That behavior can be changed if say we need to work with a temporary authentication token. The `expirationChecker` property does that job.

It's a function that is run everytime new connections are created. If it returns true, then a new connection object is made.

`userParams` is optional and you can put whatever you like in there and access it through `knex.userParams`

Initializing the knex library must be done only once, as it creates a connection pool at that point.

`pool` is kinda mandatory, because the default min is 2 for historical reasons. We should replace it with a zero.

### Properties for the development environment
`debug: true` enables the use of the *debug* library
`asyncStackTraces: true` more detail on errors