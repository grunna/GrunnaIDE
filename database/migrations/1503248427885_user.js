'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')
const uuid = use('uuid/v4')

class UserSchema extends Schema {
  up () {
    this.create('users', (table) => {
      table.increments()
      table.uuid('uuid').notNullable().defaultTo(uuid())
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
