"use strict";

import {globalValues} from './global.js'
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css'
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';

export function docker() {
  var shellprompt = '$ ';

  window.addEventListener("resize", function () {
    document.getElementById('terminal-continer').style.height = "100%";
    globalValues.xtermFitAddon.fit()    
  });

  $('#terminal-tab').on('shown.bs.tab', function () {
    if (!globalValues.xterm) {
      console.log('test')
      let termContainer = document.getElementById('terminal-continer');
      globalValues.xterm = new Terminal({
        cursorBlink: true
      });
      globalValues.xtermFitAddon = new FitAddon();
      globalValues.xterm.loadAddon(globalValues.xtermFitAddon);
      globalValues.xterm.loadAddon(new WebLinksAddon());
      globalValues.xterm.open(termContainer);

      var input = "";
      globalValues.xterm.onData(function(data) {
        const code = data.charCodeAt(0);
        globalValues.ws.getSubscription('docker:terminal').emit('dockerInput', {
          character: data
        })
      })
      document.getElementById('terminal-continer').style.height = "100%";
      globalValues.xtermFitAddon.fit()
      globalValues.xterm.writeln(shellprompt);
    }
  })
}


