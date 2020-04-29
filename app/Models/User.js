'use strict'

/** @type {import('@adonisjs/framework/src/Hash')} */
const Hash = use('Hash')

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

const uuid = use('uuid/v4')

class User extends Model {
  static boot () {
    super.boot()

    this.addHook('beforeCreate', async (userInstance) => {
      userInstance.uuid = uuid()
    })
    
    /**
     * A hook to hash the user password before saving
     * it to the database.
     */
    this.addHook('beforeSave', async (userInstance) => {
      if (userInstance.dirty.password) {
        userInstance.password = await Hash.make(userInstance.password)
      }
    })
  }

  /**
   * A relationship on tokens is required for auth to
   * work. Since features like `refreshTokens` or
   * `rememberToken` will be saved inside the
   * tokens table.
   *
   * @method tokens
   *
   * @return {Object}
   */
  tokens () {
    return this.hasMany('App/Models/Token')
  }

  /**
   * All the project a user belongs to
   */
  /*projects () {
    return this.hasMany('App/Models/Project')
  }*/
  
  projects () {
    return this
      .belongsToMany('App/Models/Project')
      .pivotModel('App/Models/ProjectUser')
  }
  
  /**
  * Link to all the statics a user have
  */
  statistics () {
    return this.hasOne('App/Models/Statistics')
  }
}

module.exports = User
