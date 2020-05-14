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

}

module.exports = Project
