"use strict";

$(function () {
	$('#reloadFileTree').on('click', function (e) {
    $.ajax({
      type: "GET",
      url: "/api/file/reloadFileTree",
      success: function (data) {
        globalValues.currentFileTree = data
        $('#filetree').fancytree('getTree').reload(createTree(data))
      }
    })
  });

  $(document).keydown(function(event) {
    if (event.ctrlKey && event.keyCode == 80) {
      event.preventDefault()
      //action here
      $('#searchFilesModal').modal('show')
      $('#inputSearchFiles').focus()
    }
  });

});

function inputSearchFilesListener() {
  let value = $('#inputSearchFiles').val()
  $('#listOfSearchFiles').empty()
  if (value.length >= 1) {
    let addedItems = 0
    let addToList = (path, name) => {
      if (addedItems < 10) {
        let modeLink = document.createElement('a')
        modeLink.setAttribute('data-path', path)
        modeLink.innerHTML = name + '<br/><small>' + path + '</small>'
        modeLink.classList.add("dropdown-item")
        modeLink.style.overflow = "hidden";
        modeLink.style.textOverflow = "ellipsis";
        modeLink.addEventListener("click", function(event) {
          const path = $(event.currentTarget).attr('data-path')
          retriveFile(path)
          $('#searchFilesModal').modal('hide')
          let filetree = $("#filetree").fancytree("getTree");
          let node = filetree.getNodeByKey(path);
          node.setActive(true)
        })
        $('#listOfSearchFiles').append(modeLink)
        addedItems = addedItems + 1
      }
    }
    let printArray = function(arr) {
      if (Array.isArray(arr)) {
        for (var i = 0; i < arr.length; i++) {
          if (arr[i].children) {
            if (arr[i].name.toLowerCase().includes(value.toLowerCase())) {
              addToList(arr[i].path, arr[i].name)
            }
            printArray(arr[i].children);
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
          printArray(arr.children);
        }
      }
    }
    printArray(globalValues.currentFileTree)
  }
}

function retriveFile(path) {
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

function createTree(array) {
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