import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

var moment = require('moment');

import { Util } from '/imports/lib/server/util.js'

import { UsersSummary } from '/imports/api/users-summary/users-summary.js'
import { UsersDemographic } from '/imports/api/users-demographic/users-demographic.js'
import { Assessments } from '/imports/api/assessments/assessments.js'
import { SimUsersSummary } from '/imports/api/sim-users-summary/sim-users-summary.js'
import { Scorings } from '/imports/api/scorings/scorings.js'
import { UsersScoreSummary } from '/imports/api/users-score-summary/users-score-summary.js'
import { MonitoringNotes } from '/imports/api/monitoring-notes/monitoring-notes.js'
import { ComplianceNotes } from '/imports/api/compliance-notes/compliance-notes.js'

import { TimerLog, TempTimerLog } from '/imports/api/logs/logs.js'

// import { V1UsersRaw, V1AssessmentsRaw, V1ScoringsRaw, V1DocumentsRaw, V1CommentsRaw } from './v1-raw-collections.js';
import { V1UsersTemp , _v1Users, V1UsersSummaryTemp, V1UsersDemographicTemp, V1AssessmentsTemp, 
          V1SimUsersSummaryTemp, V1ScoringsTemp, V1UsersScoreSummaryTemp,
          V1MonitoringNotesTemp, V1ComplianceNotesTemp, V1TimerLogTemp, V1TempTimerLogTemp } 
          from './v12-temp-collections.js';

Meteor.methods({
  "ETL.V1SimUsersSummaryTemp.createTimerTemp"() {
    // this.unblock();

    let output = Meteor.wrapAsync((args, callback) => {

      let _sus = V1SimUsersSummaryTemp.find({
        clientId: 'EGHYDswSwfjXktdjP',
        // buId: 'EGHYDswSwfjXktdjP-1470499457014',
        simulationId: 10,
        v1: true      
      }).fetch()

      if(_sus && _sus.length > 0) {
        _sus.forEach((s, i) => {
          let _timerObj = {
            assessee_id: s.userId, 
            client_id: s.clientId,
            bu_id: s.buId,
            simulation_id: s.simulationId,
            pause_time: [s.pauseTime],
            pause_time_raw: [s.pauseTimeRaw],
            _pause_time: s.pauseTime,
            _pause_time_raw: s.pauseTimeRaw,
            duration: s.duration,
            createdAt: s.oStartedAt,
            modifiedAt: s.submittedAt,
            status: 1,
            v1UserId: s.v1UserId,
            v1: true
          };

          let _tl = V1TimerLogTemp.upsert({
            assessee_id: s.userId, 
            client_id: s.clientId,
            bu_id: s.buId,
            simulation_id: s.simulationId,          
          }, {
            $set: {          
              pause_time: [s.pauseTime],
              pause_time_raw: [s.pauseTimeRaw],
              _pause_time: s.pauseTime,
              _pause_time_raw: s.pauseTimeRaw,
              duration: s.duration,
              createdAt: s.oStartedAt,
              modifiedAt: s.submittedAt,
              status: 1,
              v1UserId: s.v1UserId,
              v1: true            
            }
          })

          if(_tl.insertedId) {
            // _timerObj['tl_id'] = _tl.insertedId;

            V1TempTimerLogTemp.upsert({
              assessee_id: s.userId, 
              client_id: s.clientId,
              bu_id: s.buId,
              simulation_id: s.simulationId,
            }, {
              $set: {
                tl_id: _tl.insertedId,
                pause_time: [s.pauseTime],
                pause_time_raw: [s.pauseTimeRaw],
                _pause_time: s.pauseTime,
                _pause_time_raw: s.pauseTimeRaw,
                duration: s.duration,
                createdAt: s.oStartedAt,
                modifiedAt: s.submittedAt,
                status: 1,
                v1UserId: s.v1UserId,
                v1: true               
              }
            })
          }

          if(i === _sus.length -1) {
            callback(null, {success: true, data: _sus.length});
          }

        }) //-- _sus.forEach((s, i) => {

      } //-- if(_sus && _sus.length > 0) {

    }) //-- let output = Meteor.wrapAsync((args, callback) => {

    let result = output('dq');

    if(result) {
      return result
    }      
    
  },  
  "ETL.V1UsersTemp.v2Users"() {
    // this.unblock();

    let output = Meteor.wrapAsync((args, callback) => {

      let _v1_users = V1UsersTemp.find().fetch()
      let _insertedUsers = insertBatch(Meteor.users, _v1_users)

      let dupUsers = dupUserCheck(_v1_users);

      // _leftOvers = V1UsersTemp.find({ _id: { $nin: _insertedUsers }}).fetch()

      callback(null, { success: true, data: [_insertedUsers, dupUsers] });
    })

    let result = output('dq');

    if(result) {
      return result
    }
  },
  "ETL.V1UsersSummaryTemp.v2UsersSummary"() {
    // this.unblock();

    let output = Meteor.wrapAsync((args, callback) => {

      let _v1_users_summary = V1UsersSummaryTemp.find().fetch()
      let _insertedUsers = insertBatch(UsersSummary, _v1_users_summary)
      
      // _leftOvers = V1UsersTemp.find({ _id: { $nin: _insertedUsers }}).fetch()

      callback(null, { success: true, data: _insertedUsers });
    })

    let result = output('dq');

    if(result) {
      return result
    }
  },
  "ETL.V1UsersDemographicTemp.v2UsersDemographic"() {
    // this.unblock();

    let output = Meteor.wrapAsync((args, callback) => {

      let _v1_users_demographic = V1UsersDemographicTemp.find().fetch()
      let _insertedUsers = insertBatch(UsersDemographic, _v1_users_demographic)
      
      // _leftOvers = V1UsersTemp.find({ _id: { $nin: _insertedUsers }}).fetch()

      callback(null, { success: true, data: _insertedUsers });
    })

    let result = output('dq');

    if(result) {
      return result
    }
  },
  "ETL.V1AssessmentsTemp.v2Assessments"() {
    // this.unblock();

    let output = Meteor.wrapAsync((args, callback) => {

      let _v1_assessments = V1AssessmentsTemp.find().fetch()
      let _inserted = insertBatch(Assessments, _v1_assessments)
      
      // _leftOvers = V1UsersTemp.find({ _id: { $nin: _insertedUsers }}).fetch()

      callback(null, { success: true, data: _inserted });
    })

    let result = output('dq');

    if(result) {
      return result
    }
  },
  "ETL.V1SimUsersSummaryTemp.v2SimUsersSummary"() {
    // this.unblock();

    let output = Meteor.wrapAsync((args, callback) => {

      let _v1_sim_users_summary = V1SimUsersSummaryTemp.find().fetch()
      let _inserted = insertBatch(SimUsersSummary, _v1_sim_users_summary)
      
      // _leftOvers = V1UsersTemp.find({ _id: { $nin: _insertedUsers }}).fetch()

      callback(null, { success: true, data: _inserted });
    })

    let result = output('dq');

    if(result) {
      return result
    }
  },
  "ETL.V1UsersScoreSummaryTemp.v2UsersScoreSummary"() {
    // this.unblock();

    let output = Meteor.wrapAsync((args, callback) => {

      let _v1_users_score_summary = V1UsersScoreSummaryTemp.find().fetch()
      let _inserted = insertBatch(UsersScoreSummary, _v1_users_score_summary)
      
      // _leftOvers = V1UsersTemp.find({ _id: { $nin: _insertedUsers }}).fetch()

      callback(null, { success: true, data: _inserted });
    })

    let result = output('dq');

    if(result) {
      return result
    }
  },
  "ETL.V1MonitoringNotesTemp.v2MonitoringNotes"() {
    // this.unblock();

    let output = Meteor.wrapAsync((args, callback) => {

      let _v1_monitoring_notes = V1MonitoringNotesTemp.find().fetch()
      let _inserted = insertBatch(MonitoringNotes, _v1_monitoring_notes)
      
      // _leftOvers = V1UsersTemp.find({ _id: { $nin: _insertedUsers }}).fetch()

      callback(null, { success: true, data: _inserted });
    })

    let result = output('dq');

    if(result) {
      return result
    }
  },
  "ETL.V1ComplianceNotesTemp.v2ComplianceNotes"() {
    // this.unblock();

    let output = Meteor.wrapAsync((args, callback) => {

      let _v1_compliance_notes = V1ComplianceNotesTemp.find().fetch()
      let _inserted = insertBatch(ComplianceNotes, _v1_compliance_notes)
      
      // _leftOvers = V1UsersTemp.find({ _id: { $nin: _insertedUsers }}).fetch()

      callback(null, { success: true, data: _inserted });
    })

    let result = output('dq');

    if(result) {
      return result
    }
  },
  "ETL.V1TimerLogTemp.v2TimerLog"() {
    // this.unblock();

    let output = Meteor.wrapAsync((args, callback) => {

      let _v1_timer_log = V1TimerLogTemp.find().fetch()
      let _inserted = insertBatch(TimerLog, _v1_timer_log)
      
      // _leftOvers = V1UsersTemp.find({ _id: { $nin: _insertedUsers }}).fetch()

      callback(null, { success: true, data: _inserted });
    })

    let result = output('dq');

    if(result) {
      return result
    }
  },
  "ETL.V1TempTimerLogTemp.v2TempTimerLog"() {
    // this.unblock();

    let output = Meteor.wrapAsync((args, callback) => {

      let _v1_temp_timer_log = V1TempTimerLogTemp.find().fetch()
      let _inserted = insertBatch(TempTimerLog, _v1_temp_timer_log)
      
      // _leftOvers = V1UsersTemp.find({ _id: { $nin: _insertedUsers }}).fetch()

      callback(null, { success: true, data: _inserted });
    })

    let result = output('dq');

    if(result) {
      return result
    }
  }, 
  "ETL.V1UsersTemp.duplicated"() {
    // this.unblock();

    let output = Meteor.wrapAsync((args, callback) => {      

      let
        _removeData = true, 
        dupUsers = [];

      let _sus = SimUsersSummary.find({
        v1: true
      }).fetch();

      if(_sus && _sus.length > 0) {
        _sus.forEach((s) => {
          let _user = Meteor.users.findOne({
            'emails.0.address': s.email,
            'profile.v1': { $ne: true }
          });

          if(_user) {
            dupUsers.push(_s)

            // let _uid = _user._id;

            // let _v2SUS = SimUsersSummary.findOne({
            //   userId: _uid,
            //   simulationId: _sus.simulationId,
            //   simStatus: { $ne: 'Completed'}
            // })
// 
//             if(_v2SUS) {
//               //-- if v2 sim has not been submitted yet, replace v1's user id with 
//               //-- v2 user id
//               if(_v2SUS.simStatus !== 'Completed') {
//                 
//               } else {
// 
//               }
//             }

            if(_removeData) {
              UsersSummary.remove({ userId: s.userId, v1: true });
              UsersDemographic.remove({ uid: s.userId, v1: true});
              Assessments.remove({ assessee_id: s.userId, v1: true});
              SimUsersSummary.remove({ userId: s.userId, v1: true})
              Scorings.remove({ assessment_id: s.assessmentId, v1: true});
              UsersScoreSummary.remove({ assessee_id: s.userId, v1: true});
              MonitoringNotes.remove({ creator: s.userId, v1: true});
              ComplianceNotes.remove({ creator: s.userId, v1: true});
            }

          }          
        })
      }

      callback(null, {success: true, data: dupUsers});

    })

    let result = output('dq');

    if(result) {
      return result
    }
  },  
  "ETL.V1Temp.remove"() {
    // this.unblock();

    let _removeData = true;

    let _dataToReturn = {};

    let output = Meteor.wrapAsync((args, callback) => {      

      if(_removeData) {
        V1UsersTemp.remove({'profile.v1': true});
        V1UsersSummaryTemp.remove({v1: true});
        V1UsersDemographicTemp.remove({v1: true});
        V1AssessmentsTemp.remove({v1: true});
        V1SimUsersSummaryTemp.remove({v1: true})
        V1ScoringsTemp.remove({v1: true});
        V1UsersScoreSummaryTemp.remove({v1: true});
        V1MonitoringNotesTemp.remove({v1: true});
        V1ComplianceNotesTemp.remove({v1: true});
        V1TimerLogTemp.remove({v1: true});
        V1TempTimerLogTemp.remove({v1: true});
      }

      callback(null, {success: true, data: _dataToReturn});
    })

    let result = output('dq');

    if(result) {
      return result
    }
  },             
  "ETL.V1Temp.removeFromV2"() {
    // this.unblock();

    let _removeData = true;

    let _dataToReturn = {};

    let output = Meteor.wrapAsync((args, callback) => {

      let 
        _uV1Data = Meteor.users.find({'profile.v1': true}).fetch(),
        _usV1Data = UsersSummary.find({v1: true}).fetch(),
        _udV1Data = UsersDemographic.find({v1: true}).fetch(),
        _aV1Data = Assessments.find({v1: true}).fetch(),
        _susV1Data = SimUsersSummary.find({v1: true}).fetch(),
        _sV1Data = Scorings.find({v1: true}).fetch(),
        _ussV1Data = UsersScoreSummary.find({v1: true}).fetch(),
        _mnV1Data = MonitoringNotes.find({v1: true}).fetch(),
        _cnV1Data = ComplianceNotes.find({v1: true}).fetch();        

      _dataToReturn = {
        users: _uV1Data,
        usersSummary: _usV1Data,
        usersDemograpic: _udV1Data,
        assessments: _aV1Data,
        simUsersSummary: _susV1Data,
        scorings: _sV1Data,
        usersScoreSummary: _ussV1Data,
        monitoringNotes: _mnV1Data,
        complianceNotes: _cnV1Data
      };      

      if(_removeData) {
        Meteor.users.remove({'profile.v1': true});
        UsersSummary.remove({v1: true});
        UsersDemographic.remove({v1: true});
        Assessments.remove({v1: true});
        SimUsersSummary.remove({v1: true})
        Scorings.remove({v1: true});
        UsersScoreSummary.remove({v1: true});
        MonitoringNotes.remove({v1: true});
        ComplianceNotes.remove({v1: true});
      }

      callback(null, {success: true, data: _dataToReturn});
    })

    let result = output('dq');

    if(result) {
      return result
    }
  },  
})

//-- v1 users with same Email should be checked as they cannot be 
//-- added to v2 users collection.
function dupUserCheck(users) {   
    
  let dupUsers = [];

  users.forEach(function(doc) {
    let 
      id = doc._id,
      email = doc.emails[0].address;
    
    let _user = Meteor.users.findOne({
      'emails.0.address': email,
      'profile.v1': { $ne: true }
    });

    if(_user) {
      dupUsers.push(_user);
    }
  });

  return dupUsers;  
}

function insertBatch(collection, documents) {
  var bulkInsert = collection.rawCollection().initializeUnorderedBulkOp();
  var insertedIds = [], notInsertedIds = [];
  var id;
  documents.forEach(function(doc) {
    id = doc._id;
    // Insert without raising an error for duplicates
    bulkInsert.find({_id: id}).upsert().replaceOne(doc);
    insertedIds.push(id);
  });
  bulkInsert.execute();
  return insertedIds;  
}

function deleteBatch(collection, documents) {
  var bulkRemove = collection.rawCollection().initializeUnorderedBulkOp();
  documents.forEach(function(doc) {
    bulkRemove.find({_id: doc._id}).removeOne();
  });
  bulkRemove.execute();
}

function moveDocuments(sourceCollection, targetCollection, filter, batchSize) {
  print("Moving " + sourceCollection.find(filter).count() + " documents from " + sourceCollection + " to " + targetCollection);
  var count;
  while ((count = sourceCollection.find(filter).count()) > 0) {
    print(count + " documents remaining");
    sourceDocs = sourceCollection.find(filter).limit(batchSize);
    idsOfCopiedDocs = insertBatch(targetCollection, sourceDocs);

    targetDocs = targetCollection.find({_id: {$in: idsOfCopiedDocs}});
    deleteBatch(sourceCollection, targetDocs);
  }
  print("Done!")
}

// function insertBatch(collection, documents) {
//   var bulkInsert = collection.initializeUnorderedBulkOp();
//   var insertedIds = [];
//   var id;
//   documents.forEach(function(doc) {
//     id = doc._id;
//     // Insert without raising an error for duplicates
//     bulkInsert.find({_id: id}).upsert().replaceOne(doc);
//     insertedIds.push(id);
//   });
//   bulkInsert.execute();
//   return insertedIds;
// }
// 
// function deleteBatch(collection, documents) {
//   var bulkRemove = collection.initializeUnorderedBulkOp();
//   documents.forEach(function(doc) {
//     bulkRemove.find({_id: doc._id}).removeOne();
//   });
//   bulkRemove.execute();
// }
// 
// function moveDocuments(sourceCollection, targetCollection, filter, batchSize) {
//   print("Moving " + sourceCollection.find(filter).count() + " documents from " + sourceCollection + " to " + targetCollection);
//   var count;
//   while ((count = sourceCollection.find(filter).count()) > 0) {
//     print(count + " documents remaining");
//     sourceDocs = sourceCollection.find(filter).limit(batchSize);
//     idsOfCopiedDocs = insertBatch(targetCollection, sourceDocs);
// 
//     targetDocs = targetCollection.find({_id: {$in: idsOfCopiedDocs}});
//     deleteBatch(sourceCollection, targetDocs);
//   }
//   print("Done!")
// }

