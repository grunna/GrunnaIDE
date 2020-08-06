'use strict'

const Shared = use('./Shared')
const shared = new Shared()
const Env = use('Env')
const User = use('App/Models/User')
const Project = use('App/Models/Project')
const Issue = use('App/Models/Issue')
const IssueComment = use('App/Models/IssueComment')

class IssueController {

  async create({response, request, auth, session}) {
    if (!request.post().title) {
      return response.badRequest('Missing title')
    }
    let issue = new Issue()
    try {
      if (auth.user) {
        let user = await User.find(auth.user.id)
        let project = await user.projects().where({name: session.get('currentProject')}).firstOrFail()
        if (project) {
          issue.issue_id = project.issue_count
          issue.user_id = auth.user.id
          issue.project_id = project.id
          issue.title = request.post().title
          issue.description = request.post().description
          issue.importance = request.post().importance
          // issue.assignee = request.post().assignee
          issue.due_date = request.post().dueDate
          issue.estimate_time = request.post().estimateTime
          issue.members_only = request.post().membersOnly ? false : true
          await issue.save()
          project.issue_count = project.issue_count + 1
          await project.save()
        }
      }
    } catch (e) {
      console.log(e)
      return response.badRequest(e)
    }
    return response.ok()
  }

  async update({response, request, auth, session}) {
    if (!request.post().title) {
      return response.badRequest('Missing title')
    }
    try {
      if (auth.user) {
        let issue = await Issue.query().where('uuid','=',request.post().id).first()
        if (issue && issue.user_id === auth.user.id) {
          issue.title = request.post().title
          issue.description = request.post().description
          issue.importance = request.post().importance
          issue.due_date = request.post().dueDate
          issue.estimate_time = request.post().estimateTime
          issue.members_only = request.post().membersOnly ? false : true
          await issue.save()
        }
      }
    } catch (e) {
      console.log(e)
      return response.badRequest(e)
    }
    return response.ok()
  }

  async deleteIssue({response, request, auth, session}) {
    try {
      if (auth.user) {
        let issue = await Issue.query().where('uuid','=',request.post().id).first()
        if (issue) {
          let issueOwner = await issue.userOwner().fetch()
          if (issueOwner.id === auth.user.id) {
            issue.delete()
            await issue.save()
          } else {
            return response.badRequest('Not owner of comment')
          }
        } else {
          return response.badRequest('Comment not existing')
        }
      } else {
        return response.badRequest('Not authered')
      }
    } catch (e) {
      console.log(e)
      return response.badRequest(e)
    }
    return response.ok()
  }

  async list({response, auth, session}) {
    let returnValue = []
    try {
      if (auth.user) {
        let user = await User.find(auth.user.id)
        let project = await user.projects().where({name: session.get('currentProject')}).firstOrFail()
        let issues = await project.issues().fetch()
        issues.rows.forEach(issue => {
          if (issue.deleted_at === null) {
            returnValue.push({id: issue.uuid, 
                              issueId: issue.issue_id, 
                              title: issue.title, 
                              description: issue.description,
                              importance: issue.importance,
                              dueDate: issue.due_date,
                              created: issue.created_at, 
                              lastUpdate: issue.updated_at, 
                              estimateTime: issue.estimate_time,
                              membersOnly: issue.members_only,
                              open: issue.open})
          }
        })
      }
    } catch (e) {
      console.log('error issue list', e)
      return response.badRequest()
    }
    return response.ok(returnValue)
  }

  async detail({response, auth, session, request}) {
    try {
      let issue = await Issue.findByOrFail('uuid', request.get().id)
      let issueComments = await IssueComment.query().where('issue','=',issue.id).fetch()
      let comments = []
      issueComments.rows.forEach(issue => {
        comments.push({id: issue.uuid, text: issue.text, created: issue.created_at})
      })
      return response.ok({id: issue.uuid, 
                          issueId: issue.issue_id, 
                          title: issue.title, 
                          description: issue.description,
                          importance: issue.importance,
                          dueDate: issue.due_date,
                          created: issue.created_at, 
                          lastUpdate: issue.updated_at, 
                          estimateTime: issue.estimate_time,
                          membersOnly: issue.members_only,
                          open: issue.open,
                          comments: comments
                         })
    } catch (e) {
      console.log('Error in issue detail', e)
      return response.badRequest()
    }
  }

  async switchState({request, response, auth, session}) {
    let issue = await Issue.findByOrFail('uuid', request.post().id)
    if (issue.user_id === auth.user.id) {
      issue.open = !issue.open
      issue.save()
      return response.ok({open: issue.open})
    } else {
      return response.badRequest()
    }
  }

  async addComment({request, response, auth, session}) {
    try {
      if (auth.user) {
        let issue = await Issue.findByOrFail('uuid', request.post().id)
        let issueComment = new IssueComment()
        issueComment.text = request.post().comment
        issueComment.user = auth.user.id
        issueComment.issue = issue.id
        await issueComment.save()
        return response.ok({id: issueComment.uuid, text: issueComment.text, created: issueComment.created_at})
      }
      return response.badRequest()
    } catch (e) {
      console.log('Error adding commment', e)
      return response.badRequest()
    }
  }

  async deleteComment({response, request, auth, session}) {
    try {
      if (auth.user) {
        let issueComment = await IssueComment.query().where('uuid','=',request.post().id).first()
        if (issueComment) {
          let commentOwner = await issueComment.userOwner().fetch()
          if (commentOwner.id === auth.user.id) {
            issueComment.delete()
            await issueComment.save()
          } else {
            return response.badRequest('Not owner of comment')
          }
        } else {
          return response.badRequest('Comment not existing')
        }
      } else {
        return response.badRequest('Not authered')
      }
    } catch (e) {
      console.log(e)
      return response.badRequest(e)
    }
    return response.ok()
  }
}

module.exports = IssueController
