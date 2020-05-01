"use strict";

let ws = null;

(function () {
  startWs();
  WsNotice();
  initFancyTree();
  fileMenu();
  openProject();
})()

function startWs() {
  console.log('Start Ws');

  ws = adonis.Ws().connect();

  ws.on('open', () => {
    subscribeToOutputChannel();
    subscribeToTerminalChannel();
  }) 
}

function subscribeToOutputChannel() {
  const infoChannel = ws.subscribe('docker:infoChannel');
  console.log('infoChannel; ', infoChannel);

  infoChannel.on('output', (output) => {
    let addNewData = output + '<br/>' 
    $('#outputData').append(addNewData)
  })
}

function subscribeToTerminalChannel() {
  const terminalChannel = ws.subscribe('docker:terminal');
  console.log('terminalChannel: ', terminalChannel);

  terminalChannel.on('terminal', (terminal) => {
    if (globalValues.xterm) {
      globalValues.xterm.write(terminal);
    }
    $('#terminalOutput').append(terminal)
    $('#terminalOutput').scrollTop($('#terminalOutput').prop('scrollHeight'))
  })
}

function initFancyTree () {
  $('#filetree').fancytree({
    minExpandLevel: 2,
    autoScroll: true,
    clickFolderMode: 3,
    extensions: ["childcounter"],
    activate: (event, data) => {
      if (!data.node.isFolder()) {
        retriveFile(data.node.key)
      }
    },
    source: [],
    childcounter: {
      deep: true,
      hideZeros: true,
      hideExpanded: true
    },
  })
}

function openProject() {
  
  
  const projectId = getQueryParams('project', window.location.href)
  
  /*$.ajax({
    type: "GET",
    url: "/api/project/projectSettings",
    data: {
      projectId: projectId
    },
    success: function (data) {
      console.log('data', data)
    }
  })*/
  
  $.ajax({
    type: "GET",
    url: "/api/project/getAllFiles",
    data: {
      projectId: projectId
    },
    success: function (data) {
      $('#openProjectDialog').modal('hide');
      globalValues.currentFileTree = data
      $('#filetree').fancytree('getTree').reload(createTree(data))
      createNewDocker()
    }
  })
}

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
    zIndex: 1000,
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
      "rename": {
        name: "Rename", icon: "copy", callback: function(key, opt) {
          var node = $.ui.fancytree.getNode(opt.$trigger)
          globalValues.postData = {}
          globalValues.postData.fromDirectory = node.key
          $('#renameModalInput').val(node.key)
          $('#renameModal').modal('show')
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
  
  $('#renameModalInput').keypress(function (event) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == '13') {
      $('#renameModal').modal('hide')
      globalValues.postData.newName = $('#renameModalInput').val()
      $.ajax({
        type: 'POST',
        url: '/api/file/rename',
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
