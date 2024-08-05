import { check } from 'meteor/check';

import { ScoringAdjudication } from '../scoring-adjudication.js';

Meteor.publish('scoring_adjudication_w_asmtid', function(asmtId) {
  check(asmtId, String)  

  return ScoringAdjudication.find({
    assessment_id: asmtId,    
  })
})
