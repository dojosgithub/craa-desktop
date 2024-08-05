import { check } from 'meteor/check';

import { MonitoringNotes } from '../monitoring-notes.js';

Meteor.publish('monitoring_notes_w_ids', function(ids) {
  check(ids, {
    client_id: String,
    bu_id: String,
    simulation_id: String,
    creator: String
  })
  
  return MonitoringNotes.find({
    client_id: ids.client_id,
    bu_id: ids.bu_id,
    simulation_id: ids.simulation_id,
    creator: ids.creator,
    status: 1
  }, {
    sort: {
      'document.folder_order': 1,
      'document.document_order': 1,
      key: 1
    }
  })
})

