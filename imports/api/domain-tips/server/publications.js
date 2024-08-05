import { check } from 'meteor/check'

import { DomainTips } from '../domain-tips.js'

Meteor.publish('all_active_domain_tips', function() {  

  return DomainTips.find({
    status: 1}); 
})
