import { check } from 'meteor/check';

import { Documents } from '../documents.js';

// Meteor.publish('all_document_folders_w_sid', function(simulationId) {
//   return liveDb.select(
//     `SELECT 
//         dfo.id AS folder_id, 
//         dfo.name AS folder_name,
//         dfo.folder_order AS folder_order,
//         dfo.simulation_id,
//         dfo.status AS folder_status,
//         d.id AS document_id,
//         d.name AS document_name,
//         d.status AS document_status,
//         d.document_order AS document_order,
//         d.has_pills AS has_pills,
//         d.pills AS pills,
//         d.medication_type AS medication_type,
//         d.pills_taken AS pills_taken,
//         d.pills_prescribed AS pills_prescribed,        
//         d.created AS document_created,        
//         d.modified AS document_modified,        
//         df.id AS document_file_id,
//         df.name AS document_file,
//         df.size AS size,
//         df.status AS document_file_status,
//         df.created AS document_file_created 
//      FROM (SELECT id, name, simulation_id, folder_order, status FROM craa_document_folders WHERE simulation_id = ` + liveDb.db.escape(simulationId) + `) AS dfo 
//      LEFT JOIN (SELECT id, name, folder_id, status, has_pills, medication_type, pills, pills_taken, pills_prescribed, document_order, created, modified FROM craa_documents) AS d ON dfo.id = d.folder_id 
//      LEFT JOIN (SELECT id, name, document_id, size, status, created FROM craa_document_files ORDER BY DATE(created) DESC) AS df 
//      ON df.document_id = d.id ORDER BY  dfo.folder_order, d.document_order`,
//      [
//        {
//           table: 'craa_document_folders'
//        },
//        {
//           table: 'craa_documents' 
//        },
//        {
//           table: 'craa_document_files'
//        }
//      ]
//     );
// });

// Meteor.publish('document_file_w_id', function(id) {
//   return liveDb.select(
//     `SELECT 
//         df.folder_id AS folder_id,
//         df.document_id AS document_id,
//         df.simulation_id AS simulation_id,
//         df.id AS document_file_id,
//         df.name AS document_file,
//         df.path AS document_path,
//         df.status AS document_file_status,
//         df.size AS size 
//      FROM craa_document_files AS df `,
//     [ { 
//         table: 'craa_document_files'
//     } ]
//   );
// });

// Meteor.publish('document_file_w_id', function(id) {
//   return liveDb.select(
//     `SELECT id, folder_id, document_id, simulation_id, name, path, status, size FROM craa_document_files WHERE 
//      id = ${liveDb.db.escape(id)}`,
//     [
//       {
//         table: 'craa_document_files',
//         condition: function(row, newRow, rowDeleted) {
//           // newRow provided on UPDATE query events
//           return row.id === id || (newRow && newRow.id === id);
//         }
//       }
//     ]
//   );
// });

// Meteor.publish('all_documents', function() {
  
//   return liveDb.select(
//     `SELECT id, name, document_order, folder_id, simulation_id, has_pills, 
//       medication_type, pills, pills_taken, pills_prescribed, status, created, modified 
//       FROM craa_documents`,
//     [
//       {
//         table: 'craa_documents'
//         // condition: function(row, newRow, rowDeleted) {
//         //   // newRow provided on UPDATE query events
//         //   return row.simulation_id === sid || (newRow && newRow.simulation_id === sid);
//         // }
//       }
//     ]
//   );
// });

// Meteor.publish('all_active_documents', function() {
  
//   return liveDb.select(
//     `SELECT id, name, document_order, folder_id, simulation_id, has_pills, status 
//       FROM craa_documents 
//       WHERE status = 1 `,
//     [
//       {
//         table: 'craa_documents'
//         // condition: function(row, newRow, rowDeleted) {
//         //   // newRow provided on UPDATE query events
//         //   return row.simulation_id === sid || (newRow && newRow.simulation_id === sid);
//         // }
//       }
//     ]
//   );
// });

// Meteor.publish('all_documents', function() {
  
//   return liveDb.select(
//     `SELECT id, name, document_order, folder_id, simulation_id, has_pills, status 
//       FROM craa_documents 
//       WHERE status = 1 
//       AND ( has_pills <> 1 OR has_pills IS NULL)`,
//     [
//       {
//         table: 'craa_documents'
//         // condition: function(row, newRow, rowDeleted) {
//         //   // newRow provided on UPDATE query events
//         //   return row.simulation_id === sid || (newRow && newRow.simulation_id === sid);
//         // }
//       }
//     ]
//   );
// });

// Meteor.publish('documents_w_sid', function(sid) {
  
//   return liveDb.select(
//     `SELECT id, name, document_order, folder_id, simulation_id, has_pills, status 
//       FROM craa_documents 
//       WHERE simulation_id = ${liveDb.db.escape(sid)} AND status = 1 
//       AND ( has_pills <> 1 OR has_pills IS NULL)`,
//     [
//       {
//         table: 'craa_documents'
//         // condition: function(row, newRow, rowDeleted) {
//         //   // newRow provided on UPDATE query events
//         //   return row.simulation_id === sid || (newRow && newRow.simulation_id === sid);
//         // }
//       }
//     ]
//   );
// });

Meteor.publish('documents_w_sid', function(sid) {
  check(sid, Number)

  return Documents.find({
    simulation_id: sid
  }, {
    sort: {
      document_order: 1
    }
  })
})

Meteor.publish('all_active_documents', function() {
  return Documents.find({
    status: 1
  }, {
    sort: {
      document_order: 1
    }
  })
})

Meteor.publish('active_documents_w_sid', function(sid) {
  check(sid, Number)

  return Documents.find({
    simulation_id: sid,
    status: 1
  }, {
    sort: {
      document_order: 1
    }
  })
})

