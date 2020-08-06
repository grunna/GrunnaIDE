'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class IssueSchema extends Schema {
  up () {
    this.create('issues', (table) => {
      table.increments()
      table.timestamps()
      table.integer('issue_id').notNullable()
      table.uuid('uuid').notNullable().unique()
      table.integer('project_id').unsigned().references('id').inTable('projects')
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.boolean('open').defaultTo('true').notNullable()
      table.string('title')
      table.text('description')
      table.integer('assignee_id').unsigned().references('id').inTable('users')
      table.integer('importance')
      table.date('due_date')
      table.string('estimate_time')
      table.boolean('members_only').defaultTo('false').notNullable()
      table.boolean('lock').defaultTo('false').notNullable()
      table.date('deleted_at')
    })
  }

  down () {
    this.drop('issues')
  }
}

module.exports = IssueSchema
