'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

const NODE_ENV= { NODE_ENV: process.env.NODE_ENV }

Route.on('/welcome').render('welcome').middleware('guest')

// Login with github
Route.get('login/github', 'LoginController.redirect').as('login.github')
if (NODE_ENV !== 'production') {
  Route.get('login/loginDev', 'LoginController.loginDev').as('login.loginDev')
}
Route.get('github/callback', 'LoginController.callback').as('github.callback')

Route.on('/login').render('login', NODE_ENV).middleware('guest')

Route.on('/ide').render('editor').as('editor').middleware('auth')
Route.get('login/logout', 'LoginController.logout').as('login.logout').middleware('auth')

Route.group(() => {
  Route.get('/project/featchAllProjects', 'ProjectController.featchAllProjects')
  Route.get('/project/getAllFiles', 'ProjectController.getAllFiles')
  Route.post('/project/createProject', 'ProjectController.createProject')
  Route.post('/project/removeProject', 'ProjectController.removeProject')
  Route.get('/project/testGit', 'ProjectController.testGit')

  Route.post('/file/downloadFile', 'FileController.downloadFile')
  Route.post('/file/saveFile', 'FileController.saveFile')
  Route.post('/file/createDirectory', 'FileController.createDirectory')
  Route.post('/file/createFile', 'FileController.createFile')
  Route.delete('/file/deleteFileDirectory', 'FileController.deleteFileDirectory')
  Route.get('/file/reloadFileTree', 'FileController.reloadFileTree')

  Route.post('/docker/createDocker', 'DockerController.createDocker')
  Route.post('/docker/compile', 'DockerController.compileCode')

  Route.post('/git/fetch', 'GitController.fetch')
  Route.post('/git/status', 'GitController.status')
  Route.post('/git/pull', 'GitController.pull')
  Route.post('/git/commit', 'GitController.commit')
  Route.post('/git/add', 'GitController.add')
  Route.post('/git/push', 'GitController.push')
  Route.post('/git/test', 'GitController.testGit')
}).prefix('api')

Route.any('*', ({ response }) => { response.redirect('/login') }).middleware('guest')
