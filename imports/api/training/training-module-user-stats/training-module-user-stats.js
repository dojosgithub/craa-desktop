import { Mongo } from 'meteor/mongo';

if(Meteor.isServer) { //-- This is critical
  import { ExtTRDB } from '/imports/startup/server/db-config.js'
  var _extTRDB = ExtTRDB //-- This is critical, too, but 'let' not working
}

export const TrainingModuleUserStats = new Mongo.Collection("training_module_user_stats", { _driver: _extTRDB });
