import { check } from 'meteor/check';

import { EDCSubjects } from '../edc-subjects.js';

Meteor.publish('edc_subjects_w_sid', function(sid) {
  check(sid, Number)
  
  return EDCSubjects.find({
    simulation_id: sid
  })
})
