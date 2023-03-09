/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const { Model } = require('objection')
const Person = require('../models/Person.js')

exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('books').del()
  await knex('books').insert([
    { title: 'Lord of the Rings', author: 'Tolkien', year: 1930 },
    { title: '1984', author: 'Orwell', year: 1948 },
    { title: 'Lord of the Flies', author: 'William Goldling', year: 1954 },
    { title: 'Animal Farm', author: 'Orwell', year: 1922 },
  ])

  await knex('users').del()
  await knex('users').insert([
    { username: 'Sonic', password: 'the Hog' },
    { username: 'Knuckles', password: 'the Enchilada' },
  ])

  //Objection
  Model.knex(knex)
  await Person.query().insertGraph(
    [
      {
        firstName: 'Zé',
        lastName: 'das Couves',
        movies: [
          { '#id': 200, name: 'The Zé das Couves Identity', role: 'Himself' },
          {
            '#id': 201,
            name: 'The Zé das Couves Supremacy',
            role: 'Himself 2',
          },
          {
            '#id': 202,
            name: 'The Zé das Couves Ultimatum',
            role: 'Himself 3',
          },
        ],
      },
      {
        firstName: 'Maria',
        lastName: 'das Couves',
        movies: [{ '#ref': 200, role: 'Wife' }],
      },
      {
        firstName: 'Josefa',
        lastName: 'Josefina',
        movies: [
          { '#ref': 200, role: 'Spy' },
          { '#ref': 201, role: 'Spy' },
          { '#ref': 202, role: 'Spy' },
        ],
      },
      {
        firstName: 'Ziza',
        lastName: 'Zambezi',
        movies: { '#ref': 202, role: 'Hacker' },
      },
      {
        firstName: 'Mônica',
        pets: [
          { name: 'Monicão', species: 'Dog' },
          { name: 'Bidu', species: 'Dog' },
        ],
      },
      {
        firstName: 'Magali',
        pets: [
          { name: 'Mingau', species: 'Cat' },
          { name: 'Floquinho', species: 'Dog' },
        ],
      },
      {
        firstName: 'Cascão',
        pets: [{ name: 'Chovinista', species: 'Pig' }],
      },
    ],
    { allowRefs: true }
  )
}
