"use strict";

(function () {
  $.ajax({
      type: "GET",
      url: "/api/project/featchAllProjects",
      success: function (data) {
        $('#currentProjects').empty()
        data.forEach(project => {
          $('#currentProjects').append('<li class="list-group-item"><a href="/ide?project=' + project.id + '">' + project.name + '</a></li>')
        })
        $('#currentProjectsFooter').val(data.length + ' / 10 Project created')
      }
    })
 
})()