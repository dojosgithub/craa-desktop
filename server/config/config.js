// import { Mongo, MongoInternals } from 'meteor/mongo';

// let configVar = {  
//   production: {
//     // coreDBURL: "mongodb://craa21DBAdmin:bT*6#bHh2B@app1.craassessments.com:3201/craa_v21_db",
//     trDBURL: 'mongodb://craaTR17DBAdmin:tbR*7#bHh1B@training.craassessments.com:27017/craa-v2-tr',
//     // apiURL: function() { return "https://apiv1.craassessments.com/" + configVar.apiVersion; }
//   },
//   development: {
//     trDBURL: "mongodb://localhost:27017/craa_v21_tr",
//     // apiURL: function() { return "http://localhost:3900/" + configVar.apiVersion; }
//   }
// }

// let _extTRDBURL = configVar[process.env.NODE_ENV].trDBURL

// var ___trExtDB = new MongoInternals.RemoteCollectionDriver(_extTRDBURL);

// _TrainingModuleUserLogs = new Mongo.Collection("training_module_user_logs", { _driver: ___trExtDB });

// Ground.Collection(Meteor.users);
