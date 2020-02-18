"use strict";

$(function () {
   
  globalValues.codemirrorInstance = CodeMirror.fromTextArea(document.getElementById("allMyCode"), {
		lineNumbers : true,
                tabSize: 2
	});

  $(document).keydown(function(event) {
    if (event.ctrlKey && event.keyCode == 83) {
      event.preventDefault()
      //action here
      console.log('filePath', globalValues.loadedFilePath)
      console.log('data text: ', globalValues.codemirrorInstance.getValue())

      $.ajax({
	type: 'POST',
	url: '/api/file/saveFile',
	data: { fileName: globalValues.loadedFilePath, data: globalValues.codemirrorInstance.getValue() },
	success: (data) => {
	  console.log('returnCreate: ', data)
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

