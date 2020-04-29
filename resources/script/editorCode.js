"use strict";

$(function () {

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
      $('head').append('<link rel="stylesheet" type="text/css" href="/codemirror/theme/' + data.ideTheme +'.css">')
      globalValues.codemirrorInstance.setOption('theme', data.ideTheme)
    }
  })
  

  $(document).keydown(function(event) {
    if (event.ctrlKey && event.keyCode == 83) {
      event.preventDefault()
      //action here
      
      $.ajax({
        type: 'POST',
        url: '/api/file/saveFile',
        data: { fileName: globalValues.loadedFilePath, data: globalValues.codemirrorInstance.getValue() },
        success: (data) => {
          globalValues.loadedFile = globalValues.codemirrorInstance.getValue()
        }
      })

      $('<div class="alert alert-success">' +
        '<button type="button" class="close" data-dismiss="alert">' +
        '&times;</button>File have been saved</div>').hide().appendTo('#alerts').fadeIn(1000);

      $(".alert").delay(3000).fadeOut("normal", function(){
        $(this).alert('close')
      })
    }
  });

});

