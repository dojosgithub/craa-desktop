import { check } from 'meteor/check';

import { FindingsRequirements } from '../findings-requirements.js';

Meteor.publish('all_findings_requirements', function() { 

  return FindingsRequirements.find({
    status: {$ne: 4}
  }, {
    sort: {
      name: 1
    }
  })
})

Meteor.publish('findings_requirements_by_sid', function(sid) {
  check(sid, Number)  

  return FindingsRequirements.find({
    simulation_id: sid,
    status: {$ne: 4}
  }, {
    sort: {
      name: 1
    }
  })
})
