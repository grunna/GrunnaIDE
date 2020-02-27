'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ProjectAddImageSchema extends Schema {
  up () {
    this.alter('projects', (table) => {
      table.string('docker_image').defaultTo('node:10')
    })
  }

  down () {
    this.alter('projects', (table) => {
      table.dropColumn('docker_image')
    })
  }
}

module.exports = ProjectAddImageSchema
