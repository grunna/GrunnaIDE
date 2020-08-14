'use strict'

const Env = use('Env')
const Project = use('App/Models/Project')
const User = use('App/Models/User')
const Docker = require('dockerode');
const Ws = use('Ws')
const { Writable, Readable } = require('stream');
const dockerChannel = Ws.getChannel('docker')
const path = use('path')
const Shared = require('../Http/Shared')
const shared = new Shared()
let docker = new Docker()
let sendToTerminal   


class WsDockerTerminal extends Writable {
  constructor(options) {
    super(options)
    this.socket = options.writeSocket
  }
  _write(chunk, encoding, callback) {
    try {
      const data = chunk.toString('utf8')
      this.socket.emit('terminal', data)
    } catch (err) {
      console.log('WsDockerTerminal error: ', err)
    }
    callback()
  }
}



class DockerController {
  constructor ({ socket, request, auth, session }) {
    this.socket = socket
    this.request = request
    this.auth = auth
    this.session = session
    this.inStream = new Readable({
      read() {}
    });
    sendToTerminal = new WsDockerTerminal({ writeSocket: socket})
    console.log('user joined with %s socket id, Topic %s', socket.id, socket.topic)
  }

  async onClose() {
    let container = docker.getContainer(Env.get('DOCKER_NAME') + this.auth.user.id)
    let project = await Project.query().where({name: session.get('currentProject'), user_id: auth.user.id}).firstOrFail()

    if (this.socket.topic === 'docker') {
      await container.stop()
        .then(data => {
        return container.remove()
      })
        .then(data => {
        console.log('onClose: Container have been removed')
      })
        .catch(err => {
        console.log('onClose: Container error -> ' + err)
      })
    }
  }

  async onDockerCreate() {
    const projectPath = Env.get('SAVEDIRECTORY') + '/' + this.auth.user.uuid + '/' + this.session.get('currentProject')

    let container = docker.getContainer(Env.get('DOCKER_NAME') + this.auth.user.id)
    let user = await User.find(this.auth.user.id)
    let project = await user.projects().where({name: this.session.get('currentProject')}).firstOrFail()
    let dockerIsRunning = false

    await container.inspect()
      .then(data => {
      if (data.State.Status === 'running') {
        dockerIsRunning = true
      }
    })
<<<<<<< HEAD
      .catch(err => {
      console.log('Container inspection error', err)
    })

=======
    .catch(err => {
      console.log('Container inspection error', err)
    })
    
>>>>>>> a8fa8ce7ec249fbdc88a1dad71e6366257d7e187
    if (!dockerIsRunning) {
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

      console.log('create dockername')
      let docker_name = null
      if (project.keep_docker_name) {
        if (project.docker_name === null) {
          project.docker_name = shared.makeRandomString(5) + "-" + shared.makeRandomString(5)
          await project.save()
        }
      } else {
        project.docker_name = shared.makeRandomString(5) + "-" + shared.makeRandomString(5)
      }

      console.log('dockername', project.docker_name)
      let dockerConfig = shared.dockerConfig(project.docker_image,
                                             path.resolve(projectPath),
                                             Env.get('DOCKER_NAME') + this.auth.user.id,
                                             project.docker_name) 

      console.log('Pull docker image: ', project.docker_image)
      await docker.pull(project.docker_image)
        .then(stream => {
        // sendToTerminal.write(stream) fixme
      })
        .catch(err => {
        console.log('Error pulling image:', err)
        this.socket.emit('output', 'Cant pull image, probobly already excist: ' + project.docker_image)
      })

      let network = docker.getNetwork('traefik')

      console.log('CreateContainer')
      await docker.createContainer(dockerConfig)
        .then(c => {
        container = c
        return network.connect({Container: c.id});
      })
        .then(data => {
        console.log('data1', data)
        return container.start()
      })
        .then(data => {
        this.socket.emit('output', 'Connect to: <a href="http://' + project.docker_name + '.ide.grunna.com" target="_blank">' + project.docker_name + '.ide.grunna.com</a> -> container 0.0.0.0:8080')
      })
        .catch(err => {
        console.log('err: ', err)
      })
    } else {
      this.socket.emit('output', 'Already running, connect to: <a href="http://' + project.docker_name + '.ide.grunna.com" target="_blank">' + project.docker_name + '.ide.grunna.com</a> -> container 0.0.0.0:8080')
    }
    this.socket.emit('dockerCommand', 'dockerAttach')
  }

  async onDockerAttach() {
    console.log('attach: ' + Env.get('DOCKER_NAME'), this.auth.user.id)
    let container = docker.getContainer(Env.get('DOCKER_NAME') + this.auth.user.id);

    await container.logs({
      stdout: true,
      stderr: true,
      tail: 20
    })
      .then(stream => {
      try {
        sendToTerminal.write(stream)
      } catch (err) {
        console.log('logs33 error: ', err)
      }
    })
      .catch(err => {
      console.log('Attach error: ', err)
      return
    })

    var attach_opts = {stream: true, stdin: true, stdout: true, stderr: true};
    await container.attach(attach_opts)
      .then(stream => {
      try {
        this.inStream.setEncoding('utf8')
        this.inStream.pipe(stream).pipe(sendToTerminal)
      } catch (err) {
        console.log('attach44 error: ', err)
      }
    })
      .catch(err => {
      console.log('Error on attach/log :', err)
      return
    })
  }

  onDockerInput(char) {
    try {
      if (sendToTerminal) {
        this.inStream.push(char.character)
      }
    } catch (err) {
      console.log('onDockerInput error: ', err)
    }
  }
}
module.exports = DockerController
