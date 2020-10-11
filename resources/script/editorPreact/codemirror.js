import { h, render, Component } from 'preact';
import { html } from 'htm/preact';
import { globals } from './global.js'
import Observable from './Observer.js'

import {UnControlled as CodeMirror} from 'react-codemirror2'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/material.css'
import 'codemirror/mode/xml/xml'
import 'codemirror/mode/javascript/javascript'

class CodeMirrorView extends Component {
  
  constructor () {
    super()
    this.state = {
			value: ''
    }
    globals.observers.downloadFile.subscribe((data) => {
      this.setState({ value: data})
      console.log('CodeMirrorView', data)
    })
  }
  
  render() {
    return html`
			<${CodeMirror}
        value=${this.state.value}
        options=${{
          mode: 'javascript',
          theme: 'material',
          lineNumbers: true,
      		tabSize: 2,
        }}
        onChange=${(editor, data, value) => {
        }}
				className="heightInherit"
      />
`
  }
}

export default CodeMirrorView