import './trainee-logs.html'
import '/imports/ui/stylesheets/training/trainee-logs.less'

import Tabular from 'meteor/aldeed:tabular';

import { TrainingModuleUserLogs } from '/imports/api/training/training-module-user-logs/training-module-user-logs.js'
// import { gdTrainingModuleUserLogs } from '/imports/api/training/training-module-user-logs/training-module-user-logs.js'
// import { gdTrainingModuleUserLogs } from '/imports/api/training/training-module-user-logs/training-module-user-logs.js'

// let gdTrainingModuleUserLogs = new Ground.Collection('_gdTrainingModuleUserLogs');

// gdTrainingModuleUserLogs.observeSource(TrainingModuleUserLogs.find());

import { Util } from '/imports/lib/util.js'

Template.TraineeLogs.onCreated(function traineeLogsOnCreated() {
  
})

Template.TraineeLogs.onRendered(function traineeLogsOnRendered() {
  $('.trainee-logs-grid table.dataTable').addClass('ui celled table')
  Util.loading(false)
})

Template.TraineeLogs.helpers({
  // Logs() {
  //   let t =  TrainingModuleUserLogs.find({
  //     // uid: 'ijJLem9JDoewsua5o'
  //   })

  //   console.log(t.fetch().length)

  //   return t
  // }
  traineeLogSelector() {

    return {
      uid: {$ne: null},
      // ip: {$nin: ['127.0.0.1', '136.62.61.170']}
      // 'profile.role': '6'
    }
  }
})
