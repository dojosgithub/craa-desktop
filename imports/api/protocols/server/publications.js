import { check } from 'meteor/check';

import { Protocols } from '../protocols.js';

// Meteor.publish('all_protocols', function() {
//   return liveDb.select(
//     'SELECT * FROM craa_protocols',
//     [ { table: 'craa_protocols' } ]
//   );
// });

// Meteor.publish('active_protocols', function(){
//   return liveDb.select(
//     'SELECT * FROM craa_protocols WHERE status = 1',
//     [ { table: 'craa_protocols' } ]
//   );
// });

// Meteor.publish('all_protocols_w_sid', function(sid) { 
//   return liveDb.select(
//     `SELECT * FROM craa_protocols 
//      WHERE simulation_id=${liveDb.db.escape(sid)} AND status < 5 
//      ORDER BY protocol_order ASC`,
//     [ { table: 'craa_protocols' } ]
//   );
// });

Meteor.publish('protocols_w_sid', function(sid) { 
  check(sid, Number)

  return Protocols.find({
    simulation_id: sid
  }, {
    sort: {protocol_order: 1}
  })
});
