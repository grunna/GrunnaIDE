"use strict";

$(function () {

  $('#filetree').fancytree({
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

  $('#create-project-form').on('submit', function (e) {
    // if the validator does not prevent form submit

    if (!e.isDefaultPrevented()) {
      let formData = $(this).serialize()
      $.ajax({
        type: "POST",
        url: "/api/project/createProject",
        data: formData
      }).done((data) => {
        $('#createProjectDialog').modal('hide')
        $('#filetree').fancytree('getTree').reload(createTree(data))
      }).fail((data, textStatus, thrown) => {
        console.log('dataError', data)
        if (data.status === 401) {
          $('#createProjectDialog').modal('hide')
          globalValues.action = 'createNewProject'
          if (globalValues.username) {
            $('#gitUsernameModalInput').val(globalValues.username)
          }
          $('#gitUsernameModal').modal('show')
        }
      })
      return false;
    }
    e.preventDefault()
  });

  $('#gitUsernameModalInput').keypress(function (event) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == '13') {
      $('#gitUsernameModal').modal('hide')
      globalValues.username = $('#gitUsernameModalInput').val()
      $('#createProjectUsername').val($('#gitUsernameModalInput').val())
      globalValues.postData.username = $('#gitUsernameModalInput').val()
      $('#gitPasswordModal').modal('show')
    }
  });

  $('#gitPasswordModalInput').keypress(function (event) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == '13') {
      $('#gitPasswordModal').modal('hide')
      $('#createProjectPassword').val($('#gitPasswordModalInput').val())
      globalValues.postData.password = $('#gitPasswordModalInput').val()
      $('#gitPasswordModalInput').val('')
      switch (globalValues.action) {
        case 'createNewProject':
          $('#create-project-form').submit()
          break;
        case 'gitPull':
          $('#menuGitPull').click()
          break;
        case 'gitPush':
          $('#menuGitPush').click()
          break;
        case 'gitFetch':
          $('#menuGitFetch').click()
          break;
      }
      globalValues.action = ''
    }
  });

  $('#openProjectDialog').on('show.bs.modal', function (event) {

    $.ajax({
      type: "GET",
      url: "/api/project/featchAllProjects",
      success: function (data) {
        $('#openProjectControlSelect').empty()
        data.forEach(project => {
          $('#openProjectControlSelect').append('<option value="' + project.id + '">' + project.name + '</option>')
        })
      }
    })
  })
  
  $('#createProjectDialog').on('show.bs.modal', function (event) {
    $.ajax({
      type: "GET",
      url: "/api/project/listAllAvailibleImages",
      success: function (data) {
        $('#createProjectImageSelect').empty()
        data.forEach(project => {
          $('#createProjectImageSelect').append('<option value="' + project + '">' + project + '</option>')
        })
      }
    })
  })
  
  $('#projectSettingsDialog').on('show.bs.modal', function (event) {
    $.ajax({
      type: "GET",
      url: "/api/project/listAllAvailibleImages",
      success: function (data) {
        $('#projectSettingsImageSelect').empty()
        data.forEach(project => {
          $('#projectSettingsImageSelect').append('<option value="' + project + '">' + project + '</option>')
        })
      }
    })
  })

  $('#open-project-form').on('submit', function (event) {

    let projectIdNumber = $("#openProjectControlSelect").children("option:selected").val()
    $.ajax({
      type: "GET",
      url: "/api/project/getAllFiles",
      data: {
        projectId: projectIdNumber
      },
      success: function (data) {
        $('#openProjectDialog').modal('hide');
        $('#filetree').fancytree('getTree').reload(createTree(data))
        createNewDocker()
      }
    })
    event.preventDefault()
  })

  $('#menuRemoveProject').on('click', function (event) {
    let deleteModal = $('#removeProjectModal')
    deleteModal.modal('show')
  })
  
  $('#removeProjectModalBtn').on('click', function (event) {
		$.ajax({
      type: 'POST',
      url: '/api/project/removeProject',
      success: function (data) {
        updateTree([])
        globalValues.codemirrorInstance.setValue("")
        globalValues.codemirrorInstance.clearHistory();
      }
    })
    $('#removeProjectModal').modal('hide')
  })
  
  $('#unsavedFileContinueModalBtn').on('click', function (event) {
    setCodeMirrorData(globalValues.tempLoadedFile, globalValues.tempLoadedFilePath)
    $('#unsavedFileModal').modal('hide')
  })
  
  $('#project-settings-form').on('submit', function (e) {
    // if the validator does not prevent form submit

    if (!e.isDefaultPrevented()) {
      let formData = $(this).serialize()
      console.log('formData', formData)
      $.ajax({
        type: "POST",
        url: "/api/project/projectSettings",
        data: formData
      }).done((data) => {
        $('#projectSettingsDialog').modal('hide')
        createNewDocker()
      }).fail((data, textStatus, thrown) => {
        console.log('dataError', data)
      })
      return false;
    }
    e.preventDefault()
  });
});

function createNewDocker() {
  $.ajax({
    type: 'POST',
    url: '/api/docker/createDocker',
    data: { },
    success: function (data) {
      console.log('created docker: ', data)
      ws.getSubscription('docker:terminal').emit('dockerAttach', { })
    }
  });
}

function retriveFile(path) {
  console.log('path: ', path)
  $.ajax({
    type: 'POST',
    url: '/api/file/downloadFile',
    data: {
      fileName: path
    },
    success: (data) => {
      if (globalValues.codemirrorInstance.getValue() === globalValues.loadedFile || globalValues.loadedFile === '') {
				setCodeMirrorData(data, path)
      } else {
        globalValues.tempLoadedFile = data
        globalValues.tempLoadedFilePath = path
        $('#unsavedFileModal').modal('show') 
      }
    }
  });
}

function setCodeMirrorData(data, path) {
  var val = path, m, mode, spec;
  if (m = /.+\.([^.]+)$/.exec(val)) {
    var info = CodeMirror.findModeByExtension(m[1]);
    if (info) {
      mode = info.mode;
      spec = info.mime;
    }
  } else if (/\//.test(val)) {
    var info = CodeMirror.findModeByMIME(val);
    if (info) {
      mode = info.mode;
      spec = val;
    }
  } else {
    mode = spec = val;
  }
  if (mode) {
    globalValues.codemirrorInstance.setOption("mode", spec);
    CodeMirror.autoLoadMode(globalValues.codemirrorInstance, mode);
  }
  globalValues.codemirrorInstance.setValue(data)
  globalValues.loadedFile = data
  globalValues.loadedFilePath = path
}

function updateTree(data) {
  $('#filetree').fancytree({
    extensions: ["childcounter"],
    activate: (event, data) => {
      if (!data.node.isFolder()) {
        retriveFile(data.node.key)
      }
    },
    source: createTree(data),
    childcounter: {
      deep: true,
      hideZeros: true,
      hideExpanded: true
    },
  })
}

function createTree(array) {
  let outputArray = []
  if (Array.isArray(array)) {
    array.forEach(a => {
      if (a.children) {
        outputArray.push({
          title: a.name,
          key: a.path,
          folder: true,
          children: createTree(a.children)
        })
      } else {
        outputArray.push({
          title: a.name,
          key: a.path
        })
      }
    })
  } else {
    if (array.children) {
      outputArray.push({
        title: array.name,
        key: array.path,
        folder: true,
        children: createTree(array.children)
      })
    } else {
      outputArray.push({
        title: array.name,
        key: array.path
      })
    }
  }
  return outputArray;
}
