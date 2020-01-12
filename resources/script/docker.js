"use strict";

let ws = null;
var term;

$(function() {
  startWs();

  /*term = new Terminal();
  term.open(document.getElementById('terminalOutput'));
  */
  $('#terminalInput').keypress(function (event) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == '13') {
      event.preventDefault()

      const message = $(this).val()
      $(this).val('')

      ws.getSubscription('docker:terminal').emit('dockerCommand', {
	message
      })
      return
    }
  })
})

function startWs() {
  console.log('Start Ws');

  ws = adonis.Ws().connect();

  ws.on('open', () => {
    subscribeToOutputChannel();
    subscribeToTerminalChannel();
  })
}

function subscribeToOutputChannel() {
  console.log('SubscribeToDocker')
  const infoChannel = ws.subscribe('docker:infoChannel');
  console.log('infoChannel; ', infoChannel);
  
  infoChannel.on('output', (output) => {
    $('#outputData').append(output)
    console.log('Out: ', output);
  })
}

function subscribeToTerminalChannel() {
  console.log('SubscribeToTerminalChannel')
  const terminalChannel = ws.subscribe('docker:terminal');
  console.log('terminalChannel: ', terminalChannel);

  terminalChannel.on('terminal', (terminal) => {
    console.log('terminal: ', terminal)
    console.log('term: ', term)
    //term.write(terminal)
    $('#terminalOutput').append(terminal)
    $('#terminalOutput').scrollTop($('#terminalOutput').prop('scrollHeight'))
  })
}
