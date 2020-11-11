import { h, render, Component } from 'preact';
import { html } from 'htm/preact';
import { globals } from './global.js'
import Observable from './Observer.js'

// import {UnControlled as CodeMirror} from 'react-codemirror2'
import CodeMirror from 'codemirror/lib/codemirror.js'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/material.css'

class CodeMirrorView extends Component {

  constructor () {
    super()
    this.state = {
      value: '',
      mirrorInstance: null,
    }
    globals.observers.downloadFile.subscribe((data) => {
      this.setState({ value: data.data})
      this.state.mirrorInstance.setValue(data.data)
      this.setCodeMirrorData(data.filePath)
      console.log('CodeMirrorView', data.filePath)
    })
  }

  shouldComponentUpdate() {
    return false;
  }

  componentDidMount() {
		CodeMirror.modeURL = '/codemirror/mode/%N/%N.js'
    console.log('CodeMirror.modeURL', CodeMirror.modeURL)

    this.setState({ mirrorInstance: CodeMirror.fromTextArea(document.getElementById("codemirroreditor"), {
      lineNumbers : true,
      tabSize: 2,
      gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
      showTrailingSpace: true
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
    console.log('mode', spec, mode, path)
    if (mode) {
      import(`codemirror/mode/${mode}/${mode}.js`).then(() => {
        this.state.mirrorInstance.setOption("mode", spec)
      })
    } else {
      this.state.mirrorInstance.setOption("mode", null)
    }
  }

  render() {
    return html`
<textarea id="codemirroreditor"></textarea>
`
  }
}

export default CodeMirrorView