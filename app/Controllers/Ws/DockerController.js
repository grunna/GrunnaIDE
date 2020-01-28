'use strict'

const Env = use('Env')
const Docker = require('dockerode');
const Ws = use('Ws')
const { Writable, Readable } = require('stream');
const dockerChannel = Ws.getChannel('docker:*')
const path = use('path')
const inStream = new Readable({
  read() {}
});
const Shared = require('../Http/Shared')
const shared = new Shared()
let docker = new Docker()
let sendToTerminal   


class WsDockerTerminal extends Writable {
  constructor(options) {
    console.log('new terminal created: ' + options.writeSocket.id)
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
  constructor ({ session, socket, request, auth }) {
    this.socket = socket
    this.request = request
    this.session = session
    this.auth = auth
    console.log('user joined with %s socket id, Topic %s', socket.id, socket.topic)
  }

  async onClose() {
    let container = docker.getContainer('grunna-' + this.auth.user.id)

    if (this.socket.topic === 'docker:terminal') {
      await container.stop()
	.then(data => {
	  console.log('onClose: Container have been stoped')
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

  async onDockerAttach() {

    console.log('attach: grunna-', this.auth.user.id)
    let container = docker.getContainer('grunna-' + this.auth.user.id);
    sendToTerminal = new WsDockerTerminal({ writeSocket: this.socket})
    
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
	  inStream.setEncoding('utf8')
	  inStream.pipe(stream).pipe(sendToTerminal)
	} catch (err) {
	  console.log('attach44 error: ', err)
	}
      })
      .catch(err => {
	console.log('Error on attach/log :', err)
	return
      })
  }

  onDockerCommand(command) {
    try {
      console.log('Recived command: ' + command.message)
      console.log('docker ID: ', this.session.get('dId'))
      if (command.message.trim() !== '/quit') {
	console.log('humm', command.message.trim())
	inStream.push(command.message + '\u000D')
      } else {
	console.log('run else')
	inStream.push('\x03')
      }
    } catch (err) {
      console.log('onDockerCommand error: ', err)
    }
  }
}
module.exports = DockerController
