'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ProjectUserSchema extends Schema {
  up () {
    this.create('project_user', (table) => {
      table.increments()
      table.timestamps()
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.integer('project_id').unsigned().references('id').inTable('projects')
      table.boolean('owner').defaultTo(false).notNullable()
      table.json('settings')
    })
  }

  down () {
    this.drop('project_user')
  }
}

module.exports = ProjectUserSchema
