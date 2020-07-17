'use strict'

const Shared = use('./Shared')
const shared = new Shared()
const Env = use('Env')

class IssueController {
  
  async create({response, auth, session}) {
    return response.ok()
  }
  
  async issue({response, auth, session}) {
    return response.ok()
  }
}

module.exports = IssueController
