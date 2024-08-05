import { Mongo } from 'meteor/mongo';


if(Meteor.isServer) { //-- This is critical
  import { ExtTRDB } from '/imports/startup/server/db-config.js'
  var _extTRDB = ExtTRDB //-- This is critical, too, but 'let' not working
}

export const TrainingModuleScoreSummary = new Mongo.Collection("training_module_score_summary", { _driver: _extTRDB });
