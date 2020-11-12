'use strict'
import Observable from './Observer.js'

export var globals = {
  projectId: -1,
  observers: {
    downloadFile: new Observable(),
  	output: new Observable(),
    changeTheme: new Observable(),
  },
  ws: null
}