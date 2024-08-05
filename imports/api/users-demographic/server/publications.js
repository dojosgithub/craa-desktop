import '/imports/api/users-demographic/users-demographic.js'

Meteor.publish("users_demographic_w_id", function(uid) {
  return UsersDemographic.find({uid: uid});
});
