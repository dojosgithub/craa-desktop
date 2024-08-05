import { check, Match } from 'meteor/check'

import { UsersSummary } from '../users-summary.js';

Meteor.publishComposite("user_permission_w_user_client", function (tableName, ids, fields) {
  check(tableName, String);
  check(ids, Array);
  check(fields, Match.Optional(Object));

  // this.unblock();

  return {
    find: function () {
      // this.unblock();

      return UsersSummary.find({
        _id: {$in: ids}        
      }, {
        fields: fields
      });
    },
    children: [
      {
        find: function(us) {
          // this.unblock();

          return Meteor.users.find(us.userId, {
            // limit: 1, 
            fields: {
              'profile.clients': 1
            }, 
            // sort: {
            //   _id: 1
            // }
          });
        },
       
      }     
    ]
  };
});
