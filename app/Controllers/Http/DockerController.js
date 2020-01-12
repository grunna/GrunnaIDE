'use strict'

const Env = use('Env')
const Docker = require('dockerode');
const Ws = use('Ws')
const path = use('path')
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
    
    let dockerConfig = {
      Image: 'node:10',
      Cmd: ['/bin/bash'],
      name: 'grunna-' + auth.user.id,
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
	    "AutoRemove": true,
        "Binds": [
          path.resolve(projectPath) + ":/src"
        ],
        "PortBindings": {
          "8080/tcp": [
            {
              "HostPort": "0"
            }
          ]
        },
      }
    }

    console.log('CreateContainer')
    await docker.createContainer(dockerConfig)
      .then(container => {
	return container.start()
      })
      .then(container => {
	return container.inspect(function (err, data) {
	  if (err) {
	    console.log('ContainerInspectErr: ', err)
	    return response.badRequest()
	  }
	  console.log('Container created');
	  return response.ok()
	})
      })
      .catch(err => {
	console.log('err: ', err)
	return response.ok('Container already running')
      }) 
    // return response.ok()
  }

}

module.exports = DockerController
