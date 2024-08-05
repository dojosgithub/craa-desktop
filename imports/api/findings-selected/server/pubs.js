import { check } from 'meteor/check';

import { FindingsSelected } from '../findings-selected.js';

Meteor.publish('all_findings_selected', function() { 

  return FindingsSelected.find({
    status: {$ne: 4}
  }, {
    sort: {
        name: 1
    }
  })
})

Meteor.publish('findings_selected_by_sid', function(sid) {
  check(sid, Number)  

  return FindingsSelected.find({
    simulation_id: sid,
    status: {$ne: 4}
  }, {
    sort: {
        name: 1
    }
  })
})
