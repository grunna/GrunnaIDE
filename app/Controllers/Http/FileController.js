'use strict'

const Env = use('Env')
const fs = require('fs-extra')
const Shared = require('./Shared')
const shared = new Shared()
const Database = use('Database')

class FileController {

  async downloadFile({request, response, auth}) {
    let path = Env.get('GITPROJECTDIR') + '/' + auth.user.uuid + request.post().fileName
    if (!shared.checkPath(Env.get('GITPROJECTDIR') + '/' + auth.user.uuid + '/', path)) {
      return response.badRequest('error in path')
    }
    await fs.readFile(path, 'utf8')
      .then(contents => {
      response.type('application/octet-stream')
      shared.addValueStatistics('filesDownloaded', auth.user.id)
      return response.send(contents)
    })
      .catch(err => {
      return response.badRequest(err)
    })
  }

  async saveFile({request, response, auth}) {
    let path = Env.get('GITPROJECTDIR') + '/' + auth.user.uuid + request.post().fileName
    if (!shared.checkPath(Env.get('GITPROJECTDIR') + '/' + auth.user.uuid + '/', path)) {
      return response.badRequest('error in path')
    }
    await fs.outputFile(path, request.post().data)
      .catch(err => {
      console.log('err: ', err)
      return response.badRequest(err)
    })
    await shared.addValueStatistics('saveTimes', auth.user.id)
    return response.ok(request.post().fileName + ' updated')
  }

  async reloadFileTree({session, auth, response}) {
    await shared.addValueStatistics('reloadFileTree', auth.user.id)
    return response.ok(await shared.getTree(auth.user.uuid, session.get('currentProject')))
  }

  async createFile({session, request, response, auth}) {
    let newPath = Env.get('GITPROJECTDIR') + '/' + auth.user.uuid + request.post().fromDirectory + '/' + request.post().newFile
    if (!shared.checkPath(Env.get('GITPROJECTDIR') + '/' + auth.user.uuid + '/', newPath)) {
      return response.badRequest('error in path')
    }
    await fs.ensureFile(newPath)
      .catch((err) => {
      return response.badRequest(err)
    })
    await shared.addValueStatistics('fileCreated', auth.user.id)
    return response.ok(await shared.getTree(auth.user.uuid, session.get('currentProject')))
  }

  async createDirectory({session, request, response, auth}) {
    let newPath = Env.get('GITPROJECTDIR') + '/' + auth.user.uuid + request.post().fromDirectory + '/' + request.post().newDirectory
    if (!shared.checkPath(Env.get('GITPROJECTDIR') + '/' + auth.user.uuid + '/', newPath)) {
      return response.badRequest('error in path')
    }
    await fs.mkdir(newPath)
      .catch((err) => {
      return response.badRequest(err)
    })
    await shared.addValueStatistics('directoryCreated', auth.user.id)
    return response.ok(await shared.getTree(auth.user.uuid, session.get('currentProject')))
  }

  async rename({session, request, response, auth}) {
    let oldName = Env.get('GITPROJECTDIR') + '/' + auth.user.uuid + request.post().fromDirectory
    if (!shared.checkPath(Env.get('GITPROJECTDIR') + '/' + auth.user.uuid + '/', oldName)) {
      return response.badRequest('error in path')
    }
    let newName = Env.get('GITPROJECTDIR') + '/' + auth.user.uuid + request.post().newName
    if (!shared.checkPath(Env.get('GITPROJECTDIR') + '/' + auth.user.uuid + '/', newName)) {
      return response.badRequest('error in path')
    }
    await fs.rename(oldName, newName, (err) => {
      if (err) {
        return response.badRequest('error change name')
      }
    });
    return response.ok(await shared.getTree(auth.user.uuid, session.get('currentProject')))
  }

  async deleteFileDirectory({session, request, response, auth}) {
    let deletePath = Env.get('GITPROJECTDIR') + '/' + auth.user.uuid + request.post().fileOrDirectory
    console.log('path: ', deletePath)
    if (!shared.checkPath(Env.get('GITPROJECTDIR') + '/' + auth.user.uuid + '/', deletePath)) {
      return response.badRequest('error in path: ', request.post().fileOrDirectory)
    }
    await fs.remove(deletePath)
      .catch(err => {
      console.log('err: ', err)
      return response.badRequest(err)
    })
    await shared.addValueStatistics('deleteFileDirectory', auth.user.id)
    return response.ok(await shared.getTree(auth.user.uuid, session.get('currentProject')))
  }

  async upload({session, request, response, auth}) {
    let uploadPath = Env.get('GITPROJECTDIR') + '/' + auth.user.uuid + request.post().uploadFilePath
    if (!shared.checkPath(Env.get('GITPROJECTDIR') + '/' + auth.user.uuid + '/', uploadPath)) {
      return response.badRequest('error in path')
    }
    const files = request.file('files', {
      size: '5mb'
    })

    await files.moveAll(uploadPath, (file) => {
      return {
        overwrite: true
      }
    })
    
    if (!files.movedAll()) {
      return files.errors()
    }
    await shared.addValueStatistics('filesUploaded', auth.user.id)
    return response.ok(await shared.getTree(auth.user.uuid, session.get('currentProject')))
  }
}

module.exports = FileController
