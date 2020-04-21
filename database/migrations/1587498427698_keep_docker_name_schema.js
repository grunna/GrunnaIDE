'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class KeepDockerNameSchema extends Schema {
  up () {
    this.alter('projects', (table) => {
      table.boolean('keep_docker_name').defaultTo(false).notNullable()
    })
  }

  down () {
    this.alter('projects', (table) => {
      table.dropColumn('keep_docker_name')
    })
  }
}

module.exports = KeepDockerNameSchema
