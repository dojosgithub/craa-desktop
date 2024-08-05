import { check } from 'meteor/check';

import { CollaborationAudit } from '../collaboration-audit.js';

Meteor.publish("init_collaboration_audit_above_80", function() {
  return CollaborationAudit.find({
    status: 1,
    percent: { $gte: 80 }
  },
  {
    sort: {
      compTime: -1,
      u1fname: 1
    },
    limit: 20
  }
  );
});

//-- Not working...
// Meteor.publish("count_collaboration_audit_above_80", function() {
//   return CollaborationAudit.find({
//     status: 1,
//     percent: { $gte: 80 }
//   }).count();
// });
