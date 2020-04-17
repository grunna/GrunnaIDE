"use strict";

(function () {
  
  let globalValues = {}
  
  $.ajax({
    type: "GET",
    url: "/api/dashboard/summery",
    success: function (data) {
      $('#currentProjectsFooter').text(data.projects + ' / ' + data.maxProjects + ' Project created')
      $('#directorySize').text('All your projects take ' + (data.directorySize / 1024 / 1024).toFixed(2) + ' MB')
      $('#saveTimes').text('You have saved ' + (data.statistics.saveTimes ? data.statistics.saveTimes : 0) + ' times')
      $('#reloadFileTree').text('You have reloaded the tree ' + (data.statistics.reloadFileTree ? data.statistics.reloadFileTree : 0) + ' times')
      $('#filesDownloaded').text((data.statistics.filesDownloaded ? data.statistics.filesDownloaded : 0) + ' files have been downloaded')
      $('#fileCreated').text('You have created ' + (data.statistics.fileCreated ? data.statistics.fileCreated : 0) + ' files')
      $('#deleteFileDirectory').text('You have deleted ' + (data.statistics.deleteFileDirectory ? data.statistics.deleteFileDirectory : 0) + ' times')
    }
  })
  
  $.ajax({
    type: "GET",
    url: "/api/project/featchAllProjects",
    success: function (data) {
      $('#currentProjects').empty()
      data.forEach(project => {
        $('#currentProjects').append('<li class="list-group-item"><a href="/ide?project=' + project.id + '">' + project.name + '</a></li>')
      })
    }
  })

  $('#createProjectModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget)
    var projectBtn = button.data('project')
    $.ajax({
      type: "GET",
      url: "/api/project/listAllAvailibleImages",
      success: function (data) {
        $('#createProjectImageSelect').empty()
        data.forEach(project => {
          $('#createProjectImageSelect').append(
            '<option value="' + project + '"' + (project.includes(projectBtn) ? ' selected="selected"' : '') + '>' + project + '</option>'
          )
        })
      }
    })
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
        window.location.href = '/ide?project=' + data.projectId;
      }).fail((data, textStatus, thrown) => {
        if (data.status === 401) {
          $('#createProjectDialog').modal('hide')
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
      $('#createProjectUsername').val($('#gitUsernameModalInput').val())
      $('#gitPasswordModal').modal('show')
    }
  });

  $('#gitPasswordModalInput').keypress(function (event) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == '13') {
      $('#gitPasswordModal').modal('hide')
      $('#createProjectPassword').val($('#gitPasswordModalInput').val())
      $('#gitPasswordModalInput').val('')
      $('#create-project-form').submit()
    }
  });
})()