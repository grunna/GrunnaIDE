"use strict";

let ws = null;

$(function() {
  startWs();

  var shellprompt = '$ ';
  
  let termContainer = document.getElementById('terminal-continer');
  var term = new Terminal({
    cursorBlink: true
  });
  term.open(termContainer);
  
  term.write("~$ ");
  
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
    let addNewData = output + '<br/>' 
    $('#outputData').append(addNewData)
    console.log('Out add: ', addNewData);
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
