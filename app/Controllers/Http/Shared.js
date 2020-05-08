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

  dockerConfig(image, binds, name, docker_name) {
    let traefikRuleName = "traefik.http.routers." + docker_name + ".rule"
    let traefikEntrypointsName = "traefik.http.routers." + docker_name + ".entrypoints"
    let traefikHost = "Host(`" + docker_name + ".ide.grunna.com`)"
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
      "Labels": {
        "traefik.docker.network": "traefik",
        [traefikRuleName]: traefikHost,
        [traefikEntrypointsName]: "web"
      },
      "HostConfig": {
        "NetworkMode": Env.get('DOCKER_NETWORK'),
        "Binds": [
          binds + ":/src"
        ],
        "AutoRemove": true,
      }
    }
    return config
  }

  makeRandomString(length) {
    var result           = '';
    var characters       = 'abcdefghijklmnopqrstuvwxyz';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
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
