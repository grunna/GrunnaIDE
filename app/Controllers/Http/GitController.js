'use strict'

const git = require('isomorphic-git')
const PATH = require('path')
const Env = use('Env')
const fs = require('fs')
const User = use('App/Models/User')
const Project = use('App/Models/Project')
const Shared = use('./Shared')
const shared = new Shared()

git.plugins.set('fs', fs)

class GitController {

  async fetch({session, response, request, auth}) {
    console.log('test: ', Env.get('GITPROJECTDIR') + '/' + auth.user.uuid + '/' + session.get('currentProject'))
    await git.fetch({dir: Env.get('GITPROJECTDIR') + '/' + auth.user.uuid + '/' + session.get('currentProject'), username: request.post().username, password: request.post().password})
      .then(fetchData => {
	return response.ok(fetchData)
      })
      .catch(err => {
	console.log(err)
	if (err.data.statusCode === 401) {
          return response.unauthorized()
	} else {
          return response.badRequest(err)
	}
      })
  }

  async status({session, response, request, auth}) {
    let returnData = {}
    returnData.stage = []
    let listFiles = await git.listFiles({dir: Env.get('GITPROJECTDIR') + '/' + auth.user.uuid + '/' + session.get('currentProject')})
    for (let i = 0; i < listFiles.length; i++) {
      await git.status({
        dir: Env.get('GITPROJECTDIR') + '/' + auth.user.uuid + '/' + session.get('currentProject'), 
        filepath: listFiles[i] 
      })
	.then(status => {
	  console.log('file: ' + listFiles[i] +' status: ', status)
        returnData.stage.push({file: listFiles[i], status: status})
      })
      .catch(error =>  {
        return response.badRequest(error)
      })
    }    
    return response.ok(returnData)
  }

  async pull({session, response, request, auth}) {
    try {
      await git.pull({dir: Env.get('GITPROJECTDIR') + '/' + auth.user.uuid + '/' + session.get('currentProject'), username: request.post().username, password: request.post().password})
      return response.ok(await shared.getTree(auth.user.uuid, session.get('currentProject')))
    } catch (error) {
      console.log(error)
      if (error.data.statusCode === 401) {
        return response.unauthorized()
      } else {
        return response.badRequest()
      }      
    }
  }

  async add({session, response, request, auth}) {
    await git.add({ dir: Env.get('GITPROJECTDIR') + '/' + auth.user.uuid + '/' + session.get('currentProject'), filepath: request.post().file })
      .then(() => response.ok())
      .catch(error => response.badRequest(error))
  }

  async commit({session, response, request, auth}) {
    let sha = await git.commit({
      dir: Env.get('GITPROJECTDIR') + '/' + auth.user.uuid + '/' + session.get('currentProject'),
      author: {
        name: '',
        email: auth.user.email
      },
      message: request.post().commitMessage
    })
    .then(sha => response.ok(sha))
    .catch(error => response.badRequest(error))
  }

  async push({session, response, request, auth}) {
    await git.push({dir: Env.get('GITPROJECTDIR') + '/' + auth.user.uuid + '/' + session.get('currentProject'), username: request.post().username, password: request.post().password})
      .then(pushResponse => {
	console.log('pushResponse: ', pushResponse)
	if (pushResponse.error) {
	  return response.badRequest(pushResponse.error)
	} else {
	  return response.ok(pushResponse.ok)
	}
      })
      .catch(error => {
	if (error.data && error.data.statusCode === 401) {
	  return response.unauthorized()
	} else {
	  return response.badRequest(error)
	}
      })
  }

  async testGit({session, response, request, auth}) {
    return notImplemented()
  }
}

module.exports = GitController
