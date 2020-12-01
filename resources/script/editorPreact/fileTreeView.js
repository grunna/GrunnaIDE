import { h, render, Component, createRef } from 'preact';
import { html } from 'htm/preact';
import { globals } from './global.js'
import Observable from './Observer.js'

import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'

import('jquery.fancytree/dist/skin-lion/ui.fancytree.css');
import {createTree as fancyTreeCreate} from 'jquery.fancytree';
import 'jquery.fancytree/dist/modules/jquery.fancytree.childcounter';

import 'jquery-contextmenu/dist/jquery.contextMenu.min.js'
import 'jquery-contextmenu/dist/jquery.contextMenu.min.css'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRedo } from '@fortawesome/free-solid-svg-icons'

class CreateDirectoryDialog extends Component {
  constructor (props) {
    super(props)
    this.state = {
      directoryName: ''
    }
    this.directoryName = createRef();
  }
  
  setup = () => {
    this.setState({directoryName: ''})
    this.directoryName.current.focus();
  }
  
  closeDialog = () => {
    this.props.callbackShowDialog(false)
  }
  
  createDirectory = () => {
    fetch('/api/file/createDirectory', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fromDirectory: this.props.directory, newDirectory: this.state.directoryName })
    })
    .then(response => {
      if (response.ok) {
        this.props.callbackShowDialog(false, true)
      }
    })
  }
  
  render() {
    return html`
		<${Modal} centered show="${this.props.show}" onShow=${this.setup} onHide=${this.closeDialog}>
        <${Modal.Header} closeButton>
          <${Modal.Title}>Create directory<//>
        <//>
				<${Modal.Body}>
					<${Form.Group} controlId="createNewDirectory">
          <${Form.Label}>Directory name:<//>
          <${Form.Control} ref=${this.directoryName} onChange=${e => this.setState({ directoryName: e.target.value })} type="text" placeholder="Directoryname" />
        <//>
        <${Modal.Footer}>
          <${Button} variant="secondary" onClick=${this.closeDialog}>
            Close
          <//>
					<${Button} variant="primary" onClick=${this.createDirectory}>
            Create directory
          <//>
        <//>
      <//>
		<//>
`
  }
}

class CreateFileDialog extends Component {
  constructor (props) {
    super(props)
    this.state = {
      filename: ''
    }
    this.filename = createRef();
  }
  
  setup = () => {
    this.setState({filename: ''})
    this.filename.current.focus();
  }
  
  closeDialog = () => {
    this.props.callbackShowDialog(false)
  }
  
  createFile = () => {
    fetch('/api/file/createFile', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fromDirectory: this.props.directory, newFile: this.state.filename })
    })
    .then(response => {
      if (response.ok) {
        this.props.callbackShowDialog(false, true)
      }
    })
  }
  
  render() {
    return html`
		<${Modal} centered show="${this.props.show}" onShow=${this.setup} onHide=${this.closeDialog}>
        <${Modal.Header} closeButton>
          <${Modal.Title}>Create file<//>
        <//>
				<${Modal.Body}>
					<${Form.Group} controlId="createNewFilename">
          <${Form.Label}>Filename:<//>
          <${Form.Control} ref=${this.filename} onChange=${e => this.setState({ filename: e.target.value })} type="text" placeholder="Filename" />
        <//>
        <${Modal.Footer}>
          <${Button} variant="secondary" onClick=${this.closeDialog}>
            Close
          <//>
					<${Button} variant="primary" onClick=${this.createFile}>
            Create
          <//>
        <//>
      <//>
		<//>
`
  }
}

class RenameDialog extends Component {
  constructor (props) {
    super(props)
    this.state = {
      name: ''
    }
    this.nameRef = createRef();
  }
  
  setup = () => {
    this.setState({name: this.props.directory})
    this.nameRef.current.focus();
  }
  
  closeDialog = () => {
    this.props.callbackShowDialog(false)
  }
  
  createFile = () => {
    fetch('/api/file/rename', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fromDirectory: this.props.directory, newName: this.state.name })
    })
    .then(response => {
      if (response.ok) {
        this.props.callbackShowDialog(false, true)
      }
    })
  }
  
  render() {
    return html`
		<${Modal} centered show="${this.props.show}" onShow=${this.setup} onHide=${this.closeDialog}>
        <${Modal.Header} closeButton>
          <${Modal.Title}>Rename / Move<//>
        <//>
				<${Modal.Body}>
					<${Form.Group} controlId="createNewFilename">
          <${Form.Label}>New name:<//>
          <${Form.Control} ref=${this.nameRef} value=${this.state.name} onChange=${e => this.setState({ name: e.target.value })} type="text" />
        <//>
        <${Modal.Footer}>
          <${Button} variant="secondary" onClick=${this.closeDialog}>
            Close
          <//>
					<${Button} variant="primary" onClick=${this.createFile}>
            Rename
          <//>
        <//>
      <//>
		<//>
`
  }
}

class UploadDialog extends Component {
  constructor (props) {
    super(props)
    this.state = {
      selectedFile: null
    }
  }
  
  closeDialog = (reload = false) => {
    this.props.callbackShowDialog(false, reload)
  }
  
  onChangeHandler = (event) => {
    this.setState({ selectedFile: event.target.files})
  }
  
  uploadItem = () => {
    const formData = new FormData()
    formData.append('uploadFilePath', this.props.directory)
    for (let i = 0; i < this.state.selectedFile.length; i++) {
      formData.append('files[]', this.state.selectedFile[i])
    }
    fetch('/api/file/upload', {
      method: 'POST',
      headers: {},
      body: formData,
    })
      .then(response => {
      if (response.status === 200) {
        return response.json()
      }
    })
      .then(result => {
      this.closeDialog(true)
    })
      .catch(error => {
      console.error('Error:', error);
    })
  }
  
  render() {
    return html`
		<${Modal} centered show="${this.props.show}" onHide=${this.closeDialog}>
      <${Modal.Header} closeButton>
        <${Modal.Title}>Upload files<//>
      <//>
			<${Modal.Body}>
				<${Form.File} id="filesToUpload" multiple label="Files to upload" onChange=${this.onChangeHandler}/>
      <//>
      <${Modal.Footer}>
        <${Button} variant="secondary" onClick=${this.closeDialog}>
          Close
        <//>
				<${Button} variant="primary" onClick=${this.uploadItem}>
          Upload
        <//>
      <//>
		<//>
`
  }
}

class DeleteDialog extends Component {
  constructor (props) {
    super(props)
  }
  
  closeDialog = () => {
    this.props.callbackShowDialog(false)
  }
  
  deleteItem = () => {
    fetch('/api/file/deleteFileDirectory', {
      method: 'delete',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileOrDirectory: this.props.directoryOrFile })
    })
    .then(response => {
      if (response.ok) {
        this.props.callbackShowDialog(false, true)
      }
    })
  }
  
  render() {
    return html`
		<${Modal} centered show="${this.props.show}" onHide=${this.closeDialog}>
      <${Modal.Header} closeButton>
        <${Modal.Title}>Delete<//>
      <//>
			<${Modal.Body}>
				Do you want to delete ${this.props.directoryOrFile}? 
      <//>
      <${Modal.Footer}>
        <${Button} variant="secondary" onClick=${this.closeDialog}>
          Close
        <//>
				<${Button} variant="danger" onClick=${this.deleteItem}>
          Delete
        <//>
      <//>
		<//>
`
  }
}


class ReactTreeView extends Component {
  
  constructor () {
    super()
    globals.observers.downloadFile = new Observable()
    this.state = {
      projectId: -1,
      treeData: {},
      fancyTree: null,
      showCreateDirectory: false,
      showCreateFile: false,
      showRenameDialog: false,
      showDeleteDialog: false,
      showUploadDialog: false,
      directory: '',
    }
  }
  
  queryParameter(params) {
    let href = window.location.href;
    //this expression is to get the query strings
    let reg = new RegExp( '[?&]' + params + '=([^&#]*)', 'i' );
    let queryString = reg.exec(href);
    return queryString ? queryString[1] : null;
  }
  
  retriveFile(filePath) {
    fetch('/api/file/downloadFile', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileName: filePath, hash: 0 /* Need to add hash data */, sharedId: globals.shared ? globals.projectId : null})
    })
    .then(response => response.text())
    .then(result => {
      globals.observers.downloadFile.notify({filePath: filePath, data: result})
    })
  }

  componentDidMount() {
    this.setState({ projectId: parseInt(this.queryParameter('project'))})
    this.setState({fancyTree: fancyTreeCreate('#filetree', {
      minExpandLevel: 2,
      autoScroll: true,
      clickFolderMode: 3,
      extensions: ["childcounter"],
      activate: (event, data) => {
        if (!data.node.isFolder()) {
          this.retriveFile(data.node.key)
        }
      },
      source: [],
      childcounter: {
        deep: true,
        hideZeros: true,
        hideExpanded: true
      },
    })})
    $.contextMenu({
      selector: "#filetree span.fancytree-title",
      zIndex: 1000,
      items: {
        "createDirectory": {
          name: "Create Directory", icon: "copy", callback: (key, opt) => {
            var node = $.ui.fancytree.getNode(opt.$trigger);
            this.setState({ showCreateDirectory: true, directory: node.folder ? node.key : node.parent.key })
          }
        },
        "createFile": {
          name: "Create file", icon: "copy", callback: (key, opt) => {
            var node = $.ui.fancytree.getNode(opt.$trigger)
            this.setState({ showCreateFile: true, directory: node.folder ? node.key : node.parent.key })
          }
        },
        "upload": {
          name: "Upload", icon: "copy", callback: (key, opt) => {
            var node = $.ui.fancytree.getNode(opt.$trigger)
            this.setState({ showUploadDialog: true, directory: node.key })
          }
        },
        "rename": {
          name: "Rename", icon: "copy", callback: (key, opt) => {
            var node = $.ui.fancytree.getNode(opt.$trigger)
            this.setState({ showRenameDialog: true, directory: node.key })
          }
        },
        "delete": {
          name: "Delete", icon: "trash", callback: (key, opt) => {
            var node = $.ui.fancytree.getNode(opt.$trigger);
            this.setState({ showDeleteDialog: true, directory: node.key })
          }
        }
      }
    });
    
    this.reloadFileTree()
  }

  reloadFileTree = () => {
    fetch('/api/project/getAllFiles?' + new URLSearchParams({projectId: globals.projectId, shared: globals.shared}))
      .then(response => response.json())
      .then(result => {
      let printArray = function(array) {
        let outputArray = []
        if (Array.isArray(array)) {
          array.forEach(a => {
            if (a.children) {
              outputArray.push({
                title: a.name,
                key: a.path,
                folder: true,
                children: printArray(a.children)
              })
            } else {
              outputArray.push({
                title: a.name,
                key: a.path
              })
            }
          })
        } else {
          if (array.children) {
            outputArray.push({
              title: array.name,
              key: array.path,
              folder: true,
              children: printArray(array.children)
            })
          } else {
            outputArray.push({
              title: array.name,
              key: array.path
            })
          }
        }
        return outputArray
      }
      let testing = printArray(result)
      this.setState({ treeData: testing})
      this.state.fancyTree.reload(testing)
    })
  }
  
  render() {
    return html`
		<div>
			Folder <${FontAwesomeIcon} icon=${faRedo} onClick=${this.reloadFileTree}/>
			<div id="filetree"></div>
		</div>
		<${CreateDirectoryDialog} show=${this.state.showCreateDirectory} directory=${this.state.directory} callbackShowDialog="${(show, reload) => {this.setState({showCreateDirectory: show}); if (reload) this.reloadFileTree()}}"/>
		<${CreateFileDialog} show=${this.state.showCreateFile} directory=${this.state.directory} callbackShowDialog="${(show, reload) => {this.setState({showCreateFile: show}); if (reload) this.reloadFileTree()}}"/>
		<${RenameDialog} show=${this.state.showRenameDialog} directory=${this.state.directory} callbackShowDialog="${(show, reload) => {this.setState({showRenameDialog: show}); if (reload) this.reloadFileTree()}}"/>
		<${UploadDialog} show=${this.state.showUploadDialog} directory=${this.state.directory} callbackShowDialog="${(show, reload) => {this.setState({showUploadDialog: show}); if (reload) this.reloadFileTree()}}"/>
		<${DeleteDialog} show=${this.state.showDeleteDialog} directoryOrFile=${this.state.directory} callbackShowDialog="${(show, reload) => {this.setState({showDeleteDialog: show}); if (reload) this.reloadFileTree()}}"/>
`
  }
}

export default ReactTreeView