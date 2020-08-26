import { h, render, Component } from 'preact';
import { html } from 'htm/preact';

class App extends Component {
	
  // Initialise our state. For now we only store the input value
  state = { value: '' }

  onInput = ev => {
    // This will schedule a state update. Once updated the component
    // will automatically re-render itself.
    this.setState({ value: ev.target.value });
  }
  
  // Add a submit handler that updates the `name` with the latest input value
  onSubmit = ev => {
    // Prevent default browser behavior (aka don't submit the form here)
    ev.preventDefault();

    this.setState({ name: this.state.value });
  }
  
  render() {
    return html`<div>
<h1>Hello, ${this.state.name}!</h1>
<form onSubmit=${this.onSubmit}>
<input type="text" value=${this.state.value} onInput=${this.onInput} />
<button type="submit">Update</button>
</form>
</div>`
  }
}

render(html`<${App} />`, document.body);