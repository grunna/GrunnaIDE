import { h, render, Component } from 'preact';
import { html } from 'htm/preact';
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import CardColumns from 'react-bootstrap/CardColumns'
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form'
import Navbar from 'react-bootstrap/Navbar'
import Spinner from 'react-bootstrap/Spinner'
import ListGroup from 'react-bootstrap/ListGroup'
import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import 'bootstrap/dist/css/bootstrap.min.css'

class CreateProjectDialog extends Component {
  constructor(props) {
    super(props)
    this.state = { availibleImages: [], selectedImage: 'node:10', projectName: '', gitUrl: '' }
  }
  
  componentDidMount() {
    this.setState({ selectedImage: this.props.type })
    fetch('/api/project/listAllAvailibleImages')
    .then(response => response.json())
    .then(result => {
      this.setState({ availibleImages: result})
    })
  }
  
  onProjectNameChange = (e) => {
    this.setState({ projectName: e.target.value })
  }
  
  onGitUrlChange = (e) => {
    this.setState({ gitUrl: e.target.value })
  }
  
  onImageChange = (e) => {
    this.setState({ selectedImage: e.target.value })
  }
  
  createProject = (e) => {
    e.preventDefault()
    console.log('Project name', this.state.projectName)
    console.log('gitUrl', this.state.gitUrl)
    console.log('image', this.state.selectedImage)
    fetch('/api/project/createProject', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectName: this.state.projectName, gitUrl: this.state.gitUrl, dockerImage: this.state.selectedImage })
    })
    .then(response => response.json())
    .then(result => {
      window.location.href = '/ide?project=' + result.projectId;
    })
  }
  
  closeDialog = () => {
    this.props.callbackShowDialog(false)
  }
  
  render () {
    return html`
      <${Modal} centered show=${this.props.show} onHide=${this.closeDialog}>
        <${Modal.Header} closeButton>
          <${Modal.Title}>Create a new project<//>
        <//>
        <${Form} onSubmit=${this.createProject}>
          <${Modal.Body}>
						<${Form.Group} controlId="createProjectForm.ProjectNameInput">
              <${Form.Label}>Name of the project<//>
              <${Form.Control} type="text" value=${this.state.projectName} onChange=${this.onProjectNameChange} placeholder="Nice project" />
            <//>
						<${Form.Group} controlId="createProjectForm.GitUrlInput">
              <${Form.Label}>Git clone URL if you have any else leave blank<//>
              <${Form.Control} type="text" value=${this.state.gitUrl} onChange=${this.onGitUrlChange} placeholder="https://github.com/grunna/GrunnaIDE.git" />
            <//>
						<${Form.Group} controlId="createProjectForm.DockerImages">
              <${Form.Label}>Example select<//>
              <${Form.Control} as="select" value="${this.state.selectedImage}" onChange=${this.onImageChange}>
								${this.state.availibleImages.map(image => html`
									<option value="${image.name}">${image.description}</option>
          			`)}
              <//>
            <//>
					<//>
          <${Modal.Footer}>
            <${Button} variant="secondary" onClick=${this.closeDialog}>
              Close
            <//>
            <${Button} variant="primary" type="submit">
              Create project
            <//>
          <//>
        <//>
      <//>
`
  }
}

class CurrentProjects extends Component {
  constructor() {
    super();
    this.state = { downloaded: false, allData: [] }
  }
  
  componentDidMount() {
    fetch('/api/project/featchAllProjects')
    .then(response => response.json())
    .then(result => {
      this.setState({ downloaded: true });
      this.setState({ allData: result})
    })
  }

  render() {
    if (this.state.downloaded) {
      return html`
    <${Card}>
      <${Card.Header} as="h5">Current projects<//>
      <${Card.Body}>
        <${ListGroup} variant="flush">
          ${this.state.allData.map(project => html`
          <${ListGroup.Item}><a href="/ide?project=${project.id}">${project.name}</a><//>
          `)}
        <//>
      <//>
    <//>
  `
    } else {
      return html`
    <${Card}>
      <${Card.Header} as="h5">Current projects<//>
      <${Card.Body}>
        <${Spinner} animation="border" />
      <//>
    <//>
  `
    }
  }
}

class Statistics extends Component {
  constructor() {
    super();
    this.state = { downloaded: false, allData: [] }
  }
  
  componentDidMount() {
    fetch('/api/dashboard/summery')
    .then(response => response.json())
    .then(result => {
      this.setState({ downloaded: true });
      this.setState({ allData: result})
    })
  }
  
  render () {
    if (this.state.downloaded) {
      return html`
		<${Card}>
      <${Card.Header} as="h5">Current projects<//>
      <${Card.Body}>
        <${ListGroup} variant="flush">
          <li>${this.state.allData.projects} / ${this.state.allData.maxProjects} Project created</li>
          <li>All your projects take ${(this.state.allData.directorySize / 1024 / 1024).toFixed(2)} MB</li>
          <li>You have saved ${(this.state.allData.statistics.saveTimes ? this.state.allData.statistics.saveTimes : 0)} times</li>
          <li>You have reloaded the tree ${(this.state.allData.statistics.reloadFileTree ? this.state.allData.statistics.reloadFileTree : 0)} times</li>
          <li>${(this.state.allData.statistics.filesDownloaded ? this.state.allData.statistics.filesDownloaded : 0)} files have been downloaded</li>
          <li>You have created ${(this.state.allData.statistics.fileCreated ? this.state.allData.statistics.fileCreated : 0)} files</li>
					<li>You have deleted ${(this.state.allData.statistics.deleteFileDirectory ? this.state.allData.statistics.deleteFileDirectory : 0)} times</li>
        <//>
      <//>
    <//>
`
    } else {
      return html`
    <${Card}>
      <${Card.Header} as="h5">Current projects<//>
      <${Card.Body}>
        <${Spinner} animation="border" />
      <//>
    <//>
`
    }
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = { showCreateProject: false, createProjectType: 'node:10' }
    this.showCreateDialog.bind(this)
  }
  
  createProjectBtn = (type) => {
    this.setState({ createProjectType: type})
    this.setState({ showCreateProject: true})
  }
  
  
  showCreateDialog = (show) => {
    this.setState({ showCreateProject: show})
  }
  
  render() {
    return html`
  <${Container} fluid className="text-center px-0">
    <${Navbar} className="justify-content-end" variant="dark" bg="dark">
			<${Navbar.Brand}>Grunna dashboard<//>
		  <${Navbar.Collapse} className="justify-content-end">
        <${Navbar.Text}>
          <a href="/login/logout">Logout</a>
        <//>
      <//>
	  <//>
  <//>
	<${Container}>
		<h3>
      Create new project
    </h3>
    <${CardColumns}>
      <${Card}>
        <${Card.Body}>
          <${Card.Title} as="h5">Node.JS<//>
          <${Card.Text}>Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine.<//>
          <${Button} variant="primary" onClick="${() => this.createProjectBtn('node:13')}">Create project</Button>
        <//>
      <//>
      <${Card}>
        <${Card.Body}>
          <${Card.Title} as="h5">Java<//>
          <${Card.Text}>Java is a general-purpose, concurrent, object-oriented, class-based, and the runtime environment(JRE) which consists of JVM which is the cornerstone of the Java platform.<//>
          <${Button} variant="primary" onClick="${() => this.createProjectBtn('openjdk:11')}">Create project</Button>
        <//>
      <//>
      <${Card}>
        <${Card.Body}>
          <${Card.Title} as="h5">Python<//>
          <${Card.Text}>Python is a programming language that lets you work quickly and integrate systems more effectively.<//>
          <${Button} variant="primary" onClick="${() => this.createProjectBtn('python:3.8')}">Create project</Button>
        <//>
      <//>
      <${Card}>
        <${Card.Body}>
          <${Card.Title} as="h5">Ruby<//>
          <${Card.Text}>Ruby is a dynamic, open source programming language with a focus on simplicity and productivity. It has an elegant syntax that is natural to read and easy to write.<//>
          <${Button} variant="primary" onClick="${() => this.createProjectBtn('ruby:2.7')}">Create project</Button>
        <//>
      <//>
      <${Card}>
        <${Card.Body}>
          <${Card.Title} as="h5">Golang<//>
          <${Card.Text}>Go is an open source programming language that makes it easy to build simple, reliable, and efficient software.<//>
          <${Button} variant="primary" onClick="${() => this.createProjectBtn('golang:1.13')}">Create project</Button>
        <//>
      <//>
      <${Card}>
        <${Card.Body}>
          <${Card.Title} as="h5">Mono<//>
          <${Card.Text}>Mono is a software platform designed to allow developers to easily create cross platform applications part of the .NET Foundation.<//>
          <${Button} variant="primary" onClick="${() => this.createProjectBtn('mono:6.8')}">Create project</Button>
        <//>
      <//>
    <//>
    <hr/>
	<//>
	<${Container}>
  <${Row}>
    <${Col}>
      <${CurrentProjects} />
    <//>
    <${Col}>
      <${Statistics} />
    <//>
  <//>
  <//>
  <${CreateProjectDialog} show=${this.state.showCreateProject} type=${this.state.createProjectType} callbackShowDialog="${this.showCreateDialog}" />
`
  }
}

render(html`<${App} />`, document.body);