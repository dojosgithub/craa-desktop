import { Mongo } from 'meteor/mongo';

import Tabular from 'meteor/aldeed:tabular';

import { Util } from '/imports/lib/util.js'

// import { Simulations } from '/imports/api/simulations/simulations.js'
// import { ScoringTempTimerLog } from '/imports/api/scoring-temp-timer-log/scoring-temp-timer-log.js';
// import { NonErrors } from '/imports/api/non-errors/non-errors.js';
// import { ScoringAdjudication } from '/imports/api/scoring-adjudication/scoring-adjudication.js';

export const UsersSummary = new Mongo.Collection('users_summary');

UsersSummary.helpers({
  simPermission() {       
    let _user = Meteor.users.findOne(this.userId)
  
    let _sims = []

    if(_user && _user.profile.clients) {
      let _client = _user.profile.clients[0]

      if(_client.bus) {
        _client.bus.forEach((b) => {
          if(b.isBUChecked && b.simulations) {
            b.simulations.forEach((s) => {
              if(s.subChecked) {
                _sims.push(s.name)
              }
            })
          }
        })
      }
    }

    return _sims.join('<br>')
  },
  sendPubNoti() {       
    let _user = Meteor.users.findOne(this.userId)
  
    if(_user && _user.profile.clients) {
      let _client = _user.profile.clients[0]

      return _client.send_publish_notification ? 'TRUE' : 'FALSE'
    }
  },
  sendDistNoti() {       
    let _user = Meteor.users.findOne(this.userId)
  
    if(_user && _user.profile.clients) {
      let _client = _user.profile.clients[0]

      return _client.send_distribution_notification ? 'TRUE' : 'FALSE'
    }
  },
  viewResults() {       
    let _user = Meteor.users.findOne(this.userId)
  
    if(_user && _user.profile.clients) {
      let _client = _user.profile.clients[0]

      return _client.view_results ? 'TRUE' : 'FALSE'
    }
  },  
  viewResultsOnDist() {       
    let _user = Meteor.users.findOne(this.userId)
  
    if(_user && _user.profile.clients) {
      let _client = _user.profile.clients[0]

      return _client.view_results_on_dist ? 'TRUE' : 'FALSE'
    }
  },          
});

new Tabular.Table({
  name: "UserPermission",
  collection: UsersSummary,
  pub: 'user_permission_w_user_client',
  order: [[5, 'desc']],
  pageLength: 20,  
  lengthMenu: [[20, 50, 100], [20, 50, 100]],
  language: {
      zeroRecords: "No user data to process",      
      info: "Showing _START_ to _END_ of _TOTAL_ users",
      infoEmpty: "No user record to process",
      processing: "Compiling data...please wait...",
      search: 'Search User:',
  },  
  columns: [
    {data: "roleName", title: "Role", width: 200},
    {data: "username", title: "Username", width: 150},
    {data: "lastname", title: "Last", width: 100},
    {data: "firstname", title: "First", width: 100},
    {data: "email", title: "Email", width: 200},
    {data: "client", title: "Client-BU", width: 200},
    {data: "simPermission()", title: "Simulation Permission", width: 200},
    {data: "sendPubNoti()", title: "Send publish<br> notification", width: 100},
    {data: "sendDistNoti()", title: "Send distribution<br> notification", width: 150},
    {data: "viewResults()", title: "View Results"},
    {data: "viewResultsOnDist()", title: "View Results <br>After Distribution", width: 150},

    // {data: "", title: "", width: 700, 
    //   createdCell: Meteor.isClient && function (cell, cellData, rowData) {        
    //     return Blaze.renderWithData(Template.ExportMonitoringNotesAction, {
    //       row: rowData
    //     }, cell);
    //   },
    // },
    // {data: "submittedAt", visible: false},
    // {data: "_id", visible: false},
    // {data: "userId", visible: false},
    // {data: "clientId", visible: false},
    // {data: "buId", visible: false},
    // // {data: "simulationName", visible: false},
    // {data: "simulationId", visible: false},
    // {data: "clientName", visible: false},
    {data: "userId", visible: false},
  ]
});

