'use strict'

const Database = use('Database')
const Env = use('Env')
const git = require('isomorphic-git')
const http = require('isomorphic-git/http/node')
const fs = require('fs-extra')
const User = use('App/Models/User')
const Project = use('App/Models/Project')
const ProjectUser = use('App/Models/ProjectUser')
const Shared = use('./Shared')
const shared = new Shared()

const acceptedDockerImages = ['node:10', 'node:12', 'node:13', 'openjdk:8', 'openjdk:11.0', 'golang:1.13', 'python:3.8', 'ruby:2.7', 'mono:6.8']

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
    let user = await User.find(auth.user.id)
    let project = await user.projects().wherePivot('project_id', request.get().projectId).firstOrFail()

    console.log('getAllfiles', project.name)
    session.put('currentProject', project.name)
    const tree = await shared.getTree(user.uuid, project.name)
    response.send(tree)
  }

  async createProject({response, request, auth, session}) {
    try {
    let user = await User.find(auth.user.id)
    let projects = await user.projects().wherePivot('owner', true).fetch()
    if (user.max_projects <= projects.rows.length) {
      return response.notAcceptable('Cant create more projects')
    }
    let projectExcist = projects.rows.filter(project => project.name.toLowerCase() === request.post().projectName.toLowerCase())
    if (projectExcist.length > 0) {
      return response.notAcceptable('Project name already used')
    }
    let newPath = Env.get('GITPROJECTDIR') + '/' + user.uuid + '/' + request.post().projectName
    if (!shared.checkPath(Env.get('GITPROJECTDIR') + '/' + auth.user.uuid, newPath)) {
      return response.badRequest('error in path')
    }
    let createProject = false
    if (request.post().gitUrl) {
      await git.clone({fs, http, dir: Env.get('GITPROJECTDIR') + '/' + user.uuid + '/' + request.post().projectName, url: request.post().gitUrl, username: request.post().username, password: request.post().password})
        .then(() => {
        console.log('Project created' + request.post().projectName)
        createProject = true
      })
        .catch((error) => {
        console.log('error', error)
        return response.unauthorized() 
      })
    } else {
      await fs.mkdir(newPath, { recursive: true })
        .then(() => {
        createProject = true
      })
        .catch((err) => {
        return response.badRequest(err)
      })
    }
    if (createProject) {

      let project = new Project()
      project.name = request.post().projectName
      project.gitUrl = request.post().gitUrl
      project.gitUsername = request.post().gitUsername
      // project.user_id = user.id
      project.owner = user.id
      project.docker_image = (acceptedDockerImages.includes(request.post().dockerImage) > 0) ? request.post().dockerImage : 'node:10'
      await user.projects().save(project, (row) => {
        row.owner = true
        row.settings = JSON.stringify({})
      })
      return response.send({ projectId: project.id })
    }
    }catch (e) {
      console.log('log', e)
      esponse.badRequest()
    }
  }

  async removeProject({response, request, auth, session}) {
    let user = await User.find(auth.user.id)
    let project = await user.projects().where({name: session.get('currentProject')}).firstOrFail()

    if (project) {
      await user.projects().where('name', session.get('currentProject')).delete()
      await fs.remove(Env.get('GITPROJECTDIR') + '/' + auth.user.uuid +'/' + session.get('currentProject'))
        .then(() => {
        console.log('success')     
      })
        .catch(err => {
        console.error(err)
      })
      session.forget('currentProject')
      return response.ok()
    }
    return response.notFound({projectId: request.post().projectId})
  }

  async listAllAvailibleImages({response, auth, session}) {
    return response.ok(acceptedDockerImages)
  }

  async changeDockerImage({response, request, auth, session}) {
    let user = await User.find(auth.user.id)
    let project = await user.projects().where({name: session.get('currentProject')}).firstOrFail()

    if (project) {
      if (acceptedDockerImages.includes(request.post().dockerImage) > 0) {
        project.docker_image = request.post().dockerImage
        return response.ok()
      } else {
        return response.notFound('No image was found: ' + request.post().dockerImage)
      }
    }
    return response.badRequest()
  }

  async projectSettingsGet({session, response, request, auth}) {
    let projectUser = await ProjectUser.query().where('user_id','=', auth.user.id).where('project_id','=', request.get().projectId).first()
    if (projectUser.settings == null) {
      projectUser.settings = {}
    }
    response.send(JSON.parse(projectUser.settings))
  }

  async projectSettingsPost({response, request, auth, session}) {
    let user = await User.find(auth.user.id)
    let project = await user.projects().where({name: session.get('currentProject')}).firstOrFail()
    let projectUser = await ProjectUser.query().where('user_id','=', auth.user.id).where('project_id','=', project.id).first()

    if (project) {
      if ((acceptedDockerImages.includes(request.post().dockerImage) > 0)) {
        project.docker_image = request.post().dockerImage
      }
      project.save()

      let settingsData = JSON.stringify({ideTheme: request.post().ideTheme})
      await user.projects().pivotQuery()
        .where('project_id', project.id)
        .update({ settings: settingsData })

      return response.ok()
    }
    return response.badRequest()
  }
}

module.exports = ProjectController

