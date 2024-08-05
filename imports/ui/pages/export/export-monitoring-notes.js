import { Session } from 'meteor/session'

import Tabular from 'meteor/aldeed:tabular';

const XLSX = require('xlsx');

import { Util } from '/imports/lib/util.js'

import { Simulations } from '/imports/api/simulations/simulations.js'
// import { SimUsersSummary } from '/imports/api/sim-users-summary/sim-users-summary.js'

import  { SimUsersSummary } from '/imports/api/sim-users-summary/sim-users-summary.js'

import './export-monitoring-notes.html'
import '/imports/ui/stylesheets/export/export-monitoring-notes.less'
import '/imports/ui/stylesheets/common/datatables.ui.less'

let _selfExportMonitoringNotes

Template.ExportMonitoringNotes.onCreated(function expMNOnCreated() {
  _selfExportMonitoringNotes = this
  // _selfExportMonitoringNotes.users = []

  // Session.set("ExportMonitoringNotes.user", null)

  Tracker.autorun(() => {
    // Meteor.subscribe("all_assessee_users_fullnames")
    // let users = Meteor.users.find().fetch()
    
    // _selfExportMonitoringNotes.users = users
    
  })

})

Template.ExportMonitoringNotes.onRendered(function expMNOnRendered() {
  // console.log(_selfExportMonitoringNotes.users)
  // if(_selfExportMonitoringNotes.users.length < 100) {
  //   Meteor.subscribe("all_assessee_users_fullnames")

  //   let users = Meteor.users.find().fetch()
  //   _selfExportMonitoringNotes.users = users    
  // }

  // $('.export-monitoring-notes-grid .search-user').search({
  //   source: _selfExportMonitoringNotes.users,
  //   searchFullText: true,
  //   onSelect(result) {
  //     // console.log(result)
  //     if(result._id) {

  //       Util.loader($('.export-monitoring-notes-user-cards'))

  //       Meteor.call("SimUsersSummary.user", result._id, (err, res) => {
  //         if(err) {
  //           Util.alert({mode: 'error'})
  //         } else {
  //           if(res && res.length >0) {
              
  //             let _user = []
  //             res.forEach((r) => {
  //               let sim = Simulations.findOne({id: r.simulationId}) 

  //               r.simulationName = sim.name //-- Replace the recorded sim name

  //               _user.push(r)               
  //             })

  //             Session.set("ExportMonitoringNotes.user", _user)

  //             Util.loader({done: true})
  //           }
  //         }
  //       })

  //     } else {
  //       Util.alert({mode: 'error'})
  //     }
  //   }
  // })  

  $('.export-monitoring-notes-grid table.dataTable').addClass('ui celled table')
})

Template.ExportMonitoringNotes.helpers({
  // User() {
  //   return Session.get("ExportMonitoringNotes.user")
  // }
  selector() {
    return {
      roleKey: '6',
      status: {$ne: 'Deleted'},
      // sort: {
      //   fullname: 1
      // }
    }
  }
})

Template.ExportMonitoringNotes.events({
  'click .btn-export-monitoring-notes'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    // let 
    //   uid = $(e.currentTarget).data('uid'),
    //   sid = $(e.currentTarget).data('sid'),
    //   cid = $(e.currentTarget).data('cid'),
    //   buid = $(e.currentTarget).data('buid'),
    //   sname = $(e.currentTarget).data('sname');
    
    let 
      uid = this.row.userId,
      uname = this.row.fullname,
      sid = this.row.simulationId,
      cid = this.row.clientId,
      buid = this.row.buId,
      sname = this.row.simulationName;

    let sim = Simulations.findOne({id: sid}) 
// console.log(sid, Simulations.find().fetch(), sim)
    sname = sim && sim.name || sname //-- Replace the recorded sim name

    if(uid && sid) {

      let user = {
        uid: uid,
        sid: sid,
        cid: cid,
        buid: buid
      }

      Meteor.call("MonitoringNotes.export", user, (err, res) => {
        if(err) {
          Util.alert({mode: 'error'})
          Util.loader({done: true}) 
        } else {
          if(res) {
              let wb = res.data

              // console.log(wb);
              /* "Browser download file" from SheetJS README */
              let
                wopts = { bookType:'xlsx', bookSST:false, type:'binary' },
                wbout = XLSX.write(wb, wopts)

              let filename = uname+'-'+sname+'-MonitoringNotes-'+Util.dateHMS(new Date)+'.xlsx'

              saveAs(new Blob([Util.s2ab(wbout)],{type:"application/octet-stream"}), filename);  

              Util.loader({done: true})           
          }
        }
      })
    }
  },
  'click .btn-export-assessee-log'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    // let 
    //   uid = $(e.currentTarget).data('uid'),
    //   sid = $(e.currentTarget).data('sid'),
    //   cid = $(e.currentTarget).data('cid'),
    //   buid = $(e.currentTarget).data('buid'),
    //   sname = $(e.currentTarget).data('sname');
    
    let 
      uid = this.row.userId,
      uname = this.row.fullname,
      sid = this.row.simulationId,
      cid = this.row.clientId,
      buid = this.row.buId,
      sname = this.row.simulationName,
      client = this.row.clientName+'-'+this.row.buName;

    let sim = Simulations.findOne({id: sid}) 
// console.log(sid, Simulations.find().fetch(), sim)
    sname = sim && sim.name || sname //-- Replace the recorded sim name

    if(uid && sid) {

      let sus = SimUsersSummary.find({
        userId: uid
      }).fetch()

      // console.log(sus)
      let sids = []
      if(sus && sus.length > 0) {
        sus.forEach((s) => {
          sids.push(s.simulationId)
        })
      }

      let user = {
        uid: uid,
        sids: sids,
        cid: cid,
        buid: buid,
        client: client
      }

      Meteor.call("AssesseeLog.export", user, (err, res) => {
        if(err) {
          Util.alert({mode: 'error'})
          Util.loader({done: true}) 
        } else {
          if(res) {
              let wb = res.data

              // console.log(wb);
              /* "Browser download file" from SheetJS README */
              let
                wopts = { bookType:'xlsx', bookSST:false, type:'binary' },
                wbout = XLSX.write(wb, wopts)

              let filename = uname+'-AssesseeLog-'+Util.dateHMS(new Date)+'.xlsx'

              saveAs(new Blob([Util.s2ab(wbout)],{type:"application/octet-stream"}), filename);  

              Util.loader({done: true})           
          }
        }
      })

    }
  },
  'click .btn-export-trainee-log'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    // let 
    //   uid = $(e.currentTarget).data('uid'),
    //   sid = $(e.currentTarget).data('sid'),
    //   cid = $(e.currentTarget).data('cid'),
    //   buid = $(e.currentTarget).data('buid'),
    //   sname = $(e.currentTarget).data('sname');
    
    let 
      uid = this.row.userId,
      uname = this.row.fullname,
      sid = this.row.simulationId,
      cid = this.row.clientId,
      buid = this.row.buId,
      sname = this.row.simulationName,
      client = this.row.clientName+'-'+this.row.buName;

    if(uid && sid) {

      let user = {
        uid: uid,
        sid: sid,
        cid: cid,
        buid: buid,
        client: client
      }

      Meteor.call("TraineeLog.export", user, (err, res) => {
        if(err) {
          Util.alert({mode: 'error'})
          Util.loader({done: true}) 
        } else {
          if(res && res.success) {
              let wb = res.data

              // console.log(wb);
              /* "Browser download file" from SheetJS README */
              let
                wopts = { bookType:'xlsx', bookSST:false, type:'binary' },
                wbout = XLSX.write(wb, wopts)

              let filename = uname+'-TraineeLog-'+Util.dateHMS(new Date)+'.xlsx'

              saveAs(new Blob([Util.s2ab(wbout)],{type:"application/octet-stream"}), filename);  

              Util.loader({done: true})           
          } else {
            Util.alert({mode: 'warning', msg: 'No log data to export'})
            Util.loader({done: true})  
          }
        }
      })

    }
  },    
})

Template.ExportMonitoringNotes.onDestroyed(() => {
  // Session.set("ExportMonitoringNotes.user", null)
  // _selfExportMonitoringNotes.users = []

})

