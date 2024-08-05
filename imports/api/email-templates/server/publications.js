import { check } from 'meteor/check';

import { EmailTemplates } from '../email-templates.js';

Meteor.publish("email_template_w_key", function(key) {
  check(key, String);

  // this.unblock();

  return EmailTemplates.find({key: key, status: 2});
});
