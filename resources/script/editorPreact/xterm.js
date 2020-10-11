import { h, render, Component, createRef } from 'preact';
import { html } from 'htm/preact';
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css'
import { FitAddon } from 'xterm-addon-fit';
import { globals } from './global.js'

class XtermView extends Component {

  constructor () {
    super()
    this.state = {
      xterm: null,
      xtermFitAddon: null
    }
    globals.ws.on('open', () => {
      let dockerChannel
      if (!globals.ws.getSubscription('docker')) {
        dockerChannel = globals.ws.subscribe('docker')
      } else {
        dockerChannel = globals.ws.getSubscription('docker')
      }
      dockerChannel.on('terminal', (output) => { 
        this.state.xterm.write(output);
      })

      dockerChannel.on('dockerCommand' , (data) => {
        if (data === 'dockerAttach') {
          this.dockerAttach(5)
        }
      })
      globals.ws.getSubscription('docker').emit('dockerCreate', { })
    })
  }
  
  dockerAttach(amount) {
    let attachToDocker = (leftToRun) => {
      if (leftToRun > 0) {
        try {
          globals.ws.getSubscription('docker').emit('dockerAttach', { })
        } catch (e) {
          leftToRun--
          setTimeout(() => { attachToDocker(leftToRun) }, 1000)
        }
      }
    }
    attachToDocker(amount)
  }

  componentDidMount() {
    const shellprompt = '$ ';
    if (!this.state.xterm) {
      let termContainer = document.getElementById('terminal-continer');
      this.state.xterm = new Terminal({
        cursorBlink: true
      });
      this.state.xtermFitAddon = new FitAddon();
      this.state.xterm.loadAddon(this.state.xtermFitAddon);
      this.state.xterm.open(termContainer);
      this.state.xterm.onData((data) => {
        const code = data.charCodeAt(0);
        globals.ws.getSubscription('docker').emit('dockerInput', {
          character: data
        })
      })
      document.getElementById('terminal-continer').style.height = "100%";
      this.state.xtermFitAddon.fit()
      this.state.xterm.writeln(shellprompt);
    }
  }
  
  updateTerminalSize() {
    this.state.xtermFitAddon.fit()
  }

  render() {
    return html`
	<div id="terminal-continer" style="height: 100%"/>
`
  }
}

export default XtermView