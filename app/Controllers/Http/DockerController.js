'use strict'

const Env = use('Env')
const Docker = require('dockerode');
const Ws = use('Ws')
const path = use('path')
const Shared = require('./Shared')
const shared = new Shared()
const User = use('App/Models/User')
const Project = use('App/Models/Project')
const {
  Writable
} = require('stream');
const dockerChannel = Ws.getChannel('docker:*')

class WsDockerInfoChannel extends Writable {
  constructor(options) {
    super(options)
  }
  _write(chunk, encoding, callback) {
    try {
      const data = chunk.toString('utf8')
      if (dockerChannel) {
        dockerChannel.topic('docker:infoChannel').broadcast('output', data)
      }
    } catch (err) {
      process.stdout.write('Docker WsDockerInfoChannel error: ', err)
    }
    callback();
  }

}

class DockerController {

  async createDocker({ session, response, request, auth }) {

    let sendToInfoChannel = new WsDockerInfoChannel()
    let docker = new Docker()
    const projectPath = Env.get('SAVEDIRECTORY') + '/' + auth.user.uuid + '/' + session.get('currentProject')

    let container = docker.getContainer(Env.get('DOCKER_NAME') + auth.user.id)
    let user = await User.find(auth.user.id)
    let project = await user.projects().where({name: session.get('currentProject')}).firstOrFail()

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



    let dockerConfig = shared.dockerConfig(project.docker_image,
                                           path.resolve(projectPath),
                                           Env.get('DOCKER_NAME') + auth.user.id,
                                           project) 

    console.log('Pull docker image: ', project.docker_image)
    await docker.pull(project.docker_image)
      .then(stream => {
      sendToInfoChannel.write(stream)
    })
      .catch(err => {
      console.log('Error pulling image:', err)
      sendToInfoChannel.write('Cant pull image, probobly already excist: ' + project.docker_image)
    })

    console.log('CreateContainer')
    await docker.createContainer(dockerConfig)
      .then(container => {
      return container.start()
    })
      .then(data => {
      return container.inspect()
    })
      .then(data => {
      let displayName = data.Config.Labels.['traefik.http.routers.grunnaide.rule']
      if (displayName) {
        sendToInfoChannel.write('Connect to: http://' + data.name + '.ide.grunna.com -> container 0.0.0.0:8080')
        project.docker_name = data.name
        const portBindings = Object.values(data.NetworkSettings.Ports)
        portBindings.forEach(hosts => {
          hosts.forEach(host => {
            project.docker_port = host.HostPort
            project.save()
          })
        })
      } else {
        sendToInfoChannel.write('Error connecting to host')
      }
    })
      .catch(err => {
      console.log('err: ', err)
      return response.ok('Container already running')
    })
  }
}

module.exports = DockerController
