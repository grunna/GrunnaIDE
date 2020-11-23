import { h, render, Component } from 'preact';
import { html } from 'htm/preact';
import { globals } from './global.js'

class OutputView extends Component {
  
  constructor () {
    super()
    this.state = {
			outputText: `Welcome to Grunna IDE!
On the left you find the tree view with all the files and directories.
On the bottom you have two tabs, one for different outputs and the other (Terminal) is for making commands to your docker container.
If you have any problems and need any help join our https://discord.gg/U4cN8tr
The docker container is linked to port 8080, so you need to expose that to get access to your container data.
`
    }
    globals.observers.output.subscribe((data) => {
      this.setState({ outputText: this.state.outputText + data + '\n'})
    })
    globals.ws.on('open', () => {
      let dockerChannel
      if (!globals.ws.getSubscription('docker')) {
        dockerChannel = globals.ws.subscribe('docker')
      } else {
        dockerChannel = globals.ws.getSubscription('docker')
      }
      dockerChannel.on('output', (output) => { 
        this.setState({ outputText: this.state.outputText + output + '\n'})
      })
    })
  }
  
  render() {
    return html`
		<pre style="height: 100%" class="mb-0">
			${this.state.outputText}
		</pre>
`
  }
}

export default OutputView