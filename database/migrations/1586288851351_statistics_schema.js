'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class StatisticsSchema extends Schema {
  up () {
    this.create('statistics', (table) => {
      table.increments()
      table.timestamps()
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.json('statistics')
    })
  }

  down () {
    this.drop('statistics')
  }
}

module.exports = StatisticsSchema
