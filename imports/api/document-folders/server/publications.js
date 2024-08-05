import { check } from 'meteor/check';

import { DocumentFolders } from '../document-folders.js';

// Meteor.publish('all_document_folders', function() {
  
//   return liveDb.select(
//     `SELECT id, name, folder_order, simulation_id, status, created, modified 
//       FROM craa_document_folders`,
//     [
//       {
//         table: 'craa_document_folders'
//       }
//     ]
//   );
// });

Meteor.publish('document_folders_w_sid', function(sid) {
  check(sid, Number)
  
  return DocumentFolders.find({
    simulation_id: sid
  }, {
    sort: {
      folder_order: 1
    }
  })
})

Meteor.publish('active_document_folders_w_sid', function(sid) {
  check(sid, Number)
  
  return DocumentFolders.find({
    simulation_id: sid,
    status: 1
  }, {
    sort: {
      folder_order: 1
    }
  })
})

DocumentFolders.allow({
  insert: function() { return true; },
  update: function() { return true; },
  remove: function () { return true; }
});
