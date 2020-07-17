'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class IssueSchema extends Schema {
  up () {
    this.create('issues', (table) => {
      table.increments()
      table.timestamps()
      table.integer('count').notNullable()
      table.uuid('uuid').notNullable().unique()
      table.integer('project_id').unsigned().references('id').inTable('projects')
      table.integer('assignee').unsigned().references('id').inTable('users')
      table.boolean('open').defaultTo('true').notNullable()
      table.string('title')
      table.text('description')
      table.string('code_place')
      table.string('test_case')
      table.date('due_date')
      table.boolean('members_only').defaultTo('false').notNullable()
      table.boolean('lock').defaultTo('false').notNullable()
    })
  }

  down () {
    this.drop('issues')
  }
}

module.exports = IssueSchema
