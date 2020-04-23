'use strict'

const User = use('App/Models/User')
const Statistic = use('App/Models/Statistic')
const Env = use('Env')
const Shared = use('./Shared')
const shared = new Shared()

class DashboardController {
  
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
