import { h, render, Component } from 'preact';
import { html } from 'htm/preact';

import { globals, allThemes } from '../global.js'

import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import NavDropdown from 'react-bootstrap/NavDropdown'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'

class RemoveProjectDialog extends Component {
  constructor(props) {
    super(props)
    this.state = { 

    }
    
  }
  
  closeDialog = () => {
    this.props.callbackShowDialog(false)
  }
  
  removeProject = () => {
    fetch('/api/project/removeProject', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dockerImage: this.state.selectedImage, ideTheme: this.state.ideTheme })
    })
    .then(response => {
      if (response.ok) {
        window.location.href = '/dashboard'
      }
    })
  }
  
  render () {
    return html`
      <${Modal} centered show=${this.props.show} onHide=${this.closeDialog}>
        <${Modal.Header} closeButton>
          <${Modal.Title}>Create a new project<//>
        <//>
				<${Modal.Body}>
          Do you want to remove the project? 
					This can not be reversed.
        <//>
        <${Modal.Footer}>
          <${Button} variant="secondary" onClick=${this.closeDialog}>
            Close
          <//>
					<${Button} variant="danger" onClick=${this.removeProject}>
            Remove
          <//>
        <//>
      <//>
`
  }
}

class ProjectSettingsDialog extends Component {
  constructor(props) {
    super(props)
    this.state = { 
      dockerImages: [],
      selectedImage: 'node:10',
      ideTheme: '3024-day',
    }
  }
  
  loadData = async () => {
    console.log('loadData')
    await fetch('/api/project/listAllAvailibleImages')
      .then(response => response.json())
      .then(result => {
      if (result) {
        this.setState({dockerImages: result})
      }
    })
  }
  
  onChangeTheme = (e) => {
    this.setState({ ideTheme: e.target.value })
    globals.observers.changeTheme.notify({theme: e.target.value })
  }
  
  closeDialog = () => {
    this.props.callbackShowDialog(false)
  }
  
  saveDialog = () => {
    fetch('/api/project/projectSettings', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dockerImage: this.state.selectedImage, ideTheme: this.state.ideTheme })
    })
    .then(response => {
      if (response.ok) {
        this.props.callbackShowDialog(false)
      }
    })
  }

  render () {
    return html`
      <${Modal} centered show=${this.props.show} onShow=${this.loadData} onHide=${this.closeDialog}>
        <${Modal.Header} closeButton>
          <${Modal.Title}>Create a new project<//>
        <//>
				<${Form}>
          <${Modal.Body}>
            <${Form.Group} controlId="projectSettingsForm.DockerImageSelect">
              <${Form.Label}>Docker image:<//>
              <${Form.Control} as="select" value="${this.state.selectedImage}" onChange=${(e) => this.setState({ selectedImage: e.target.value })}>
								${this.state.dockerImages.map(dockerImage => html`
									<option value="${dockerImage.name}">${dockerImage.description}</option>
                `)}
              <//>
            <//>
						<${Form.Group} controlId="projectSettingsForm.IDEThemeSelect">
              <${Form.Label}>IDE Theme:<//>
              <${Form.Control} as="select" value="${this.state.ideTheme}" onChange=${this.onChangeTheme}>
								${allThemes.map(theme => html`
									<option value="${theme}">${theme}</option>
                `)}
              <//>
            <//>
          <//>
          <${Modal.Footer}>
            <${Button} variant="secondary" onClick=${this.closeDialog}>
              Close
            <//>
						<${Button} variant="primary" onClick=${this.saveDialog}>
              Save
            <//>
          <//>
				<//>
      <//>
`
  }
}

class TopMenuView extends Component {
  
  constructor () {
    super()
    this.state = { 
    	showProjectSettings: false,
      showRemoveProject: false,
    }
  }
  
  openProjectSettingsDialog = () => {
    this.setState({showProjectSettings: true})
  }
  
  showProjectSettingsDialog = (show) => {
    this.setState({ showProjectSettings: show})
  }
  
  openRemoveProjectDialog = () => {
    this.setState({ showRemoveProject: true })
  }
  
  showRemoveProjectDialog = (show) => {
    this.setState({ showRemoveProject: show})
  }
  
  render() {
    return html`
	<${Navbar} bg="light" className="py-0">
		<${Nav} className="mr-auto">
			<${NavDropdown} title="File" className="noCaret">
        <${NavDropdown.Item} onClick="${this.openProjectSettingsDialog}">Project settings<//>
        <${NavDropdown.Item} onClick="${this.openRemoveProjectDialog}">Remove project<//>
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
	<${ProjectSettingsDialog} show=${this.state.showProjectSettings} callbackShowDialog="${this.showProjectSettingsDialog}"/>
	<${RemoveProjectDialog} show=${this.state.showRemoveProject} callbackShowDialog="${this.showRemoveProjectDialog}"/>
`
  }
}

export default TopMenuView