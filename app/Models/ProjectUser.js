'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class ProjectUser extends Model {
  static get table () {
    return 'project_user'
  }
}

module.exports = ProjectUser
