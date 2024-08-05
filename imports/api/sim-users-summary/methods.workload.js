import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { SimUsersSummary } from './sim-users-summary.js';

Meteor.methods({
  "SimUsersSummary.scored.count"() {    

    // this.unblock()

    let output = Meteor.wrapAsync((arg, callback) => {

      let pipelineCountScoredSimulations = 
      [
        {
          $match: {
            checked: true,
            $or: [
              { resultStage: 'Published' },
              { resultStage: 'Exported' },
              { resultStage: 'Distributed' }
            ]
          }
        },
        {
          $lookup: {
            from: 'scoring_temp_timer_log',
            localField: 'assessmentId',
            foreignField: 'assessment_id',
            as: 'sttl' 
          }
        },
        {
          $unwind: "$sttl"
        },        
        {
          $group: {
            "_id": "$simulationId",
            "simulationName": { $first: "$simulationName"},
            "pauseTimeRaw": {
              $addToSet: "$sttl.pause_time_raw"
            },            
            "count": { $sum: 1 }
          }
        },
        // {
        //   $group: {
        //     _id: "$_id",
        //     // pauseTimeRaw: { $first: "$pauseTimeRaw" },
        //     // count1: { $first: "$count" },
        //     total: { $sum: "$count" }
        //   }
        // },
        // {
        //   $unwind: "$pauseTimeRaw"
        // },
        // {
        //   $sort: { "pauseTimeRaw": 1 }
        // },
        // {
        //   $group: {
        //     "_id": "$simulationId",
        //     "simulationName": { $first: "$simulationName"},
        //     "pauseTimeRaw": {
        //       $push: "$sttl.pause_time_raw"
        //     },            
        //     "count": { $sum: 1 }
        //   }
        // },        
        {
         $project: {
            "_id": 0,
            sid: "$_id",
            sname: "$simulationName",
            pauseTimeRaw: 1,
            count: 1
            // total: 1
          }        
        }                     
      ]
      
      let 
        _sims = Promise.await(SimUsersSummary.rawCollection().aggregate(pipelineCountScoredSimulations).toArray()),
        _mySims = {sims: _sims, total: 0};

      if(_sims && _sims.length > 0) {
        _sims.forEach((s) => {
          _mySims.total += s.count;
        })
      }

      callback(null, {success: true, data: _mySims})
    })

    let result = output('dq')

    if(result) {
      return result
    }   
  } 
});

