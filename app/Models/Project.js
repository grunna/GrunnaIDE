'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

const uuid = use('uuid/v4')

class Project extends Model {
  static boot () {
    super.boot()

    this.addHook('beforeCreate', async (projectInstance) => {
      projectInstance.uuid = uuid()
    })
  }

}

module.exports = Project
