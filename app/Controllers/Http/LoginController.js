'use strict'
const User = use('App/Models/User')

class LoginController {

  async redirect({
    ally
  }) {
    await ally.driver('github').redirect()
  }

  async callback({
    ally,
    auth,
    response
  }) {
    try {
      const ghUser = await ally.driver('github').getUser()

      // user details to be saved
      const userDetails = {
        email: ghUser.getEmail(),
        token: ghUser.getAccessToken(),
        login_source: 'github'
      }


      // search for existing user
      const whereClause = {
        email: ghUser.getEmail()
      }

      const user = await User.findOrCreate(whereClause, userDetails)

      let accessToken = await auth.login(user)
      response.safeHeader('Authorization', accessToken.type + ' ' + accessToken.token)

      return response.route('editor')
    } catch (error) {
      return 'Unable to authenticate. Try again later: ' + error
    }
  }

  async loginDev({auth, response}) {
    const userDetails = {
      email: 'dev123@grunna.com',
      token: 'token',
      login_source: 'dev'
    }

    // search for existing user
    const whereClause = {
      email: 'dev123@grunna.com'
    }

    const user = await User.findOrCreate(whereClause, userDetails)
    let accessToken = await auth.login(user)
    response.safeHeader('Authorization', accessToken.type + ' ' + accessToken.token)

    return response.route('editor')
  }

  async logout({
    ally,
    auth,
    response
  }) {
    await auth.logout()
    return response.route('/login')

  }

}

module.exports = LoginController
