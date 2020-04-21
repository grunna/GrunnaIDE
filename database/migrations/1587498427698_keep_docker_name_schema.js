'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class KeepDockerNameSchema extends Schema {
  up () {
    this.alter('projects', (table) => {
      table.boolean('keep_docker_name').defaultTo(false).notNullable()
      table.string('docker_port', 25)
      table.string('docker_name', 100)
    })
  }

  down () {
    this.alter('projects', (table) => {
      table.dropColumn('keep_docker_name')
      table.dropColumn('docker_port')
      table.dropColumn('docker_name')
    })
  }
}

module.exports = KeepDockerNameSchema
