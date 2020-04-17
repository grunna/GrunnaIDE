'use strict'

const PATH = require('path');
const Env = use('Env')
const dirTree = require("directory-tree");
const getSize = require('get-folder-size');
const Statistic = use('App/Models/Statistic')

class Shared {

  async getTree(userUUID, projectName) {
    const projPathLength = (Env.get('GITPROJECTDIR') + '/' + userUUID).length
    return await dirTree(Env.get('GITPROJECTDIR') + '/' + userUUID + '/' + projectName, {
      exclude: [new RegExp('\/.git$')]
    }, (item, PATH, stats) => {
      if (item.path.charAt(0) === '.') {
        item.path = item.path.slice(projPathLength)
      } else {
        item.path = item.path.slice(projPathLength - 2)
      }
    }, (item, PATH, stats) => {
      if (item.path.charAt(0) === '.') {
        item.path = item.path.slice(projPathLength)
      } else {
        item.path = item.path.slice(projPathLength - 2)
      }
    })
  }

  checkPath(correctPath, checkPath) {
    let pathOne = PATH.resolve(correctPath)
    let pathTwo = PATH.resolve(checkPath)
    if (pathTwo.startsWith(pathOne)) {
      return true
    } else {
      return false
    }
  }

  dockerConfig(image, binds, name) {
    console.log('image: ', image)
    let config = {
      Image: image,
      Cmd: ['/bin/bash'],
      name: name,
      'AttachStdin': true,
      'AttachStdout': true,
      'AttachStderr': true,
      'OpenStdin': true,
      Tty: true,
      "WorkingDir": "/src",
      "ExposedPorts": {
        "8080/tcp": { }
      },
      "HostConfig": {
        "NetworkMode": Env.get('DOCKER_NETWORK'),
        "Binds": [
          binds + ":/src"
        ],
        "PortBindings": {
          "8080/tcp": [
            {
              "HostPort": "0"
            }
          ]
        },
        "AutoRemove": true,
      }
    }
    return config
  }

  getDirectorySize(auth) {
    return new Promise((resolve, reject) => {
      getSize(Env.get('GITPROJECTDIR') + '/' + auth.user.uuid + '/', (err, size) => {
        if (err) { 
          reject(err) 
        } else {
          resolve(size)
        }
      });
    });
  }
  
  async addValueStatistics(key, userId) {
    await Statistic.findOrCreate(
      { user_id: userId },
      { user_id: userId, statistics: JSON.stringify({ key: 0 }) })
      .then((data) => {
      let stat = JSON.parse(data.statistics)
      if (stat[key]) {
      	stat[key] = stat[key] + 1
      } else {
        stat[key] = 1
      }
      data.statistics = JSON.stringify(stat)
      data.save()
    })
      .catch(err => {
      console.log('err: ', err)
    })
  }
}

module.exports = Shared
