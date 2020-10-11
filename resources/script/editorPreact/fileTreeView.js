import { h, render, Component } from 'preact';
import { html } from 'htm/preact';
import { globals } from './global.js'
import Observable from './Observer.js'

import('jquery.fancytree/dist/skin-lion/ui.fancytree.css');
import {createTree as fancyTreeCreate} from 'jquery.fancytree';
import 'jquery.fancytree/dist/modules/jquery.fancytree.childcounter';

class ReactTreeView extends Component {
  
  constructor () {
    super()
    globals.observers.downloadFile = new Observable()
    this.state = {
      projectId: -1,
      treeData: {},
      fancyTree: null
    }
  }
  
  shouldComponentUpdate() {
    return false;
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
      body: JSON.stringify({ fileName: filePath, hash: 0 /* Need to add hash data */, sharedId: window.location.pathname.startsWith('/shared') ? projectId : null})
    })
    .then(response => response.text())
    .then(result => {
      globals.observers.downloadFile.notify(result)
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
          console.log('Load file', data.node.key)
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
    fetch('/api/project/getAllFiles?' + new URLSearchParams({projectId: this.queryParameter('project'), shared: window.location.pathname.startsWith('/shared')}))
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
			<div id="filetree"></div>
		</div>
`
  }
}

export default ReactTreeView