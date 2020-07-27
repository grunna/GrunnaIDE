'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

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
      table.dropColumn('issue_count')
      table.dropColumn('public_project')
      table.dropColumn('anonymous_comments')
    })
  }
}

module.exports = ProjectIssueCountSchema
