import { h, render, Component } from 'preact';
import { html } from 'htm/preact';
import { globals } from './global.js'
import Observable from './Observer.js'
import sha256 from 'crypto-js/sha256';

import CodeMirror from 'codemirror/lib/codemirror.js'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/meta.js'

import Toast from 'react-bootstrap/Toast'

class CodeMirrorView extends Component {

  constructor () {
    super()
    this.state = {
      value: '',
      mirrorInstance: null,
      currentFilePath: '',
      loadedFileSha: '',
      showSavedFileToaster: false,
      showNoChangeToaster: false,
    }
    globals.observers.downloadFile.subscribe((data) => {
      this.setState({ value: data.data, currentFilePath: data.filePath, loadedFileSha: sha256(data.data).toString() })
      this.state.mirrorInstance.setValue(data.data)
      this.setCodeMirrorData(data.filePath)
    })
    globals.observers.changeTheme.subscribe((data) => {
      import(/* webpackChunkName: "mirrorTheme" */ `codemirror/theme/${data.theme}.css`).then(() => {
      	this.state.mirrorInstance.setOption("theme", data.theme)  
      })
    })
    globals.observers.fileMode.subscribe((data) => {
      this.state.mirrorInstance.setOption("mode", data.modeSpec)
    })
    globals.observers.keyEvents.save.subscribe(() => {
      this.saveFile()
    })
  }
  
  saveFile() {
    let newSha = sha256(this.state.mirrorInstance.getValue()).toString()
    if (this.state.loadedFileSha !== newSha) {
      fetch('/api/file/saveFile', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileName: this.state.currentFilePath, data: this.state.mirrorInstance.getValue() })
      })
      .then(response => {
        if (response.ok) {
          this.setState({showSavedFileToaster: true, loadedFileSha: newSha })
        }
      })
    } else {
      this.setState({showNoChangeToaster: true})
    }
  }

  async componentDidMount() {
    let themeName = 'eclipse'
    await fetch('/api/project/projectSettings?' + new URLSearchParams({projectId: globals.projectId}))
      .then(response => response.json())
      .then(result => {
      if (result.ideTheme) {
        themeName = result.ideTheme
      }
    })
    import(/* webpackChunkName: "mirrorTheme" */ `codemirror/theme/${themeName}.css`)
    this.setState({ mirrorInstance: CodeMirror.fromTextArea(document.getElementById("codemirroreditor"), {
      lineNumbers : true,
      tabSize: 2,
      gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
      showTrailingSpace: true,
      theme: themeName
    })
                  });
  }

  setCodeMirrorData(path) {
    var val = path, m, mode, spec, name;
    if (m = /.+\.([^.]+)$/.exec(val)) {
      var info = CodeMirror.findModeByExtension(m[1]);
    } else {
      m = /([^/]+$)/.exec(val)
      var info = CodeMirror.findModeByFileName(m[1]);
    }
    if (info) {
      name = info.name;
      mode = info.mode;
      spec = info.mime;
    } else {
      mode = spec = null;
    }
    if (mode) {
      import(/* webpackChunkName: "mirrorMode" */ `codemirror/mode/${mode}/${mode}.js`).then(() => {
        globals.observers.fileMode.notify({modeName: name, modeSpec: spec })
      })
    } else {
      globals.observers.fileMode.notify({modeName: 'text', modeSpec: null })
    }
  }

  render() {
    return html`
<textarea id="codemirroreditor"></textarea>
  <${Toast} onClose=${() => this.setState({showSavedFileToaster: false})} show=${this.state.showSavedFileToaster} delay=${2000} autohide style=${{position: 'fixed', bottom: '5px', left: '2%'}}>
    <${Toast.Body}>File have been saved<//>
  <//>
  <${Toast} onClose=${() => this.setState({showNoChangeToaster: false})} show=${this.state.showNoChangeToaster} delay=${3000} autohide style=${{position: 'fixed', bottom: '5px', left: '2%'}}>
    <${Toast.Body}>Nothing new to be saved<//>
  <//>

`
  }
}

export default CodeMirrorView