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

const Env = use('Env')
const version = { version: Env.get('VERSION') }

// Login with github
Route.get('login/github', 'LoginController.redirect').as('login.github')
if (NODE_ENV !== 'production') {
  Route.get('login/loginDev', 'LoginController.loginDev').as('login.loginDev')
  Route.get('login/loginDev2', 'LoginController.loginDev2').as('login.loginDev2')
}
Route.get('github/callback', 'LoginController.callback').as('github.callback')

Route.on('/login').render('loginPreact', version)

Route.on('/dashboard').render('dashboard').as('dashboard').middleware('auth')

Route.on('/ide').render('editor').as('editor').middleware('auth')
Route.on('/shared').render('editor').as('shared')

Route.get('login/logout', 'LoginController.logout').as('login.logout').middleware('auth')

Route.group(() => {
  Route.get('/project/featchAllProjects', 'ProjectController.featchAllProjects').middleware('auth')
  Route.get('/project/getAllFiles', 'ProjectController.getAllFiles')
  Route.post('/project/createProject', 'ProjectController.createProject').middleware('auth')
  Route.post('/project/removeProject', 'ProjectController.removeProject').middleware('auth')
  Route.get('/project/listAllAvailibleImages', 'ProjectController.listAllAvailibleImages').middleware('auth')
  Route.post('/project/changeDockerImage', 'ProjectController.changeDockerImage').middleware('auth')
  Route.post('/project/projectSettings', 'ProjectController.projectSettingsPost').middleware('auth')
  Route.get('/project/projectSettings', 'ProjectController.projectSettingsGet').middleware('auth')
  Route.post('/project/shareProject', 'ProjectController.shareProject')
  Route.get('/project/sharedProjectLinks', 'ProjectController.sharedProjectLinks')
  Route.post('/project/removeSharedProjectLink', 'ProjectController.removeSharedProjectLink')

  Route.post('/file/downloadFile', 'FileController.downloadFile')
  Route.post('/file/saveFile', 'FileController.saveFile').middleware('auth')
  Route.post('/file/createDirectory', 'FileController.createDirectory').middleware('auth')
  Route.post('/file/createFile', 'FileController.createFile').middleware('auth')
  Route.post('/file/rename', 'FileController.rename').middleware('auth')
  Route.delete('/file/deleteFileDirectory', 'FileController.deleteFileDirectory').middleware('auth')
  Route.get('/file/reloadFileTree', 'FileController.reloadFileTree')
  Route.post('/file/upload', 'FileController.upload').middleware('auth')

  Route.post('/git/fetch', 'GitController.fetch').middleware('auth')
  Route.post('/git/status', 'GitController.status').middleware('auth')
  Route.post('/git/pull', 'GitController.pull').middleware('auth')
  Route.post('/git/commit', 'GitController.commit').middleware('auth')
  Route.post('/git/add', 'GitController.add').middleware('auth')
  Route.post('/git/push', 'GitController.push').middleware('auth')
  Route.post('/git/test', 'GitController.testGit').middleware('auth')
  
  Route.post('/issue/create', 'IssueController.create')
  Route.post('/issue/update', 'IssueController.update')
  Route.post('/issue/deleteIssue', 'IssueController.deleteIssue')
  Route.post('/issue/switchState', 'IssueController.switchState')
  Route.post('/issue/addComment', 'IssueController.addComment')
  Route.post('/issue/deleteComment', 'IssueController.deleteComment')
  Route.get('/issue/list', 'IssueController.list')
  Route.get('/issue/detail', 'IssueController.detail')
  
  
  Route.get('/dashboard/summery', 'DashboardController.summery')
}).prefix('api')

Route.any('*', ({ response, auth }) => { auth.user ? response.redirect('/dashboard') : response.redirect('/login') })
