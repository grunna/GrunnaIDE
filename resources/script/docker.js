"use strict";

let ws = null;

$(function() {
  startWs();

  var shellprompt = '$ ';
  
  window.addEventListener("resize", function () {
    document.getElementById('terminal-continer').style.height = "100%";
    globalValues.xtermFitAddon.fit()    
  });
  
  $('#terminal-tab').on('shown.bs.tab', function () {
    let termContainer = document.getElementById('terminal-continer');
    globalValues.xterm = new Terminal({
      cursorBlink: true
    });
    globalValues.xterm.open(termContainer);
    globalValues.xtermFitAddon = new FitAddon();
 
    globalValues.xterm.loadAddon(globalValues.xtermFitAddon);

    globalValues.xterm.write("~$ ");
    
    var input = "";
    globalValues.xterm.onData(function(data) {
      const code = data.charCodeAt(0);
      if (code == 13) { // CR
        ws.getSubscription('docker:terminal').emit('dockerCommand', {
          message
        })
      } else if (code < 32 || code == 127) { // Control
        return;
      } else { // Visible
        globalValues.xterm.write(data);
        input += data;
      }
    })
		document.getElementById('terminal-continer').style.height = "100%";
    globalValues.xtermFitAddon.fit()
  })
  
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
    globalValues.xterm.writeln(terminal);
    $('#terminalOutput').append(terminal)
    $('#terminalOutput').scrollTop($('#terminalOutput').prop('scrollHeight'))
  })
}
