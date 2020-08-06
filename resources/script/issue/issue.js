"use strict";

import {displayIssueList} from '../editor/filestructure.js'

export function issue() {
  $('#create-issue-form').on('submit', function (e) {
    if (!e.isDefaultPrevented()) {
      let formData = $(this).serialize()
      $.ajax({
        type: "POST",
        url: "/api/issue/create",
        data: formData
      }).done((data) => {
        $("#create-issue-form").trigger("reset");
        $('#fileTabs').find('.active').find('button').click()
        displayIssueList()
      }).fail((data, textStatus, thrown) => {
        console.log('dataError', data)
      })
      return false;
    }
    e.preventDefault()
  });
  
  $('#update-issue-form').on('submit', function (e) {
    if (!e.isDefaultPrevented()) {
      let formData = $(this).serialize()
      $.ajax({
        type: "POST",
        url: "/api/issue/update",
        data: formData
      }).done((data) => {
        displayIssueList(false)
        $('<div class="alert alert-success" style="position: fixed; bottom: 5px; left:2%; width: 40%;">' +
      '<button type="button" class="close" data-dismiss="alert">' +
      '&times;</button>Issue updated</div>').hide().appendTo('#alerts').fadeIn(1000);

    $(".alert").delay(1000).fadeOut("normal", function(){
      $(this).alert('close')
    })
      }).fail((data, textStatus, thrown) => {
        console.log('dataError', data)
      })
      return false;
    }
    e.preventDefault()
  });

  $('#inputIssueMembersOnly').click((event) => {
    let current = event.currentTarget
    current.value = '' + current.checked
  })

  $('#inputIssueDetailSwitchState').click((event) => {
    $.ajax({
      type: "POST",
      url: "/api/issue/switchState",
      data: {id: $('#issueDetailId').val()}
    }).done((data) => {
      if (data.open) {
        $('#inputIssueDetailOpen').toggleClass('btn-success').toggleClass('btn-danger').html('Open')
        $('#inputIssueDetailSwitchState').html('Close')
      } else {
        $('#inputIssueDetailOpen').toggleClass('btn-success').toggleClass('btn-danger').html('Close')
        $('#inputIssueDetailSwitchState').html('Reopen issue')
      }
      displayIssueList(false)
    }).fail((data, textStatus, thrown) => {
      console.log('dataError', data)
    })
  })
  
  $('#inputIssueDetailDeleteIssue').click((event) => {
    $.ajax({
      type: "POST",
      url: "/api/issue/deleteIssue",
      data: {id: $('#issueDetailId').val()}
    }).done((data) => {
      $('#fileTabs').find('.active').find('button').click()
      displayIssueList()
    }).fail((data, textStatus, thrown) => {
      console.log('dataError', data)
    })
  })
  
  $('#issueComments').click((event) => {
    $.ajax({
      type: "POST",
      url: "/api/issue/deleteComment",
      data: {id: $(event.target).attr('data-commentId')}
    }).done((data) => {
      $(event.target).closest('.card').remove()
    }).fail((data, textStatus, thrown) => {
      console.log('dataError', data)
    })
  })

  $('#add-issue-comment-form').on('submit', function (e) {
    if (!e.isDefaultPrevented()) {
      $.ajax({
        type: "POST",
        url: "/api/issue/addComment",
        data: {id: $('#issueDetailId').val(), comment: $('#inputIssueDetailComment').val()}
      }).done((data) => {
        let commentCard = `
<div class="card">
<div class="card-header">
<div class="d-flex">
    <div class="mr-auto p-2">
      Created at ${data.created}
    </div>
    <div class="p-2">
      <button type="button" data-commentId="${data.id}" class="btn btn-sm btn-danger">Delete</button>
    </div>
  </div>
</div>
<div class="card-body py-2"><pre class="mb-0">
${data.text}
</pre>
</div>
</div>
`
        $('#issueComments').append(commentCard)
        $('#inputIssueDetailComment').val('')
      }).fail((data, textStatus, thrown) => {
        console.log('dataError', data)
      })
      return false;
    }
    e.preventDefault()
  });

}
