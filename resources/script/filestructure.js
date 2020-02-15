"use strict";

$(function () {
  $('#reloadFileTree').on('click', function (e) {
    console.log('working');
    $.ajax({
      type: "GET",
      url: "/api/file/reloadFileTree",
      success: function (data) {
       $('#filetree').fancytree('getTree').reload(createTree(data))
      }
    })
  });

});
