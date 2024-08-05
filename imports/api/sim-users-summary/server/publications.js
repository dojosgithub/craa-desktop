import { check, Match } from 'meteor/check';

import { SimUsersSummary } from '../sim-users-summary.js';
import { MonitoringNotes } from '/imports/api/monitoring-notes/monitoring-notes.js'
import { ScoringTempTimerLog } from '/imports/api/scoring-temp-timer-log/scoring-temp-timer-log.js';
import { NonErrors } from '/imports/api/non-errors/non-errors.js';
import { ScoringAdjudication } from '/imports/api/scoring-adjudication/scoring-adjudication.js';

Meteor.publish("sim_users_summary_by_assessment_id", function(assessment_id) {
  return SimUsersSummary.find({
    assessmentId: assessment_id
  })
});

Meteor.publish("sim_users_summary_w_qa", function() {
  return SimUsersSummary.find({
    qa: 1
  }, {
    sort: {
      simulationName: 1,
      firstname: 1
    }
  })
});

Meteor.publishComposite("sus_w_scoring_temp_timer_log", function (tableName, ids, fields) {
  check(tableName, String);
  check(ids, Array);
  check(fields, Match.Optional(Object));

  // this.unblock();

  return {
    find: function () {
      // this.unblock();

      return SimUsersSummary.find({
        _id: {$in: ids}        
      }, {
        fields: fields,
        sort: {
          modifiedAt: -1
        }
      });
    },
    children: [
      {
        find: function(sus) {
          // this.unblock(); // requires meteorhacks:unblock package (dqk 11/12/2020, meteorhacks causes error, so, will have to find alternative solution on this)
          // Publish the related user
      // if(trUserLog.uid && Meteor.users.findOne(trUserLog.uid).profile.role !== '6') {
      //   return []
      // }
          // console.log(sus)
          if(sus && sus.assessmentId) {
            return ScoringTempTimerLog.find({
              assessment_id: sus.assessmentId            
            }, {
              // limit: 1, 
              fields: {
                assessment_id: 1,
                pause_time: 1,
                assessor_type: 1,
                assessor_id: 1
              }, 
              // sort: {
              //   _id: 1
              // }
            });
          }
        },
        children: [{
          find: function(sttl) {
            // this.unblock();

            if(sttl && sttl.assessment_id) {
              return NonErrors.find({
                assessment_id: sttl.assessment_id,              
              }, {              
                fields: {
                  assessment_id: 1,
                  status: 1
                }, 
              });
            }
          },
          // children: [{
          //   find: function(sttl) {
          //     // console.log(ne)
          //     this.unblock();
          //     return ScoringAdjudication.find({
          //       assessment_id: sttl.assessment_id,              
          //     }, {              
          //       fields: {
          //         assessment_id: 1,
          //         status: 1
          //       }, 
          //     });
          //   },           
          // }]          
        },
        {
          find: function(sttl) {
            // console.log(sttl)
            // this.unblock();
            return ScoringAdjudication.find({
              assessment_id: sttl.assessment_id,              
            }, {              
              fields: {
                assessment_id: 1,
                status: 1,
                behaviors: 1
              }, 
            });
          },           
        }]
       
      },
      {
        find: function(sus) {
          // this.unblock();

          if(sus) {
            return MonitoringNotes.find({
              creator: sus.userId,
              client_id: sus.clientId,
              bu_id: sus.buId,
              simulation_id: sus.simulationId.toString(),
              status: 1           
            }, {
              // limit: 1, 
              // fields: {

              // }, 
              // sort: {
              //   _id: 1
              // }
            });
          }
        },        
      }     
    ]
  };
});

Meteor.publishComposite("sus_4_scoring_qa", function (tableName, ids, fields) {
  check(tableName, String);
  check(ids, Array);
  check(fields, Match.Optional(Object));

  // this.unblock();

  return {
    find: function () {
      // this.unblock();

      return SimUsersSummary.find({
        _id: {$in: ids}        
      }, {
        fields: fields,
        sort: {
          modifiedAt: -1
        }
      });
    },
    children: [
      {
        find: function(sus) {
          // this.unblock(); // requires meteorhacks:unblock package (dqk 11/12/2020, meteorhacks causes error, so, will have to find alternative solution on this)
          // Publish the related user
      // if(trUserLog.uid && Meteor.users.findOne(trUserLog.uid).profile.role !== '6') {
      //   return []
      // }
          // console.log(sus)
          if(sus && sus.assessmentId) {
            return ScoringTempTimerLog.find({
              assessment_id: sus.assessmentId            
            }, {
              // limit: 1, 
              fields: {
                assessment_id: 1,
                pause_time: 1,
                assessor_type: 1,
                assessor_id: 1
              }, 
              // sort: {
              //   _id: 1
              // }
            });
          }
        },
        // find: function(sus) {
        //   return Meteor.users.find({
        //     _id: { $in: sus.qaScorers}
        //   }, {
        //     fields: {
        //       'profile.firstname': 1,
        //       'profile.lastname': 1,
        //       'profile.fullname': 1
        //     }
        //   })
        // },
        children: [{
          find: function(sttl) {
            // this.unblock();
            if(sttl && sttl.assessment_id) {
              return NonErrors.find({
                assessment_id: sttl.assessment_id,              
              }, {              
                fields: {
                  assessment_id: 1,
                  status: 1
                }, 
              });
            } 
          },
          // children: [{
          //   find: function(sttl) {
          //     // console.log(ne)
          //     this.unblock();
          //     return ScoringAdjudication.find({
          //       assessment_id: sttl.assessment_id,              
          //     }, {              
          //       fields: {
          //         assessment_id: 1,
          //         status: 1
          //       }, 
          //     });
          //   },           
          // }]          
        },
        // {
        //   find: function(sttl) {
        //     // console.log(sttl)
        //     this.unblock();
        //     return ScoringAdjudication.find({
        //       assessment_id: sttl.assessment_id,              
        //     }, {              
        //       fields: {
        //         assessment_id: 1,
        //         status: 1,
        //         behaviors: 1
        //       }, 
        //     });
        //   },           
        // }
        ]
       
      },
      {
        find: function(sus) {
          // this.unblock();

          if(sus) {
            return MonitoringNotes.find({
              creator: sus.userId,
              client_id: sus.clientId,
              bu_id: sus.buId,
              simulation_id: sus.simulationId.toString(),
              status: 1           
            }, {
              // limit: 1, 
              // fields: {

              // }, 
              // sort: {
              //   _id: 1
              // }
            });

          }
        },        
      }     
    ]
  };
});
