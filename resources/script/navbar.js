"use strict";

$(function () {

  $('#run').on('click', function (e) {
    console.log('working');
    $.ajax({
      type: "POST",
      url: "/api/docker/compile",
      success: function (data) {
       console.log('Ajax Post return data: ', data);
      }
    })
  });

  $('#menuGitFetch').on('click', function (e) {
    $.ajax({
      type: "POST",
      url: "/api/git/fetch",
      data: globalValues.postData,
      success: function(data) {
	    console.log('Fetch return: ', data)
      },
      error: function(xhr, ajaxOptions, thrownError) {
	console.log('ERROR', xhr)
        if (xhr.status === 401) {
          globalValues.action = 'gitFetch'
          globalValues.postData = {}
          if (globalValues.username) {
            $('#gitUsernameModalInput').val(globalValues.username)
          }
          $('#gitUsernameModal').modal('show')
        }
      }

    })
  });

  $('#menuGitStatus').on('click', function (e) {
    $.ajax({
      type: "POST",
      url: "/api/git/status",
      success: function(data) {
        data.stage.forEach(element => {
          if (element.status !== 'unmodified') {
            $('#outputData').append('File: ' + element.file + ' ' + element.status + '\n')
          }
        });
	$('#outputData').append('-----------------------------------\n')
      }
    })
  });

  $('#menuGitAdd').on('click', function (e) {
    $('#gitAddModal').modal('show')
  });

  $('#gitAddModalInput').keypress(function (event) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == '13') {
      $('#gitAddModal').modal('hide')
      let message = $('#gitAddModalInput').val()
      $.ajax({
        type: "POST",
        url: "/api/git/add",
        data: { file: message },
        success: function(data) {
          console.log('Fetch return: ', data)
        }
      })
    }
  });  

  $('#menuGitCommit').on('click', function (e) {
    $('#gitCommitMessageModal').modal('show')
  });

  $('#gitCommitMessageModalInput').keypress(function (event) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == '13') {
      $('#gitCommitMessageModal').modal('hide')
      let message = $('#gitCommitMessageModalInput').val()
      $.ajax({
        type: "POST",
        url: "/api/git/commit",
        data: { commitMessage: message },
        success: function(data) {
          console.log('Fetch return: ', data)
        }
      })
      
    }
  });

   $('#menuGitPush').on('click', function (e) {
    $.ajax({
      type: "POST",
      url: "/api/git/push",
      data: globalValues.postData,
      success: function(data) {
        updateTree(data)
      },
      error: function(xhr, ajaxOptions, thrownError) {
	console.log('ERROR', xhr)
        if (xhr.status === 401) {
          globalValues.action = 'gitPush'
          globalValues.postData = {}
          if (globalValues.username) {
            $('#gitUsernameModalInput').val(globalValues.username)
          }
          $('#gitUsernameModal').modal('show')
        }
      }
    })
  });

  $('#menuGitPull').on('click', function (e) {
    $.ajax({
      type: "POST",
      url: "/api/git/pull",
      data: globalValues.postData,
      success: function(data) {
	$('#filetree').fancytree('getTree').reload(createTree(data))
      },
      error: function(xhr, ajaxOptions, thrownError) {
        if (xhr.status === 401) {
          globalValues.action = 'gitPull'
          globalValues.postData = {}
          if (globalValues.username) {
            $('#gitUsernameModalInput').val(globalValues.username)
          }
          $('#gitUsernameModal').modal('show')
        }
      }
    })
  });

  $('#menuGitTest').on('click', function (e) {
    $.ajax({
      type: "POST",
      url: "/api/git/test",
      success: function(data) {
	    console.log('Fetch return: ', data)
      }
    })
  });

  function commitChanges(message) {
    
  }
});
