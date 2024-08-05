import { Session } from 'meteor/session'

// import { AssesseeLog } from '/imports/api/assessee-log/assessee-log.js'


import  { Util } from '/imports/lib/util.js'

import './export.html'
import '/imports/ui/stylesheets/export/export.less'

let _selfExport

Template.Export.onCreated(function exportOnCreated() {
  _selfExport = this

  _selfExport.tabs = {
    first: 'ExportMonitoringNotes',
    // second: "ExportAssesseeLog"
    second: "ExportEmails"
  }

  Session.set("Export.tab", _selfExport.tabs)

  Util.loading(false)
})

Template.Export.onRendered(function exportOnRendered() {
  $('.export-menu .item').tab()
})

Template.Export.helpers({
  ExportMonitoringNotes() {
    if( Session.get("Export.tab").first) {

      import './export-monitoring-notes.js'

// let aLog = AssesseeLog.find()
// console.log(aLog.fetch().length)

      return Session.get("Export.tab").first
    }    
  },
//   ExportAssesseeLog() {
//     if( Session.get("Export.tab").second) {
// 
//       import './export-assessee-log.js'
// 
//       return Session.get("Export.tab").second
//     }    
//   },
  ExportEmails() {
    if( Session.get("Export.tab").second) {

      import './export-emails.js'

      return Session.get("Export.tab").second
    }    
  },  
})
