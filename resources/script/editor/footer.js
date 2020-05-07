"use strict";

export function footer() {
  let sortedModeInfo = CodeMirror.modeInfo.slice().sort((a,b) => {
    const nameA = a.name.toUpperCase();
    const nameB = b.name.toUpperCase();

    let comparison = 0;
    if (nameA > nameB) {
      comparison = 1;
    } else if (nameA < nameB) {
      comparison = -1;
    }
    return comparison;
  })
  sortedModeInfo.forEach(mode => {
    let modeLink = document.createElement('a')
    modeLink.id = mode.name
    modeLink.innerHTML = mode.name
    modeLink.classList.add("dropdown-item")
    $('#dropdownModeMenu').append(modeLink)
  })
  
  $('#dropdownModeMenu a').on('click', (event) => {
    const modeName = $(event.currentTarget).attr('id')
    let selectedMode = CodeMirror.findModeByName(modeName)
    setCurrentMode(selectedMode.mode, selectedMode.mime, modeName)
  })
}
