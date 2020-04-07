"use strict";

(function () {
  
  let globalValues = {}
  
  $.ajax({
    type: "GET",
    url: "/api/project/featchAllProjects",
    success: function (data) {
      $('#currentProjects').empty()
      data.forEach(project => {
        $('#currentProjects').append('<li class="list-group-item"><a href="/ide?project=' + project.id + '">' + project.name + '</a></li>')
      })
      $('#currentProjectsFooter').text(data.length + ' / 10 Project created')
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