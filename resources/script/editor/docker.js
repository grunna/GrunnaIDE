"use strict";

import {globalValues} from './global.js'
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css'
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';

export function docker() {
  return new Promise((resolve, reject) => {
    var shellprompt = '$ ';

    window.addEventListener("resize", function () {
      document.getElementById('terminal-continer').style.height = "100%";
      if (globalValues.xtermFitAddon) {
        globalValues.xtermFitAddon.fit() 
      }
    });

    $('#terminal-tab').on('shown.bs.tab', function () {
      if (!globalValues.xterm) {
        let termContainer = document.getElementById('terminal-continer');
        globalValues.xterm = new Terminal({
          cursorBlink: true
        });
        globalValues.xtermFitAddon = new FitAddon();
        console.log('xtermFitAddon', globalValues.xtermFitAddon)
        globalValues.xterm.loadAddon(globalValues.xtermFitAddon);
        globalValues.xterm.loadAddon(new WebLinksAddon());
        globalValues.xterm.open(termContainer);

        var input = "";
        globalValues.xterm.onData(function(data) {
          const code = data.charCodeAt(0);
          globalValues.ws.getSubscription('docker').emit('dockerInput', {
            character: data
          })
        })
        document.getElementById('terminal-continer').style.height = "100%";
        globalValues.xtermFitAddon.fit()
        globalValues.xterm.writeln(shellprompt);
      }
    })
    resolve()
  })
}

export function createNewDocker() {
  return new Promise((resolve, reject) => {
    try {
      globalValues.ws.getSubscription('docker').emit('dockerCreate', { })
      resolve()
    } catch (e) {
      console.log('Error create docker', e)
      reject('Error create docker')
    }
  })
}

export function dockerAttach(amountLeft) {
  return new Promise((resolve, reject) => {
    let attachToDocker = (leftToRun) => {
      if (leftToRun > 0) {
        try {
          globalValues.ws.getSubscription('docker').emit('dockerAttach', { })
          resolve()
        } catch (e) {
          leftToRun--
          setTimeout(() => { attachToDocker(leftToRun) }, 1000)
        }
      } else {
        reject('Error when attached to WS terminal<br/>')
      }
    }
    attachToDocker(5)
  })
}
