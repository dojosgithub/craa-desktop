import { check } from 'meteor/check';

import { EDCSites } from '../edc-sites.js';

Meteor.publish('edc_sites_w_sid', function(sid) {
  check(sid, Number)
  
  return EDCSites.find({
    simulation_id: sid
  })
})
