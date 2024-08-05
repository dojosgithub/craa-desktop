import { check } from 'meteor/check';

import { NonErrors } from '../non-errors.js';


Meteor.publish('non_errors_w_asmtId', function(asmtId) { 
  check(asmtId, String)

  return NonErrors.find({
    assessment_id: asmtId
  })
});
