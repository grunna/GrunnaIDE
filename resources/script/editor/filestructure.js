"use strict";

import {globalValues, processLargeArrayAsync} from './global.js'
import {setCodeMirrorData} from './project.js'
import sha256 from 'crypto-js/sha256';

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

export function retriveFile(path, fromTab = false) {
  if (fromTab) {
    displayFileInCodeEditor(JSON.parse(window.localStorage.getItem(path))?.data, path, fromTab)
  } else {
    $.ajax({
      type: 'POST',
      url: '/api/file/downloadFile',
      data: {
        fileName: path,
        hash: JSON.parse(window.localStorage.getItem(path))?.hash
      },
      success: (data) => {
        if (globalValues.codemirrorInstance.getValue() === globalValues.loadedFile || globalValues.loadedFile === '') {
          displayFileInCodeEditor(data, path, fromTab)
        } else {
          globalValues.tempLoadedFile = data
          globalValues.tempLoadedFilePath = path
          $('#unsavedFileModal').modal('show')
        }
      }
    });
  }
}

function displayFileInCodeEditor(data, path, fromTab) {
  setCodeMirrorData(data, path)
  window.localStorage.setItem(path, JSON.stringify({data: data, hash: sha256(data).toString()}))
  if (!fromTab) {
    let retriveFileListener = (event) => {
      const path = $(event.currentTarget).attr('data-path')
      retriveFile(path, true)
      let node = globalValues.fancyTree.getNodeByKey(path);
      node.setActive(true)
      $(event.currentTarget).tab('show')
    }
    let removeFileTab = (event) => {
      event.stopPropagation()
      let currentTab = $(event.currentTarget).closest('li')
      let tabBefore = currentTab.prev()
      let tabNext = currentTab.next()
      if (currentTab.children('.active').length > 0) {
        if (tabBefore.length > 0) {
          const path = tabBefore.children('a').first().attr('data-path')
          retriveFile(path, true)
          let node = globalValues.fancyTree.getNodeByKey(path);
          node.setActive(true)
          tabBefore.children('a').first().tab('show')
        } else if (tabNext.length > 0) {
          const path = tabNext.children('a').first().attr('data-path')
          retriveFile(path, true)
          let node = globalValues.fancyTree.getNodeByKey(path);
          node.setActive(true)
          tabNext.children('a').first().tab('show')
        }
      }
      currentTab.remove()
    }
    let inTabList = false
    $('#fileTabs li').each((idx, li) => {
      const liPath = $(li).children('a').first().attr('data-path')
      if (liPath === path) {
        $(li).children('a').first().tab('show')
        inTabList = true
        return false
      }
    })
    if (!inTabList) {
      if ($('#fileTabs li').length >= 10) {
        $('#fileTabs li').last().remove()
      }
      let liElement = document.createElement('li')
      liElement.classList.add("nav-item")
      let cross = document.createElement('button')
      cross.type = 'button'
      cross.innerHTML = '<span aria-hidden="true" class="tabCross"> &times;</span>'
      cross.classList.add("close")
      cross.addEventListener("click", removeFileTab)
      let modeLink = document.createElement('a')
      modeLink.setAttribute('data-path', path)
      modeLink.innerHTML = path.substring(path.lastIndexOf('/') + 1);
      modeLink.classList.add("nav-link")
      modeLink.addEventListener("click", retriveFileListener)
      modeLink.append(cross)
      liElement.append(modeLink)
      $('#fileTabs').prepend(liElement)
      $('#fileTabs li:first-child a').tab('show')
    }
  }
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

