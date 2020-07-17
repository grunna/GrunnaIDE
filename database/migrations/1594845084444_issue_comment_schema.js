'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class IssueCommentSchema extends Schema {
  up () {
    this.create('issue_comments', (table) => {
      table.increments()
      table.timestamps()
      table.text('text')
      table.integer('user').unsigned().references('id').inTable('users')
      table.integer('issue').unsigned().references('id').inTable('issues')
    })
  }

  down () {
    this.drop('issue_comments')
  }
}

module.exports = IssueCommentSchema
