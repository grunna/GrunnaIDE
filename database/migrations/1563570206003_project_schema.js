'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ProjectSchema extends Schema {
  up () {
    this.create('projects', (table) => {
      table.increments()
      table.uuid('uuid').notNullable().unique()
      table.timestamps()
      table.string('name', 255).notNullable()
      table.string('gitUrl', 1024)
      table.string('gitUsername', 100)
      table.integer('owner').notNullable()
      table.string('docker_image').defaultTo('node:10')
    })
  }

  down () {
    this.drop('projects')
  }
}

module.exports = ProjectSchema
