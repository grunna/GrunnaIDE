import { h, render, Component } from 'preact';
import { html } from 'htm/preact';
import { globals } from './global.js'
import Observable from './Observer.js'

import CodeMirror from 'codemirror/lib/codemirror.js'
import 'codemirror/mode/meta.js'

import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'
import DropdownButton from 'react-bootstrap/DropdownButton'
import Dropdown from 'react-bootstrap/Dropdown'

class BottomLayout extends Component {

  constructor () {
    super()
    this.state = {
      mode: 'Mode',
      mirrorInstance: null,
      allModes: [],
    }
    globals.observers.fileMode.subscribe((data) => {
      this.setState({ mode: data.modeName })
    })
  }

  async componentDidMount() {
    this.setState({allModes: CodeMirror.modeInfo.slice().sort((a,b) => {
      const nameA = a.name.toUpperCase();
      const nameB = b.name.toUpperCase();

      let comparison = 0;
      if (nameA > nameB) {
        comparison = 1;
      } else if (nameA < nameB) {
        comparison = -1;
      }
      return comparison;
    })
                  })
  }
  
  changeMode = (mode) => {
    globals.observers.fileMode.notify({modeName: mode.name, modeSpec: mode.mime })
  }

  render() {
    return html`
    <${Navbar} bg="light" className="py-0" fixed="bottom">
      <${Container} fluid>
				<${Dropdown} className="ml-auto" id="codeMode" drop="up" alignRight="true">
					<${Dropdown.Toggle} size="sm">${this.state.mode}<//>
					<${Dropdown.Menu} style="height: 400px;overflow-y: auto;">
            <${Dropdown.Item} eventKey="text">text<//>
            ${this.state.allModes.map(mode => html`
              <${Dropdown.Item} onClick=${() => this.changeMode({mime: mode.mime, name: mode.name})}>${mode.name}<//>
            `)}
					<//>
        <//>
      <//>
    <//>
` 
  }  
}
export default BottomLayout