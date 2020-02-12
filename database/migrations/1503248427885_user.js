'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserSchema extends Schema {
  up () {
    this.create('users', (table) => {
      table.increments()
      table.uuid('uuid').notNullable().unique()
      table.string('email', 254).notNullable().unique()
      table.string('login_source', 20).notNullable()
      table.string('token', 80).notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('users')
  }
}

module.exports = UserSchema
