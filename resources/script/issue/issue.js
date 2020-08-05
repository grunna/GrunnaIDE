"use strict";

export function issue() {
  $('#create-issue-form').on('submit', function (e) {
    if (!e.isDefaultPrevented()) {
      let formData = $(this).serialize()
      console.log('posting', formData)
      $.ajax({
        type: "POST",
        url: "/api/issue/create",
        data: formData
      }).done((data) => {
        console.log('Issue created', data)
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
      // TODO Remove issue
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
