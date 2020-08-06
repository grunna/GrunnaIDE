'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')
const Database = use('Database')

class ProjectIssueCountSchema extends Schema {
  up () {
    this.alter('projects', (table) => {
      table.integer('issue_count').defaultTo(1).notNullable()
      table.boolean('public_project').defaultTo(true).notNullable()
      table.boolean('anonymous_comments').defaultTo(true).notNullable()
    })
  }

  down () {
    this.alter('projects', (table) => {
      Database.schema.hasColumn('projects', 'anonymous_comments').then(exists => {
        if (exists) {
          table.dropColumn('issue_count')
        }
      })
      Database.schema.hasColumn('projects', 'anonymous_comments').then(exists => {
        if (exists) {
          table.dropColumn('public_project')
        }
      })
      Database.schema.hasColumn('projects', 'anonymous_comments').then(exists => {
        if (exists) {
          table.dropColumn('anonymous_comments')
        }  
      })
    })
  }
}

module.exports = ProjectIssueCountSchema
