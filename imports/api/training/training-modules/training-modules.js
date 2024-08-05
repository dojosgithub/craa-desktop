import { Mongo } from 'meteor/mongo';


if(Meteor.isServer) { //-- This is critical
  import { ExtTRDB } from '/imports/startup/server/db-config.js'
  var _extTRDB = ExtTRDB //-- This is critical, too, but 'let' not working
}

export const TrainingModules = new Mongo.Collection("training_modules", { _driver: _extTRDB });
