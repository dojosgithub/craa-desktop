import { check } from 'meteor/check'
import { Requests } from '../requests.js'

Meteor.publish('all_requests', () => {
  return Requests.find()
})

Meteor.publish('my_requests', (uid) => {
  check(uid, String)

  return Requests.find({
    $or: [
      {reviewers: {$in: [uid]}},
      {requester: uid}
    ]
  })
})

Meteor.publish('requests_assigned', (uid) => {
  check(uid, String)

  return Requests.find({
    reviewers: {$in: [uid]}
  })
})

Meteor.publish('requests_created', (uid) => {
  check(uid, String)

  return Requests.find({
    requester: uid
  })
})
