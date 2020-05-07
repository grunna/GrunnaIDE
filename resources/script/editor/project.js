"use strict";

import {globalValues, allThemes} from './global.js'
import {createTree} from './filestructure.js'

export function project() {
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
        globalValues.currentFileTree = data
        globalValues.fancyTree.reload(createTree(data))
        createNewDocker()
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
    $('#IDETheme').empty()
    allThemes.forEach(theme => {
      $('#IDETheme').append('<option value="' + theme + '">' + theme + '</option>')
    })
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
  
  $("#IDETheme").on('change', function(e){
    let test = $('link[href*="' + this.value +'.css"]');
    if (test.length === 0) {
      $('head').append('<link rel="stylesheet" type="text/css" href="/codemirror/theme/' + this.value +'.css">')
    } else {
    }
    globalValues.codemirrorInstance.setOption('theme', this.value)
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
        globalValues.currentFileTree = data
        globalValues.fancyTree.reload(createTree(data))
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
        window.location.href = '/dashboard';
      }
    })
    $('#removeProjectModal').modal('hide')
  })

  $('#unsavedFileContinueModalBtn').on('click', function (event) {
    setCodeMirrorData(globalValues.tempLoadedFile, globalValues.tempLoadedFilePath)
    $('#unsavedFileModal').modal('hide')
  })
}

export function createNewDocker() {
  $.ajax({
    type: 'POST',
    url: '/api/docker/createDocker',
    data: { },
    success: function (data) {
      dockerAttach(5)
    }
  });
}

export function dockerAttach(amontLeft) {
  if (amontLeft > 0) {
    try {
      globalValues.ws.getSubscription('docker:terminal').emit('dockerAttach', { })
    } catch (e) {
      amontLeft--
      setTimeout(() => { dockerAttach(amontLeft) }, 1000)
    }
  } else {
    let addNewData = 'Error when attached to WS terminal' + '<br/>' 
    $('#outputData').append(addNewData)
  }
}

export function setCodeMirrorData(data, path) {
  var val = path, m, mode, spec, name;
  if (m = /.+\.([^.]+)$/.exec(val)) {
    var info = CodeMirror.findModeByExtension(m[1]);
  } else {
    m = /([^/]+$)/.exec(val)
    var info = CodeMirror.findModeByFileName(m[1]);
  }
  if (info) {
    name = info.name;
    mode = info.mode;
    spec = info.mime;
  } else {
    mode = spec = null;
  }

  setCurrentMode(mode, spec, name)

  globalValues.codemirrorInstance.setValue(data)
  globalValues.loadedFile = data
  globalValues.loadedFilePath = path
}

export function setCurrentMode(mode, spec, name) {
  if (mode) {
    globalValues.codemirrorInstance.setOption("mode", spec)
    CodeMirror.autoLoadMode(globalValues.codemirrorInstance, mode)
    $('#footerMode').text(name)
  } else {
    globalValues.codemirrorInstance.setOption("mode", null)
    CodeMirror.autoLoadMode(globalValues.codemirrorInstance, null)
    $('#footerMode').text('text')
  }
}
