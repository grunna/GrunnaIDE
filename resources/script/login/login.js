import { h, render, Component } from 'preact';
import { html } from 'htm/preact';
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import Container from 'react-bootstrap/Container'
import Jumbotron from 'react-bootstrap/Jumbotron'

import 'bootstrap/dist/css/bootstrap.min.css'

class App extends Component {
  render() {
    return html`
  <${Container} fluid className="text-center px-0">
    <${Jumbotron} fluid> 
      <h1 class="display-4">Grunna IDE</h1>
      <p class="lead">Welcome to try out Grunna Web IDE. It is totaly free and open source.</p>
      <p class="lead">Check code and issues <a href="https://gitlab.com/grunna/grunnaide" target="_blank">here</a> and join Discord <a href="https://discord.gg/U4cN8tr" target="_blank">here</a></p>
    <//>
    <${Card} className="mx-auto" style="width: 25rem">
      <${Card.Header}><h5 class="card-title mb-0">Login</h5><//>
      <${Card.Body}>
        <p class="card-text">At this first version we only support login via a GitHub account</p>
        <a href="/login/loginDev">
          Login with GitHub
        </a>
      <//>
    <//>
  <//>
`
  }
}

render(html`<${App} />`, document.body);