"use strict";

$(function () {
  $(document).keydown(function(event) {
    if (event.ctrlKey && event.keyCode == 83) {
      event.preventDefault()
      //action here
      console.log('filePath', globalValues.loadedFilePath)
      console.log('data text: ', $('#allMyCode').text())
      console.log('data html: ', $('#allMyCode').value)

      $.ajax({
	type: 'POST',
	url: '/api/file/saveFile',
	data: { fileName: globalValues.loadedFilePath, data: $('#allMyCode').val() },
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

