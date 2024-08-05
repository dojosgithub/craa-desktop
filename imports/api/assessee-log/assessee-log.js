import { Mongo } from 'meteor/mongo';

export const AssesseeLog = new Mongo.Collection('assessee_log');
// export const AssesseeLog = new Ground.Collection('assessee_log');

// if(Meteor.isClient) {
// // var gdTrainingModuleUserLogs = new Ground.Collection('_gdTrainingModuleUserLogs');
// const gdAssesseeLog = new Ground.Collection('_gdAssesseeLog');

// gdAssesseeLog.observeSource(AssesseeLog.find());

//     Meteor.subscribe('all_assessee_log', {
//       onReady() {
//         gdAssesseeLog.keep(AssesseeLog.find({}, {reactive: false}));
//       }
//     })

//     gdAssesseeLog.once('loaded', () => { 
//       console.log('loaded'); 
//       console.log(gdAssesseeLog.find().fetch().length)
//     });
// }
