import { check } from 'meteor/check';

import { EDCProtocols } from '../edc-protocols.js';

Meteor.publish('edc_protocols_w_sid', function(sid) {
  check(sid, Number)
  
  return EDCProtocols.find({
    simulation_id: sid
  })
})
