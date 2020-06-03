"use strict";

import {globalValues, getQueryParams} from './global.js'
import sha256 from 'crypto-js/sha256';

export function editorCode() {

  CodeMirror.modeURL = "/codemirror/mode/%N/%N.js";
  globalValues.codemirrorInstance = CodeMirror.fromTextArea(document.getElementById("allMyCode"), {
    lineNumbers : true,
    tabSize: 2,
    extraKeys: {"Ctrl-Space": "autocomplete"},
    autoCloseBrackets: true,
    matchBrackets: true,
    autoCloseTags: true,
    foldGutter: true,
    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
    showTrailingSpace: true,
  });

  $.ajax({
    type: "GET",
    url: "/api/project/projectSettings",
    data: {
      projectId: getQueryParams('project', window.location.href)
    },
    success: function (data) {
      if (data.ideTheme) {
        $('head').append('<link rel="stylesheet" type="text/css" href="/codemirror/theme/' + data.ideTheme +'.css">')
        globalValues.codemirrorInstance.setOption('theme', data.ideTheme)
      }
    }
  })


  $(document).keydown(function(event) {
    if (event.ctrlKey && event.keyCode == 83) {
      event.preventDefault()
      saveFile()
    }
  });
}

export function saveFile() {
  if (JSON.parse(window.localStorage.getItem(globalValues.loadedFilePath))?.hash !== sha256(globalValues.codemirrorInstance.getValue()).toString()) {
    $.ajax({
      type: 'POST',
      url: '/api/file/saveFile',
      data: { fileName: globalValues.loadedFilePath, data: globalValues.codemirrorInstance.getValue(), oldHash: JSON.parse(window.localStorage.getItem(globalValues.loadedFilePath))?.hash },
      success: (data) => {
        globalValues.loadedFile = globalValues.codemirrorInstance.getValue()
        window.localStorage.setItem(globalValues.loadedFilePath, JSON.stringify({data: globalValues.loadedFile, hash: sha256(globalValues.loadedFile).toString()}))
      }
    })

    $('<div class="alert alert-success">' +
      '<button type="button" class="close" data-dismiss="alert">' +
      '&times;</button>File have been saved</div>').hide().appendTo('#alerts').fadeIn(1000);

    $(".alert").delay(3000).fadeOut("normal", function(){
      $(this).alert('close')
    })
  } else {
    $('<div class="alert alert-success">' +
      '<button type="button" class="close" data-dismiss="alert">' +
      '&times;</button>Nothing new to save</div>').hide().appendTo('#alerts').fadeIn(1000);

    $(".alert").delay(3000).fadeOut("normal", function(){
      $(this).alert('close')
    })
  }
}

