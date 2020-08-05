'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const { v4: uuidv4 } = require('uuid');

class IssueComment extends Model {
  static boot () {
    super.boot()

    this.addHook('beforeCreate', async (issueCommentInstance) => {
      issueCommentInstance.uuid = uuidv4()
    })
  }
  
  userOwner () {
    return this.belongsTo('App/Models/User','user')
  }
}

module.exports = IssueComment
