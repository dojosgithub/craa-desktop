import { check } from 'meteor/check';

import { UserComparison } from '../user-comparison.js';

Meteor.publish('valid_user_comparison', function() { //-- If subscribed, this will freeze the app due to the heavy log data
  return UserComparison.find({
    cpValue: true
  })
})
