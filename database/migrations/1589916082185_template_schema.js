'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class TemplateSchema extends Schema {
  up () {
    this.create('templates', (table) => {
      table.increments()
      table.timestamps()
      table.string('gitUrl', 1024)
      table.string('description', 1024)
      table.integer('docker_image_id').unsigned().references('id').inTable('docker_images')
    })
  }

  down () {
    this.drop('templates')
  }
}

module.exports = TemplateSchema
