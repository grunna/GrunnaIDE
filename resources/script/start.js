"use strict";


(function () {
  WsNotice();
  fileMenu();
})()

function WsNotice() {
  let ws = adonis.Ws().connect();
  let error = false;

  ws.on('open', () => {
    $('<div class="alert alert-success">' +
      '<button type="button" class="close" data-dismiss="alert">' +
      '&times;</button>Connected to Ws</div>').hide().appendTo('#alerts').fadeIn(1000);

    $(".alert").delay(3000).fadeOut(
      "normal",
      function(){
        $(this).alert('close')
      });
    error = false;
  })

  ws.on('error', (event) => {
    if (!error) {
      $('<div class="alert alert-error">' +
        '<button type="button" class="close" data-dismiss="alert">' +
        '&times;</button>Error with connection to WS</div>').hide().appendTo('#alerts').fadeIn(1000);

      $(".alert").delay(3000).fadeOut(
        "normal",
        function(){
          $(this).alert('close')
        });
      error = true;
    }
  })
}

function fileMenu() {
  $.contextMenu({
    selector: "#filetree span.fancytree-title",
    items: {
      "createDirectory": {
        name: "Create Directory", icon: "copy", callback: function(key, opt) {
          var node = $.ui.fancytree.getNode(opt.$trigger);
          globalValues.postData = {}
          globalValues.postData.fromDirectory = node.key
          $('#createDirectoryModalInput').val('')
          $('#createDirectoryModal').modal('show')
        }
      },
      "createFile": {
        name: "Create file", icon: "copy", callback: function(key, opt) {
          var node = $.ui.fancytree.getNode(opt.$trigger);
          globalValues.postData = {}
          globalValues.postData.fromDirectory = node.key
          $('#createFileModal').modal('show')
        }
      },
      "delete": {
        name: "Delete", icon: "trash", callback: function(key, opt) {
          var node = $.ui.fancytree.getNode(opt.$trigger);
          globalValues.postData = {}
          globalValues.postData.fileOrDirectory = node.key

          let deleteModal = $('#deleteFileDirectoryModal')
          deleteModal.find('.modal-body').text('Delete: ' + node.key)
          deleteModal.modal('show')
        }
      }
    },
    callback: function(itemKey, opt) {
      var node = $.ui.fancytree.getNode(opt.$trigger);
      alert("select " + itemKey + " on " + node);
    }
  });

  $('#createDirectoryModalInput').keypress(function (event) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == '13') {
      $('#createDirectoryModal').modal('hide')
      globalValues.postData.newDirectory = $('#createDirectoryModalInput').val()
      $.ajax({
        type: 'POST',
        url: '/api/file/createDirectory',
        data: globalValues.postData,
        success: (data) => {
          $('#filetree').fancytree('getTree').reload(createTree(data))
        }
      })
    }
  });

  $('#createFileModalInput').keypress(function (event) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == '13') {
      $('#createFileModal').modal('hide')
      globalValues.postData.newFile = $('#createFileModalInput').val()
      $.ajax({
        type: 'POST',
        url: '/api/file/createFile',
        data: globalValues.postData,
        success: (data) => {
          $('#filetree').fancytree('getTree').reload(createTree(data))
        }
      })
    }
  });

  $('#deleteFileDirectoryModalBtn').on('click', function(e) {
    console.log('delete file: ', globalValues.postData)
    $('#deleteFileDirectoryModal').modal('hide')
    $.ajax({
      type: 'DELETE',
      url: '/api/file/deleteFileDirectory',
      data: globalValues.postData,
      success: (data) => {
        $('#filetree').fancytree('getTree').reload(createTree(data))
      }
    })
  })
}
