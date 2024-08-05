import { check } from 'meteor/check'

import { Clients } from '../clients.js'

Meteor.publish('clients_mini', function() {  

  return Clients.find({
    status: 1,
    'bus.status': 1,
    'bus.simulations.checked': true
  }, {
    sort: {
      name: 1,
      'bus.name': 1,
      'bus.simulations.name': 1
    },
    fields: {
      name: 1,
      // bus: 1,
      'bus._id': 1,
      'bus.client_id': 1,
      'bus.name': 1,
      // 'bus.simulations': 1,
      'bus.simulations.id': 1,
      'bus.simulations.name': 1,      
      'bus.simulations.bu_id': 1      
    }
  }) 
})
