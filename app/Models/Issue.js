'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const { v4: uuidv4 } = require('uuid');

class Issue extends Model {
  static boot () {
    super.boot()

    this.addHook('beforeCreate', async (projectInstance) => {
      projectInstance.uuid = uuidv4()
    })
  }
  
  project () {
    return this.belongsTo('App/Models/Project')
  }
  
  userOwner () {
    return this.belongsTo('App/Models/User')
  }
  
  assignee () {
    return this.belongsTo('App/Models/User')
  }
  
  comments () {
    return this.hasMany('App/Models/IssueComment')
  }
}

module.exports = Issue
