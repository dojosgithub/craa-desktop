import { check } from 'meteor/check';

import { DocumentFiles } from '../document-files.js';

// Meteor.publish('all_document_files', function() {
  
//   return liveDb.select(
//     `SELECT id, name, simulation_id, folder_id, document_id, status, size, created, modified 
//       FROM craa_document_files`,
//     [
//       {
//         table: 'craa_document_files'
//       }
//     ]
//   );
// });

Meteor.publish('document_files_w_sid', function(sid) {
  check(sid, Number)
  
  return DocumentFiles.find({
    simulation_id: sid
  })
})
