"use strict";

import {globalValues, processLargeArrayAsync} from './global.js'
import {setCodeMirrorData} from './project.js'

export function filestructure() {
  $('#reloadFileTree').on('click', function (e) {
    $.ajax({
      type: "GET",
      url: "/api/file/reloadFileTree",
      success: function (data) {
        globalValues.currentFileTree = data
        globalValues.fancyTree.reload(createTree(data))
      }
    })
  });

  $(document).keydown(function(event) {
    if (event.ctrlKey && event.keyCode == 80) {
      event.preventDefault()
      $('#searchFilesModal').modal('show')
    }
  });

  $('#searchFilesModal').on('shown.bs.modal', function (e) {
    $('#inputSearchFiles').on('input', inputSearchFilesListener)
    $('#inputSearchFiles').focus()
    $('#inputSearchFiles').select()
  })
  $('#searchFilesModal').on('hide.bs.modal', (e) => {
    $('#inputSearchFiles').off('input')
  })

  $('#uploadFileBtn').on('click', function (e) {
    let form_data = new FormData();

    // Read selected files
    var totalfiles = document.getElementById('myfiles').files.length;
    for (var index = 0; index < totalfiles; index++) {
      form_data.append("files[]", document.getElementById('myfiles').files[index]);
    }
    form_data.append("uploadFilePath", document.getElementById('uploadFilePath').value)

    // AJAX request
    $.ajax({
      url: '/api/file/upload', 
      type: 'post',
      data: form_data,
      dataType: 'json',
      contentType: false,
      processData: false,
      success: function (data) {
        globalValues.fancyTree.reload(createTree(data))
        $('#uploadFileModal').modal('hide')
      }
    });
  })

}

export function retriveFile(path) {
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

export function createTree(array) {
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

export function inputSearchFilesListener() {
  let value = $('#inputSearchFiles').val()
  $('#listOfSearchFiles').empty()
  $('#searchFilesResults').text('')
  let container = document.createDocumentFragment();
  let addedItems = 0
  if (value.length >= 1) {
    let addToList = (path, name) => {
      if (addedItems < 500) {
        let retriveFileListener = (event) => {
          const path = $(event.currentTarget).attr('data-path')
          retriveFile(path)
          $('#searchFilesModal').modal('hide')
          let node = globalValues.fancyTree.getNodeByKey(path);
          node.setActive(true)
        }
        let modeLink = document.createElement('a')
        modeLink.setAttribute('data-path', path)
        modeLink.innerHTML = name + '<br/><small>' + path + '</small>'
        modeLink.classList.add("dropdown-item")
        modeLink.style.overflow = "hidden";
        modeLink.style.textOverflow = "ellipsis";
        modeLink.addEventListener("click", retriveFileListener)
        container.appendChild(modeLink)
      }
      addedItems = addedItems + 1

    }
    let printArray = function(arr) {
      if (Array.isArray(arr)) {
        for (var i = 0; i < arr.length; i++) {
          if (arr[i].children) {
            if (arr[i].name.toLowerCase().includes(value.toLowerCase())) {
              addToList(arr[i].path, arr[i].name)
            }
            printArray(arr[i].children)
          } else {
            if (arr[i].name.toLowerCase().includes(value.toLowerCase())) {
              addToList(arr[i].path, arr[i].name)
            }
          }
        }
      } else {
        if (arr.children) {
          if (arr.name.toLowerCase().includes(value.toLowerCase())) {
            addToList(arr.path, arr.name)
          }
          printArray(arr.children)
        }
      }
    }
    printArray(globalValues.currentFileTree)
    $('#listOfSearchFiles').append(container)
    $('#searchFilesResults').text(addedItems + ' files found')
  }
}

