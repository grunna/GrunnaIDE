'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ShareProjectSchema extends Schema {
  up () {
    this.create('share_projects', (table) => {
      table.increments()
      table.timestamps()
      table.uuid('uuid').notNullable().unique()
      table.integer('project_id').unsigned().references('id').inTable('projects')
      table.boolean('active').defaultTo('true')
      table.string('filename', 512).nullable()
    })
  }

  down () {
    this.drop('share_projects')
  }
}

module.exports = ShareProjectSchema
