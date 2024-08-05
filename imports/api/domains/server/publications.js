import { check } from 'meteor/check'

import { Domains } from '../domains.js'

Meteor.publish('all_active_domains', function() {  

  return Domains.find({
    status: 1}); 
})
