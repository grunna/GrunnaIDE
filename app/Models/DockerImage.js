'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class DockerImage extends Model {
  
  templates () {
    return this.hasMany('App/Models/Template')
  } 
  
}

module.exports = DockerImage
