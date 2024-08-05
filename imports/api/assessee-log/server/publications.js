import { check } from 'meteor/check';

import { AssesseeLog } from '../assessee-log.js';

Meteor.publish('all_assessee_log', function() { //-- If subscribed, this will freeze the app due to the heavy log data
  return AssesseeLog.find({}, {
    sort: {
      createdAt: -1
    }
  })
})
