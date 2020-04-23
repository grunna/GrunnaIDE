'use strict'

const User = use('App/Models/User')
const Statistic = use('App/Models/Statistic')
const Env = use('Env')
const Shared = use('./Shared')
const shared = new Shared()

class DashboardController {
/*
   $('#currentProjectsFooter').text(data.projects + ' / ' + data.maxProjects + ' Project created')
      $('#directorySize').text('All your projects take ' + (data.directorySize / 1024 / 1024).toFixed(2) + ' MB')
      $('#saveTimes').text('You have saved ' + (data.statistics.saveTimes ? data.statistics.saveTimes : 0) + ' times')
      $('#reloadFileTree').text('You have reloaded the tree ' + (data.statistics.reloadFileTree ? data.statistics.reloadFileTree : 0) + ' times')
      $('#filesDownloaded').text((data.statistics.filesDownloaded ? data.statistics.filesDownloaded : 0) + ' files have been downloaded')
      $('#fileCreated').text('You have created ' + (data.statistics.fileCreated: 0,  ? data.statistics.fileCreated : 0) + ' files')
      $('#deleteFileDirectory').text('You have deleted ' + (data.statistics.deleteFileDirectory ? data.statistics.deleteFileDirectory :*/
  
  async summery({response, request, auth}) {
    let summery = { projects: 0, maxProjects: 0, directorySize: 0, statistics: {saveTimes: 0, reloadFileTree: 0, filesDownloaded: 0, fileCreated: 0, deleteFileDirectory: 0}}
    let user = await User.findBy('uuid', auth.user.uuid)
    summery.maxProjects = user.max_projects
    console.log('user', user)
    if (user.projects()) {
      let projects = await user.projects().getCount()
      summery.projects = projects
    } else {
      summery.projects = 0
    }
    const stat = await Statistic.query()
    .where('user_id', '=', auth.user.id)
    .fetch()
    if (stat.rows.length > 0) {
      summery.statistics = JSON.parse(stat.rows[0].statistics)
    }

    await shared.getDirectorySize(auth)
      .then(size => summery.directorySize = size)
      .catch(() => summery.directorySize = 0)

    response.send(summery)
  }

}

module.exports = DashboardController
