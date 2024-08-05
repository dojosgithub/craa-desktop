import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Util } from '/imports/lib/server/util.js'

import { Scorings } from '/imports/api/scorings/scorings.js';
import { Assessments } from '/imports/api/assessments/assessments.js';
import { SimUsersSummary } from '/imports/api/sim-users-summary/sim-users-summary.js';

Meteor.methods({
  'Scorings.lastScored'() {
    // check(obj, {
    //   scorerIds: Array
    // })

    // this.unblock()

    let output = Meteor.wrapAsync((arg, callback) => {
    
      let _initScorers = Meteor.users.find({
        'profile.role': '7',
        'profile.status': 1
      }, {
        fields: {
          _id: 1
        }
      }).fetch().map((s) => {
        return s._id;
      });

      if(_initScorers && _initScorers.length > 0) {        

        _initScorers.forEach((s) => {

          let _lastScoredObj = {
            assessmentId: null,
            simulationName: null,
            simulationId: null,
            scoredAt: null,
            type: 1            
          }

          let $_or = [
            { scorer1Id: s, scorer1Status: 'Scored'},
            { scorer2Id: s, scorer2Status: 'Scored'}
          ]

          // console.log($_or);

          let _sus = SimUsersSummary.find({
            $or: $_or
          }, {
            sort: {
              submittedAt: -1
            },
            limit: 1,
            fields: {
              assessmentId: 1,
              simulationId: 1,
              simulationName: 1,
              scorer1Id: 1,
              scorer2Id: 1
            }
          }).fetch();

          // console.log(_sus);

          if(_sus && _sus.length ===1) {
            let 
              _mySUS = _sus[0],
              _asmtId = _mySUS.assessmentId,
              _sid = _mySUS.simulationId,
              _sName = _mySUS.simulationName,
              _scorer1or2 = 1;

            if(_mySUS.scorer2Id === s) {
              _scorer1or2 = 2;
            }

            let 
              _asmt = Assessments.findOne(_asmtId),
              _scoredAt = null;

            if(_asmt) {
              if(_scorer1or2 === 1 && _asmt.assessor1.scored) {
                _scoredAt = _asmt.assessor1.scoredAt;
              }
              else if(_scorer1or2 === 2 && _asmt.assessor2.scored) {
                _scoredAt = _asmt.assessor2.scoredAt;
              }

              _lastScoredObj = {
                assessmentId: _asmtId,
                simulationName: _sName,
                simulationId: _sid,
                scoredAt: _scoredAt,
                type: _scorer1or2                
              }

              Meteor.users.update(s, {
                $set: {
                  'profile.workload.lastScored': _lastScoredObj
                }
              });              
            }
          }
        })
      } //-- if(_initScorers && _initScorers.length > 0) {

      callback(null, {success: true, data: _initScorers});
            
    });

    let result = output('dq')

    if(result) {
      return result
    }
  }  
  // 'Scorings.lastScored0'() {
  //   // check(obj, {
  //   //   scorerIds: Array
  //   // })

  //   this.unblock()

  //   let output = Meteor.wrapAsync((arg, callback) => {
    
  //     // let _scorers = Meteor.users.find({
  //     //   'profile.role': '7',
  //     //   'profile.status': 1
  //     // }, {
  //     //   fields: {
  //     //     _id: 1
  //     //   }
  //     // }).fetch().map((s) => {
  //     //   return s._id;
  //     // });

  //     let pipelineScorers = 
  //     [
  //       {
  //         $match: {
  //           'profile.role': '7',
  //           'profile.status': 1            
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: 'sim_users_summary',
  //           let: { 
  //             uid: '$_id'
  //           },
  //           pipeline: [
  //             {
  //               $match: {
  //                 'simStatus': 'Completed',
  //                 $expr: {
  //                   $or: [
  //                     { $eq: ['$scorer1Id', '$$uid'] },
  //                     { $eq: ['$scorer2Id', '$$uid'] }                      
  //                   ]
  //                 },
  //                 $expr: {
  //                   $and: [
  //                     { $eq: ['$scorer1Status', 'Scored'] },
  //                     { $eq: ['$scorer2Status', 'Scored'] }                      
  //                   ]                    
  //                 }
  //               }
  //             },
  //           ],
  //           as: 'sus'
  //         }
  //       },
  //       {
  //         $unwind: "$sus"
  //       },
  //       // {
  //       //   $lookup: {
  //       //     from: "scorings",
  //       //     localField: "sus.assessmentId",
  //       //     foreignField: "assessment_id",
  //       //     as: 'scorings'
  //       //   }
  //       // },
  //       // {
  //       //   $unwind: "$scorings"
  //       // },
  //       {
  //         $group: {
  //           "_id": "$_id",
  //           "sus": { $last: "$sus" },
  //           // "scoredAt": { $first: "$scorings.modifiedAt" }
  //           // "submittedAt": { $first: "$sus.submittedAt" },
  //           // "dueDate": { $first: "$sus.dueDate" }
  //         }
  //       },
  //       {
  //         $project: {
  //           _id: 0,
  //           uid: "$_id",
  //           sus: "$sus",
  //           // scoredAt: "$scoredAt"
  //           // submittedAt: "$submittedAt",
  //           // dueDate: "$dueDate"
  //         }
  //       },
  //       // {
  //       //   $sort: {
  //       //     // "scoredAt": -1
  //       //     "sus.submittedAt": -1,
  //       //     "sus.dueDate": -1
  //       //   }
  //       // }
  //     ]

  //     let _scorers = Promise.await(Meteor.users.rawCollection().aggregate(pipelineScorers).toArray()) 
  //     // let _scorers = Meteor.users.rawCollection().aggregate(pipelineScorers).toArray(); 
  //       // .map((u) => {
  //       //   return u.uid;
  //       // })

  //     console.log(_scorers);

  //     callback(null, {success: true, data: _scorers});

  //     // let pipelineLastScored = 
  //     // [
  //     //   {
  //     //     $lookup: {
  //     //       from: "sim_users_summary",
  //     //       localField: "assessment_id",
  //     //       foreignField: "assessmentId",
  //     //       as: "sus"            
  //     //     }
  //     //   },
  //     //   {
  //     //     $unwind: "$sus"
  //     //   },
  //     //   {
  //     //     $group: {
  //     //       "_id": {
  //     //         assessmentId: "$assessment_id",
  //     //         scorerId: "$assessor._id"
  //     //       },
  //     //       "scoredAt": { $first: "$modifiedAt"},
  //     //       "sus": { $first: "$sus" }
  //     //     }
  //     //   },
  //     //   {
  //     //    $project: {
  //     //       "_id": 0,
  //     //       assessmentId: "$_id.assessmentId",
  //     //       scorerId: "$_id.scorerId",
  //     //       scoredAt: "$scoredAt",
  //     //       sus: "$sus"         
  //     //     }        
  //     //   },
  //     //   {
  //     //     $sort: {
  //     //       "scoredAt": -1
  //     //     }
  //     //   },
  //     //   // {
  //     //   //   $limit: 30
  //     //   // }                     
  //     // ]
      
  //     // let _scorings = Promise.await(Scorings.rawCollection().aggregate(pipelineLastScored).toArray());
    
  //     // if(_scorings && _scorings.length > 0) {

  //     //   // let _scorers = Meteor.users.find({
  //     //   //   'profile.role': '7',
  //     //   //   'profile.status': 1
  //     //   // }, {
  //     //   //   fields: {
  //     //   //     _id: 1
  //     //   //   }
  //     //   // }).fetch().map((s) => {
  //     //   //   return s._id;
  //     //   // });

  //     //   // console.log(_scorers);

  //     //   let _myScorings = [];

  //     //   _scorings.forEach((s,i) => {
  //     //     if(_scorers.includes(s.scorerId)) {
  //     //       _myScorings.push(s);
  //     //       _scorers = _scorers.filter((v) => {
  //     //         return v !== s.scorerId;
  //     //       })
  //     //     }
  //     //     // console.log(_scorers);
  //     //     console.log(i)
  //     //     if(_scorers.length === 0) {
  //     //       // callback(null, {success: true, data: _myScorings});
  //     //       _scorings = [];
  //     //       // callback(null, {success: true, data: _myScorings});
  //     //       return true;          
  //     //     }
  //     //   });

  //     //   if(_scorers.length === 0) {
  //     //     callback(null, {success: true, data: _myScorings});
  //     //   }

  //     //   // callback(null, {success: true, data: _myScorings})

  //     // }

  //     // callback(null, {success: true, data: _scorings})
            
  //   });

  //   let result = output('dq')

  //   if(result) {
  //     return result
  //   }
  // }
});
