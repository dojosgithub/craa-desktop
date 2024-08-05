import { check } from 'meteor/check'

import { Util } from '/imports/lib/server/util.js'

import { CollaborationAudit } from './collaboration-audit.js';
import { CollaborationAuditLog } from './collaboration-audit-log.js';

Meteor.methods({
  "ETL.CollaborationAudit.removedDuplicatedPairs"() {    

    let output = Meteor.wrapAsync((obj, callback) => {

        let pipelineSUS = 
        [
          {
            $match: {
                collAudit: true
            }
          },
          {
            $group: {
                _id: {
                    
                }
            }
          },
          {
           $project: {
              id: 1,
              simulation_id: 1,
              finding: 1,
              order: { "$ifNull": [ "$order", 999 ] }          
            }        
          },
          {
            $sort: { "order": 1 }
          }                     
        ]
  
        // let _findings = aggregateQueryFindings(pipelineFindings, {cursor: {}});
        let _sus = Promise.await(SimUsersSummary.rawCollection().aggregate(pipelineSUS).toArray());        

        callback(null, { success: true});
    
    })

    let result = output(params);

    if(result) {
        return result
    }        

  },

});
