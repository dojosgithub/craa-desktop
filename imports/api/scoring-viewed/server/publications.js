import { check } from 'meteor/check';

import { ScoringViewed } from '../scoring-viewed.js';


Meteor.publish('scoring_viewed_w_asmtId', function(asmtId) { 
  check(asmtId, String)

  return ScoringViewed.find({
    assessment_id: asmtId
  })
});
