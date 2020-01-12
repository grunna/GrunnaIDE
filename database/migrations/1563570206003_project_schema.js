'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')
const uuid = use('uuid/v4')

class ProjectSchema extends Schema {
  up () {
    this.create('projects', (table) => {
      table.increments()
      table.uuid('uuid').notNullable().defaultTo(uuid())
      table.timestamps()
      table.string('name', 255).notNullable()
      table.string('gitUrl', 1024).notNullable()
      table.string('gitUsername', 100)
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.integer('owner').notNullable()
    })
  }

  down () {
    this.drop('projects')
  }
}

module.exports = ProjectSchema
