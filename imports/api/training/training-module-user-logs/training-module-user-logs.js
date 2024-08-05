import { Mongo } from 'meteor/mongo';

import Tabular from 'meteor/aldeed:tabular';

import { TrainingModules } from '/imports/api/training/training-modules/training-modules.js'

import { Util } from '/imports/lib/util.js'

if(Meteor.isServer) { //-- This is critical
  import { ExtTRDB } from '/imports/startup/server/db-config.js'
  var _extTRDB = ExtTRDB //-- This is critical, too, but 'let' not working
}

export const TrainingModuleUserLogs = new Mongo.Collection("training_module_user_logs", { _driver: _extTRDB });
// export const TrainingModuleUserLogs = new Ground.Collection("training_module_user_logs", { _driver: _extTRDB });

// TrainingModuleUserLogs = new Mongo.Collection("training_module_user_logs", { _driver: _extTRDB });

// if(Meteor.isClient) {
// // var gdTrainingModuleUserLogs = new Ground.Collection('_gdTrainingModuleUserLogs');
// const gdTrainingModuleUserLogs = new Ground.Collection('_gdTrainingModuleUserLogs');

// gdTrainingModuleUserLogs.observeSource(TrainingModuleUserLogs.find());

//     Meteor.subscribe('all_trainee_logs', {
//       onReady() {
//         gdTrainingModuleUserLogs.keep(TrainingModuleUserLogs.find({}, {reactive: false}));
//       }
//     })

//     // gdTrainingModuleUserLogs.once('loaded', () => { 
//     //   console.log('loaded'); 
//     //   console.log(gdTrainingModuleUserLogs.find().fetch().length)
//     // });
// }

TrainingModuleUserLogs.helpers({
  // email() {
  //   let user = Meteor.users.findOne({_id: this.uid});
  //   return user && user.emails && user.emails[0].address;
  // },
  // fullname() {
  //   let user = Meteor.users.findOne({_id: this.uid});
  //   return user && user.profile && user.profile.fullname;
  // },
  moduleName() {
    let module = TrainingModules.findOne({_id: this.mid})
    return module && module.name
  },
  // userRole() {
  //   let user = Meteor.users.findOne({_id: this.uid});
  //   return user && user.profile && user.profile.role === '6'
  // }    
});

new Tabular.Table({
  name: "TBLTrainingModuleUserLogs",
  collection: TrainingModuleUserLogs,
  pub: 'training_module_user_logs_w_users',
  // selector(cAt) {
    // console.log(this, cAt)
    // if(uid) {
    //   let role = Meteor.users.findOne(uid).profile.role
    //   return role === '6'
    // } 
  // },
  // ordering: false,
  order: [[9, 'desc']],
  paging: true,
  info: true,
  pageLength: 20,
  lengthMenu: [[20, 50, 100], [20, 50, 100]],
  limit: 20,
  language: {
      zeroRecords: "No log data to process",
      info: "Showing _START_ to _END_ of _TOTAL_ logs",
      infoEmpty: "No log record to process",
      processing: "Compiling data...please wait...",
      search: 'Search: ',
  },  
  columns: [
    {data: "lastname", title: "Lastname", width: 200},    
    {data: "firstname", title: "Firstname", width: 200},    
    {data: "email", title: "Email"},
    {data: "client", title: "Client", render(v,t,d) {
      return v && v + '-' +d.bu //-- can be undefined for old logs
    }},
    {data: "moduleName()", title: "Module", width: 300},
    {data: "venue", title: "Venue"},    
    {data: "msg", title: "Item/Action"},
    {data: "page", title: "Page"},
    {data: "ip", title: "IP"},
    {data: "cAt", title: "Date", width: 200, render(v,t,d) {
      // console.log(d)
      return Meteor.libMethods.dateFormatN(v);
    }},    
    // {data: "", title: "", 
    //   createdCell: Meteor.isClient && function (cell, cellData, rowData) {        
    //     return Blaze.renderWithData(Template.ExportMonitoringNotesAction, {
    //       row: rowData
    //     }, cell);
    //   },
    // },
    {data: "profile", visible: false},
    {data: "uid", visible: false},
    {data: "mid", visible: false},
    // {data: "userRole()", visible: false},
    {data: "role", visible: false},
    {data: "bu", visible: false},
  ]
});


// if (Meteor.isServer) {
//   // Insecure: entire collection will be available to all clients
//   ReactiveTable.publish("all-trainee-logs", 
//     TrainingModuleUserLogs
//     );

//   // // Publish only a subset of items with "show" set to true
//   // ReactiveTable.publish("some-items", Items, {"show": true});

//   // // Publish only to logged in users
//   // ReactiveTable.publish("all-items", function () {
//   //   if (this.userId) {
//   //     return Items;
//   //   } else {
//   //     return [];
//   //   }
//   // });

//   // // Publish only the current user's items
//   // ReactiveTable.publish("user-items", Items, function () {
//   //   return {"userId": this.userId};
//   // });
// }

