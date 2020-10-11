import { h, render, Component, createRef } from 'preact';
import { html } from 'htm/preact';
import { globals } from './global.js'
import Container from 'react-bootstrap/Container'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import NavDropdown from 'react-bootstrap/NavDropdown'
import SplitPane, { Pane } from 'react-split-pane'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'
import TabContainer from 'react-bootstrap/TabContainer'
import TabContent from 'react-bootstrap/TabContent'
import TabPane from 'react-bootstrap/TabPane'
import TreeView from './fileTreeView.js'
import CodeMirrorView from './codemirror.js'
import OutputView from './output.js'
import XtermView from './xterm.js'
import "regenerator-runtime/runtime.js";
import Ws from '@adonisjs/websocket-client'
import './editor.css'

import 'bootstrap/dist/css/bootstrap.min.css'

/**
	Should render the top menu, there are some static part like close and remove the project.
  Then there are dynamic menus that should be loaded from the server depending what things the user want to see
**/
class TopMenu extends Component {
  
  render() {
    return html`
	<${Navbar} bg="light" className="py-0">
		<${Nav} className="mr-auto">
			<${NavDropdown} title="File" id="collasible-nav-dropdown">
        <${NavDropdown.Item}>Project settings<//>
        <${NavDropdown.Item}>Remove project<//>
        <${NavDropdown.Item}>Share project<//>
				<${NavDropdown.Divider} />
        <${NavDropdown.Item} href="#action/3.2">Close project<//>
        <${NavDropdown.Item} href="#action/3.3">Logout<//>
      <//>
      <${NavDropdown} title="Issue" id="collasible-nav-dropdown">
        <${NavDropdown.Item}>Create issue<//>
        <${NavDropdown.Item}>List issues<//>
      <//>
    <//>
  <//>
`
  }
}

class RightTop extends Component {
    render() {
    return html`
		<div style="overflow: auto; height: 100%">
			<${CodeMirrorView} />
		</div>
`
  }
}

class RightBottom extends Component {
  
  xtermRef = createRef()
  
  updateTerminalSize(size) {
    this.xtermRef.current.updateTerminalSize()
  }
  
    render() {
    return html`
		<div style="height: calc(100% - 42px)">
    <${Tab.Container} id="bottom-container" defaultActiveKey="xterm">
			<div style="height: 100%">
        <${Tab.Content} style="height: 100%">
          <${Tab.Pane} eventKey="xterm" style="height: 100%">
            <${XtermView} ref=${this.xtermRef}/>
          <//>
          <${Tab.Pane} eventKey="output" style="height: 100%">
            <${OutputView} />
          <//>
        <//>
			</div>
      <div style="height: 100%">
				<${Nav} variant="tabs">
          <${Nav.Item}>
            <${Nav.Link} eventKey="output">Output<//>
          <//>
          <${Nav.Item}>
            <${Nav.Link} eventKey="xterm">XTerm<//>
          <//>
        <//>
			</div>
    <//>
    </div>
`
  }
}

class RightSide extends Component {
  
  rightBottomRef = createRef()
  
  render() {
    return html`
		<${SplitPane} 
			defaultSize=${'25%'} 
			primary="second" 
			split="horizontal" 
			pane1ClassName=${'overflowPanel'}
			pane2ClassName=${'blockXterm'}
			onChange=${(size) => this.rightBottomRef.current.updateTerminalSize(size)}>
      <${RightTop} />
			<${RightBottom} ref=${this.rightBottomRef}/>
    <//>
`
  }
}

class LeftSide extends Component {
  
  render() {
    return html`
		<div>
			Something very cool<br/>
			<${TreeView} />
		</div>
`
  }
}

class BasicLayout extends Component {
  
  render() {
    return html`
		<${SplitPane} defaultSize=${'20%'} className="heightInherit" pane1ClassName=${'overflowPanel'}>
      <${LeftSide} />
			<${RightSide} />
    <//>
`
  }
}


class App extends Component {
  constructor () {
    super()
    if (!globals.ws) {
    	globals.ws = Ws().connect()
    }
  }
  
  render() {
    return html`
    <div style="height: 100%">
      <${TopMenu} />
      <${Container} fluid className="px-0" style="height: calc(100% - 40px)">
        <${BasicLayout} />
      <//>
    </div>
`
  }
}

render(html`<${App} />`, document.body);