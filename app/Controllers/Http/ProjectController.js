'use strict'

const Database = use('Database')
const Env = use('Env')
const git = require('isomorphic-git');
const fs = require('fs-extra')
git.plugins.set('fs', fs)
const User = use('App/Models/User')
const Project = use('App/Models/Project')
const Shared = use('./Shared')
const shared = new Shared()


class ProjectController {

  async featchAllProjects({response, request, auth}) {
    let user = await User.findBy('uuid', auth.user.uuid)
    let projects = await user.projects().fetch()
    let returnProjects = []
    projects.rows.forEach(element => {
      returnProjects.push({id: element.id, name: element.name})
    });
    response.send(returnProjects) 
  }

  async getAllFiles({session, response, request, auth}) {
    let user = await User.findBy('uuid', auth.user.uuid)
    let project = await Database.select('name').table('projects').where('id', request.get().projectId).where('user_id', user.id).first()
    session.put('currentProject', project.name)
    const tree = await shared.getTree(user.uuid, project.name)
    response.send(tree)
  }

  async createProject({response, request, auth}) {
    let user = await User.findBy('uuid', auth.user.uuid)
    let projects = await user.projects().fetch()
    let projectExcist = projects.rows.filter(project => project.name.toLowerCase() === request.post().projectName.toLowerCase())
    if (projectExcist.length > 0) {
      return response.notAcceptable('Project name already used')
    }
    let treeResponse = ''
    await git.clone({dir: Env.get('GITPROJECTDIR') + '/' + user.uuid + '/' + request.post().projectName, url: request.post().gitUrl, username: request.post().username, password: request.post().password})
      .then(() => {
	let project = new Project()
	project.name = request.post().projectName
	project.gitUrl = request.post().gitUrl
	project.gitUsername = request.post().gitUsername
	project.user_id = user.id
	project.owner = user.id
	project.save()
      })
      .catch((error) => {
	      return response.unauthorized() 
      })
    return response.send(await shared.getTree(user.uuid, request.post().projectName))
  }

  async removeProject({response, request, auth, session}) {
     console.log('project', session.get('currentProject'))
     let project = await Project.query().where({name: session.get('currentProject'), user_id: auth.user.id}).firstOrFail()
        
     if (project) {
      await project.delete()
      await fs.remove(Env.get('GITPROJECTDIR') + '/' + auth.user.uuid +'/' + session.get('currentProject'))
       .then(() => {
           console.log('success')     
        })
       .catch(err => {
           console.error(err)
       })
     return response.ok()
     }
    return response.notFound({projectId: request.post().projectId})
  }
}

module.exports = ProjectController

