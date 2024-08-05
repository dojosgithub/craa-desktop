import { check } from 'meteor/check';

import { Simulations } from '../simulations.js';

// Meteor.publish('simulations', function(){
//   return liveDb.select(
//     `SELECT * FROM craa_simulations WHERE status = 1 ORDER BY name`,
//     [ { table: 'craa_simulations' } ]
//   );
// });

// Meteor.publish('all_simulations', function(){
//   return liveDb.select(
//     `SELECT * FROM craa_simulations ORDER BY name`,
//     [ { table: 'craa_simulations' } ]
//   );
// });

Meteor.publish('all_active_simulations', () => {
  return Simulations.find({
    status: 1
  }, {
    sort: {name: 1}
  })
})

Meteor.publish('simulation_w_sid', (simulationId) => {
  check(simulationId, Number)

  return Simulations.find({
    id: simulationId
  })
})
