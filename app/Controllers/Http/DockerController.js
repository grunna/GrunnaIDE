'use strict'

const Env = use('Env')
const Docker = require('dockerode');
const Ws = use('Ws')
const path = use('path')
const Shared = require('./Shared')
const shared = new Shared()
const {
  Writable
} = require('stream');
const dockerChannel = Ws.getChannel('docker:*')

class WsDockerInfoChannel extends Writable {
  constructor(options) {
    super(options)
  }
  _write(chunk, encoding, callback) {
    const data = chunk.toString('utf8')
    if (dockerChannel) {
      dockerChannel.topic('docker:infoChannel').broadcast('output', data)
      process.stdout.write(data);
    }
    callback();
  }

}

class DockerController {

  async createDocker({ session, response, request, auth }) {
    let docker = new Docker()
    const projectPath = Env.get('SAVEDIRECTORY') + '/' + auth.user.uuid + '/' + session.get('currentProject')

    console.log('ProjectPath: ', projectPath)
    
    let container = docker.getContainer('grunna-' + auth.user.id)

    await container.stop()
      .then(data => {
	console.log('createDocker: Container have been stoped')
	return container.remove()
      })
      .then(data => {
	console.log('createDocker: Container have been removed')
      })
      .catch(err => {
	console.log('createDocker: Container error -> ' + err)
      })

    let dockerConfig = shared.dockerConfig('node:10', path.resolve(projectPath), 'grunna-' + auth.user.id) 

    console.log('CreateContainer')
    await docker.createContainer(dockerConfig)
      .then(container => {
	container.start()
	return response.ok()
      })
      .catch(err => {
	console.log('err: ', err)
	return response.ok('Container already running')
      })
  }
}

module.exports = DockerController
