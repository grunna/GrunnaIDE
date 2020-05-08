"use strict";

export var globalValues = {
  loadedProject: "",
  loadedFile: "",
  loadedFilePath: "",
  fancyTree: null,
  currentFileTree: [],
  tempLoadedFile: "",
  tempLoadedFilePath: "",
  action: "",
  postData: {},
  username: "",
  codemirrorInstance: null,
  codemirrorSettings: {},
  xterm: null,
  xtermFitAddon: null,
  ws: null
}

export const getQueryParams = ( params, url ) => {

  let href = url;
  //this expression is to get the query strings
  let reg = new RegExp( '[?&]' + params + '=([^&#]*)', 'i' );
  let queryString = reg.exec(href);
  return queryString ? queryString[1] : null;
};

export const allThemes = [
  '3024-day',
  '3024-night',
  'abcdef',
  'ambiance-mobile',
  'ambiance',
  'ayu-dark',
  'ayu-mirage',
  'base16-dark',
  'base16-light',
  'bespin',
  'blackboard',
  'cobalt',
  'colorforth',
  'darcula',
  'dracula',
  'duotone-dark',
  'duotone-light',
  'eclipse',
  'elegant',
  'erlang-dark',
  'gruvbox-dark',
  'hopscotch',
  'icecoder',
  'idea',
  'isotope',
  'lesser-dark',
  'liquibyte',
  'lucario',
  'material-darker',
  'material-ocean',
  'material-palenight',
  'material',
  'mbo',
  'mdn-like',
  'midnight',
  'monokai',
  'moxer',
  'neat',
  'neo',
  'night',
  'nord',
  'oceanic-next',
  'panda-syntax',
  'paraiso-dark',
  'paraiso-light',
  'railscasts',
  'rubyblue',
  'seti',
  'shadowfox',
  'solarized',
  'ssms',
  'the-matrix',
  'tomorrow-night-bright',
  'tomorrow-night-eighties',
  'ttcn',
  'twilight',
  'vibrant-ink',
  'xq-dark',
  'xq-light',
  'yeti',
  'yonce',
  'zenburn'
]
