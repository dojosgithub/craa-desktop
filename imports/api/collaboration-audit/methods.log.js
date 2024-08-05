import { check } from 'meteor/check'

import { CollaborationAuditLog } from './collaboration-audit-log.js'

Meteor.methods({

  "CollaborationAuditLog.insert"(obj) {
    check(obj, {
      _id: String,
      cid: String,
      buid: String,
      sid: Number,
      u1Id: String,
      u2Id: String,      
      author: String,
      venue: String,
      message: String,
      reviewed: Match.Optional(Match.OneOf(undefined, null, Boolean)),
      collaborated: Match.Optional(Match.OneOf(undefined, null, Boolean)),
      comment: Match.Optional(Match.OneOf(undefined, null, String)),
    })
    // this.unblock();

    CollaborationAuditLog.insert({
      auditId: obj._id,
      cid: obj.cid,
      buid: obj.buid,
      sid: obj.sid,
      u1Id: obj.u1Id,
      u2Id: obj.u2Id,
      author: obj.author,
      venue: obj.venue,
      message: obj.message,
      comment: obj.comment,
      cAt: new Date
    })
  }

});
      
