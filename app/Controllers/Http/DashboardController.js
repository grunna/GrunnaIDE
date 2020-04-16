'use strict'

const User = use('App/Models/User')
const Statistic = use('App/Models/Statistic')
const Env = use('Env')
const Shared = use('./Shared')
const shared = new Shared()

class DashboardController {

  async summery({response, request, auth}) {
    let summery = {}
    let user = await User.findBy('uuid', auth.user.uuid)
    summery.maxProjects = user.max_projects
    let projects = await user.projects().getCount()
    summery.projects = projects
    const stat = await Statistic.query()
    .where('user_id', '=', auth.user.id)
    .fetch()
    summery.statistics = JSON.parse(stat.rows[0].statistics)

    await shared.getDirectorySize(auth).then(size => summery.directorySize = size)

    response.send(summery)
  }

}

module.exports = DashboardController
