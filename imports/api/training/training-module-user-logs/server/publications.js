import { check, Match } from 'meteor/check';

import { TrainingModuleUserLogs } from '../training-module-user-logs.js';
import { TrainingModules } from '/imports/api/training/training-modules/training-modules.js';

Meteor.publish("all_trainee_logs", () => {

  return TrainingModuleUserLogs.find({
    uid: {$ne: null}
  })
})

Meteor.publishComposite("training_module_user_logs_w_users", function (tableName, ids, fields) {
  check(tableName, String);
  check(ids, Array);
  check(fields, Match.Optional(Object));

  // this.unblock();

  return {
    find: function () {
      // this.unblock();
      
      // if (!Roles.userIsInRole(this.userId, 'admin')) {
      //   return [];
      // }

      return TrainingModuleUserLogs.find({
        _id: {$in: ids}        
      }, {
        fields: fields,
        sort: {
          cAt: -1
        }
      });
    },
    children: [
      {
        find: function(trUserLog) {
          // this.unblock(); // requires meteorhacks:unblock package
          // Publish the related user
      // if(trUserLog.uid && Meteor.users.findOne(trUserLog.uid).profile.role !== '6') {
      //   return []
      // }
          // console.log(trUserLog)
          return Meteor.users.find({
            _id: trUserLog.uid,
            // 'profile.role': '6'
          }, {
            limit: 1, 
            fields: {
              emails: 1,
              'profile.fullname': 1,
              'profile.trainingModules': 1,
              connection: 1
            }, 
            // sort: {
            //   _id: 1
            // }
          });
        }
      },
      {
        find: function(trUserLog) {
          // this.unblock(); // requires meteorhacks:unblock package
          // Publish the related user

          // console.log(trUserLog)
          return TrainingModules.find({_id: trUserLog.mid}, {
            limit: 1, 
            fields: {
              name: 1
            }
          });
        }
      }      
    ]
  };
});
