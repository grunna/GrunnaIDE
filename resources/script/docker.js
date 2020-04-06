"use strict";

$(function() {
  var shellprompt = '$ ';

  window.addEventListener("resize", function () {
    document.getElementById('terminal-continer').style.height = "100%";
    globalValues.xtermFitAddon.fit()    
  });

  $('#terminal-tab').on('shown.bs.tab', function () {
    if (!globalValues.xterm) {
      let termContainer = document.getElementById('terminal-continer');
      globalValues.xterm = new Terminal({
        cursorBlink: true
      });
      globalValues.xterm.open(termContainer);
      globalValues.xtermFitAddon = new FitAddon();
      globalValues.xterm.loadAddon(globalValues.xtermFitAddon);

      var input = "";
      globalValues.xterm.onData(function(data) {
        const code = data.charCodeAt(0);
        ws.getSubscription('docker:terminal').emit('dockerInput', {
          character: data
        })
      })
      document.getElementById('terminal-continer').style.height = "100%";
      globalValues.xtermFitAddon.fit()
      globalValues.xterm.writeln(shellprompt);
    }
  })

})


