'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddUserMaxProjectsSchema extends Schema {
  up () {
    this.alter('users', (table) => {
      table.integer('max_projects').defaultTo(10).notNullable()
    })
  }

  down () {
    this.alter('users', (table) => {
      table.dropColumn('max_projects')
    })
  }
}

module.exports = AddUserMaxProjectsSchema
