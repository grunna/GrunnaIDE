import { h, render, Component } from 'preact';
import { html } from 'htm/preact';
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import NavDropdown from 'react-bootstrap/NavDropdown'

class ProjectSettingsDialog extends Component {
  
    render() {
    return html`
	<${Navbar} bg="light" className="py-0">
		<${Nav} className="mr-auto">
			<${NavDropdown} title="File" id="collasible-nav-dropdown">
        <${NavDropdown.Item}>Project settings<//>
        <${NavDropdown.Item}>Remove project<//>
        <${NavDropdown.Item}>Share project<//>
				<${NavDropdown.Divider} />
        <${NavDropdown.Item} href="/dashboard">Close project<//>
        <${NavDropdown.Item} href="/login/logout">Logout<//>
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

class TopMenuView extends Component {
  
  constructor () {
    super()
  }
  
  openProjectSettingsDialog () {
    console.log('test')
  }
  
  render() {
    return html`
	<${Navbar} bg="light" className="py-0">
		<${Nav} className="mr-auto">
			<${NavDropdown} title="File" className="noCaret">
        <${NavDropdown.Item} onClick="${this.openProjectSettingsDialog}">Project settings<//>
        <${NavDropdown.Item}>Remove project<//>
        <${NavDropdown.Item}>Share project<//>
				<${NavDropdown.Divider} />
        <${NavDropdown.Item} href="/dashboard">Close project<//>
        <${NavDropdown.Item} href="/login/logout">Logout<//>
      <//>
      <${NavDropdown} title="Issue" className="noCaret">
        <${NavDropdown.Item}>Create issue<//>
        <${NavDropdown.Item}>List issues<//>
      <//>
    <//>
  <//>
`
  }
}

export default TopMenuView