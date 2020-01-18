'use strict'

const Docker = require('dockerode');
const Ws = use('Ws')
const { Writable, Readable } = require('stream');
const dockerChannel = Ws.getChannel('docker:*')
const inStream = new Readable({
  read() {}
});
let docker = new Docker()
   


class WsDockerTerminal extends Writable {
  constructor(options) {
    console.log('new terminal created: ' + options.writeSocket.id)
    super(options)
    this.socket = options.writeSocket
  }
  _write(chunk, encoding, callback) {
    const data = chunk.toString('utf8')
    if (this.socket) {
      try {
	this.socket.emit('terminal', data)
      } catch (err) {
	console.log('WsDockerTerminal error: ', err)
      }
    }
    callback();
  }
}

let sendToTerminal

class DockerController {
  constructor ({ session, socket, request, auth }) {
    this.socket = socket
    this.request = request
    this.session = session
    this.auth = auth
    sendToTerminal = new WsDockerTerminal({ writeSocket: this.socket})
    console.log('user joined with %s socket id, Topic %s', socket.id, socket.topic)
  }

  onClose() {
    let container = docker.getContainer('grunna-' + this.auth.user.id)

    container.stop()
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

  onDockerAttach() {
    
    console.log('attach: grunna-', this.auth.user.id)
    let container = docker.getContainer('grunna-' + this.auth.user.id);

    if (!container) {
      console.log('No container is running')
      return
    }
    
    container.logs({
      stdout: true,
      stderr: true,
      tail: 20
    }, function(err, stream){
      if(err) {
	console.log('error on logs: ', err)
	return
      }
      sendToTerminal.write(stream)      
    });
    
    var attach_opts = {stream: true, stdin: true, stdout: true, stderr: true};
    container.attach(attach_opts, function handler(err, stream) {
      if (err) {
	console.log('Error on attach: ', err)
	return
      }
      inStream.setEncoding('utf8')
      inStream.pipe(stream).pipe(sendToTerminal)
    })
  }

  onDockerCommand(command) {
    console.log('Recived command: ' + command.message)
    console.log('docker ID: ', this.session.get('dId'))
    if (command.message.trim() !== '/quit') {
      console.log('humm', command.message.trim())
      inStream.push(command.message + '\u000D')
    } else {
      console.log('run else')
      inStream.push('\x03')
    }
  }
}

module.exports = DockerController
