'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DockerImageSchema extends Schema {
  up () {
    this.create('docker_images', (table) => {
      table.increments()
      table.timestamps()
      table.string('image', 512)
      table.string('name', 128)
      table.string('description', 1024)
    })
  }

  down () {
    this.drop('docker_images')
  }
}

module.exports = DockerImageSchema
