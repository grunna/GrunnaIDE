"use strict";

$(function () {

  $('#create-project-form').on('submit', function (e) {
    // if the validator does not prevent form submit

    if (!e.isDefaultPrevented()) {
      $.ajax({
        type: "POST",
        url: "/api/project/createProject",
        data: $(this).serialize()
      }).done((data) => {
        console.log('Data Recived', data)
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
        updateTree(data)
	createNewDocker()
      }
    })
    event.preventDefault()
  })
});

function createNewDocker() {
  $.ajax({
    type: 'POST',
    url: '/api/docker/createDocker',
    data: { },
    success: (data) => {
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
      console.log('newFIle: ', path)
      $('#allMyCode').val(data)
      globalValues.loadedFile = data
      globalValues.loadedFilePath = path
    }
  });
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
