'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

const { v4: uuidv4 } = require('uuid');

class Project extends Model {
  static boot () {
    super.boot()

    this.addHook('beforeCreate', async (projectInstance) => {
      projectInstance.uuid = uuidv4()
    })
  }
  
  shareProject () {
    return this.hasMany('App/Models/ShareProject')
  }
  
  issues () {
    return this.hasMany('App/Models/Issue')
  }

}

module.exports = Project
