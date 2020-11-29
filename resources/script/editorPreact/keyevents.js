import { h, render, Component } from 'preact';
import { globals } from './global.js'

class KeyEvents extends Component {
  
  constructor () {
    super()
  }

  componentDidMount(){
    document.addEventListener('keydown',this.keydownHandler);
  }
  componentWillUnmount(){
    document.removeEventListener('keydown',this.keydownHandler);
  }
    
  keydownHandler = (e) => {
    if(e.ctrlKey && e.keyCode===83) {
      globals.observers.keyEvents.save.notify()
      e.preventDefault()
    } 
  }
}

export default KeyEvents