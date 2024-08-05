import { check } from 'meteor/check';

import { ScoringBehaviors } from '../scoring-behaviors.js';

Meteor.publish('scoring_behaviors_w_asmtid', function(asmtId) {
  check(asmtId, String)  

  return ScoringBehaviors.find({
    assessment_id: asmtId,    
  })
})
