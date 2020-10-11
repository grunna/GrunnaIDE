'use strict'
import Observable from './Observer.js'

export var globals = {
  observers: {
    downloadFile: new Observable(),
  	output: new Observable(),
  },
  ws: null
}