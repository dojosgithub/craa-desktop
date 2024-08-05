import { check } from 'meteor/check';

import { Findings } from '../findings.js';

// Meteor.publish('all_behaviors', function() {
//   return liveDb.select(
//     'SELECT * FROM craa_behaviors',
//     [ { 
//         table: 'craa_behaviors'
//     } ]
//   );
// });

Meteor.publish('findings_w_sid', function(sid) {
  check(sid, Number)  

  return Findings.find({
    simulation_id: sid,
    status: {$ne: 4}
  }, {
    sort: {
      severity: 1,
      id: 1
      // $natural: 1
    }
  })
})

Meteor.publish('findings_w_sid_mini', function(sid) {
  check(sid, Number)  

  return Findings.find({
    simulation_id: sid,
    status: 1
  }, {
    sort: {id: 1},
    fields: {
      id: 1,
      finding: 1,
      simulation_id: 1
    }
  }) 
})

Meteor.publish('active_findings_w_sid_ordered', function(sid) {
  check(sid, Number)  

  return Findings.find({
    simulation_id: sid,
    status: 1
  }, {
    sort: {
      order: 1
    }
  })
});

Meteor.publish('active_findings_w_sid_ordered_by_domain', function(sid) {
  check(sid, Number)  

  return Findings.find({
    simulation_id: sid,
    status: 1
  }, {
    sort: {
      category: 1,
      order: 1
    }
  })
});
