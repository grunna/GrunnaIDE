"use strict";

let ws = null;

$(function() {
  startWs();

  var shellprompt = '$ ';
  
  /*$('#terminal-tab').on('shown.bs.tab', function () {
    let termContainer = document.getElementById('terminal-continer');
    globalValues.xterm = new Terminal({
      cursorBlink: true
    });
    globalValues.xtermFitAddon = new FitAddon();

    globalValues.xterm.open(termContainer);
    globalValues.xterm.loadAddon(globalValues.xtermFitAddon);

    globalValues.xterm.write("~$ ");
    
    var input = "";
    globalValues.xterm.onData(function(data) {
      const code = data.charCodeAt(0);
      if (code == 13) { // CR
        globalValues.xterm.writeln("");
        globalValues.xterm.writeln("You typed: '" + input + "'");
        globalValues.xterm.write("~$ ");
        input = "";
      } else if (code < 32 || code == 127) { // Control
        return;
      } else { // Visible
        globalValues.xterm.write(data);
        input += data;
      }
    })

    //globalValues.xtermFitAddon.fit()
  })*/
  
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
  const infoChannel = ws.subscribe('docker:infoChannel');
  console.log('infoChannel; ', infoChannel);

  infoChannel.on('output', (output) => {
    let addNewData = output + '<br/>' 
    $('#outputData').append(addNewData)
  })
}

function subscribeToTerminalChannel() {
  const terminalChannel = ws.subscribe('docker:terminal');
  console.log('terminalChannel: ', terminalChannel);

  terminalChannel.on('terminal', (terminal) => {
    $('#terminalOutput').append(terminal)
    $('#terminalOutput').scrollTop($('#terminalOutput').prop('scrollHeight'))
  })
}
