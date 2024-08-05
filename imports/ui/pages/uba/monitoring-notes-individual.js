import { Session } from 'meteor/session'

const XLSX = require('xlsx');
// const FileSaver = require('file-saver');

import '/imports/lib/template-helpers.js'
import { Util } from '/imports/lib/util.js'

import { Simulations } from '/imports/api/simulations/simulations.js'

import './monitoring-notes-individual.html'
import '/imports/ui/stylesheets/uba/monitoring-notes-individual.less'

let _selfUBAMonitoringNotesIndividual

Template.UBAMonitoringNotesIndividual.onCreated(function() {

  _selfUBAMonitoringNotesIndividual = this

  _selfUBAMonitoringNotesIndividual.colors = [
    "#e8e7c5",
    "#a0decc",
    "#f2c185",
    "#b9d0de",
    "#dbecf3"
  ]

  _selfUBAMonitoringNotesIndividual.colorDict = []

  Template.UBAMonitoringNotesIndividual.__helpers.get("resetSearch").call()
})

Template.UBAMonitoringNotesIndividual.onRendered(function() {
  Tracker.autorun(() => {
    
    if(Session.get("UBA.MonitoringNotesIndividual.users")) {
      
      $(".uba-mn-user-search").search({
        source: Session.get("UBA.MonitoringNotesIndividual.users"),
        fields: {          
          title: 'name' 
        },
        searchFields: ['name'],
        // minCharacters : 3,
        // cache: false,
        onSelect(result, response) {
          // console.log(result, response)
          if(result) {
            Session.set("UBA.MonitoringNotesIndividual.user", result)
          }
        }
      })
    } else {
      $(".uba-findings-individual-user").val('')
    }
// console.log(Session.get("UBA.FindingsIndividual.user.source"), Session.get("UBA.FindingsIndividual.user.target"))
    if(Session.get("UBA.MonitoringNotesIndividual.user")) {
      $("#uba_mn_user").val(Session.get("UBA.MonitoringNotesIndividual.user").name)
    }

    if(Session.get("UBA.FindingsIndividual.sid")) {
      $(".sel-findings-individual-simulation").dropdown('set selected', Session.get("UBA.FindingsIndividual.sid"))  
    }

  })
})

Template.UBAMonitoringNotesIndividual.helpers({
  Simulations() {
    return Simulations.find()
  },
  simSelected() {
    return this.id === parseInt(Session.get("UBA.MonitoringNotesIndividual.sid"))
  },
  resetSearch() {
    Session.set("UBA.MonitoringNotesIndividual.users", [])
    Session.set("UBA.MonitoringNotesIndividual.sid", null)
    Session.set("UBA.MonitoringNotesIndividual.user", {})
    Session.set("UBA.MonitoringNotesIndividual.users.included", [])
    Session.set("UBA.MonitoringNotesIndividual.computed", false)
    Session.set("UBA.MonitoringNotesIndividual.logs", null)
  },
  usersIncluded() {
    return Session.get("UBA.MonitoringNotesIndividual.users.included")
  },
  hasIncludedUsers() {
    return Session.get("UBA.MonitoringNotesIndividual.users.included") && 
      Session.get("UBA.MonitoringNotesIndividual.users.included").length > 0
  },
  userLogs() {
    return Session.get("UBA.MonitoringNotesIndividual.logs")
  },
  hasComputed() {
    return Session.get("UBA.MonitoringNotesIndividual.computed")
  },
  userColor(uid) {
    return _selfUBAMonitoringNotesIndividual.colorDict[uid]
  },
  Simils() {
    if(Session.get("UBA.MonitoringNotesIndividual.simils")) {
      return Session.get("UBA.MonitoringNotesIndividual.simils");
    }
  }
})

Template.UBAMonitoringNotesIndividual.events({
  'change #sel_mn_individual_simulation'(e, tpl) {
    e.preventDefault()
    
    Template.UBAMonitoringNotesIndividual.__helpers.get('resetSearch').call()

    $('.ui.search').search('clear cache')
    $(".uba-mn-individual-user").val('')

    let 
      sid = $('#sel_mn_individual_simulation').val(),
      users = []

    if(sid && sid > 0) {
      Meteor.call("UBA.FindingsIndividual.users", parseInt(sid), (err, res) => {
        if(err) {
          Util.alert({mode:'error', msg: err})
        } else {
          if(res && res.length > 0) {
            res.forEach((u) => {
              let obj = {
                name: u.firstname + ' ' + u.lastname,
                uid: u.userId
              }

              users.push(obj)
            })

            // console.log(users)
            Session.set("UBA.MonitoringNotesIndividual.users", users)
            Session.set("UBA.MonitoringNotesIndividual.sid", sid)

            Meteor.subscribe("findings_w_sid_mini", parseInt(sid))
          }
        }
      })
    }
  },
  'click .btn-include-user'(e, tpl) {
    e.preventDefault()

    if(Session.get("UBA.MonitoringNotesIndividual.user")) {
      let usersIncluded = Session.get("UBA.MonitoringNotesIndividual.users.included")

      usersIncluded.push(Session.get("UBA.MonitoringNotesIndividual.user"))      

      let _usersIncluded = Util.uniqueObject(usersIncluded, 'uid')

      Session.set("UBA.MonitoringNotesIndividual.users.included", _usersIncluded)

      Session.set("UBA.MonitoringNotesIndividual.user", null)
      $(".uba-mn-user").val('')
    }
  },
  'click .icon-remove-search-user'(e, tpl) {
    e.preventDefault()

    let uid = $(e.currentTarget).data('uid')
// console.log(uid)
    let 
      includedUsers = Session.get("UBA.MonitoringNotesIndividual.users.included"),
      _newIncludedUsers = []    

    if(includedUsers && includedUsers.length > 0) {
      _newIncludedUsers = includedUsers.filter(u => u.uid !== uid)
    }

    $("btn-view-included-user").data('uid', uid).remove()

    Session.set("UBA.MonitoringNotesIndividual.users.included", _newIncludedUsers)
  },
  'click .btn-view-user-note-log'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    let users = Session.get("UBA.MonitoringNotesIndividual.users.included")

    if(Session.get("UBA.MonitoringNotesIndividual.sid") 
      && users && users.length > 0) {

      if(users.length > 5) {
        Util.alert({mode: 'warning', msg: "You can process up to 5 users."})
        Util.loader({done: true})
      } else {

        Session.set("UBA.MonitoringNotesIndividual.logs", null)      

        let userIds = []

        users.forEach((u, i) => {
          userIds.push(u.uid)
          _selfUBAMonitoringNotesIndividual.colorDict[u.uid] = _selfUBAMonitoringNotesIndividual.colors[i]
        })

        let obj = {
          sid: parseInt(Session.get("UBA.MonitoringNotesIndividual.sid")),
          userIds: userIds
        }

        Meteor.call("UBA.MonitoringNotesIndividual.log", obj, (err, res) => { //-- see assessee-log
          if(err) {
            Util.alert({mode: 'error', msg: err})
          } else {
            // console.log(res)
            if(res && res.success) {

              Session.set("UBA.MonitoringNotesIndividual.logs", res.data.logs);
              Session.set("UBA.MonitoringNotesIndividual.simils", { 
                high: res.data.highSimil,
                higher: res.data.higherSimil
              });              
              Session.set("UBA.MonitoringNotesIndividual.computed", true)
            }
          }

          setTimeout(() => { Util.loader({done: true}); }, 2000);
          
        })
      }
    } else {
      Util.alert({mode: 'error', msg: 'Insufficient input.'})
      Util.loader({done: true})
    }
  },
  'click .btn-reset-users'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    Session.set("UBA.MonitoringNotesIndividual.users.included", [])    
    Session.set("UBA.MonitoringNotesIndividual.computed", false)
    Session.set("UBA.MonitoringNotesIndividual.logs", null)

    $(".uba-mn-user-search").search('clear cache')

    setTimeout(() => {
      Util.loader({done: true})
    }, 1000)
  },
  'click .btn-select-table'(e, tpl) {
    e.preventDefault();

    let _table = document.getElementById('uba_mn_user_log_table');
    selectElementContents(_table);

  },
  'click .btn-export-table'(e, tpl) {
    e.preventDefault();

    let       
      _table = document.getElementById("uba_mn_user_log_table"),
      _wb = XLSX.utils.table_to_book(_table, {sheet:"UBA: Monitoring Notes Log"});

    let
      // wopts = { bookType:'xlsx', bookSST:false, type:'binary' },
      wopts = { bookType:'xlsx', bookSST:true, type:'binary' },
      wbout = XLSX.write(_wb, wopts)

    let _fileName = 'Monitoring-Notes-Log-'+Util.dateHMS(new Date)+'.xlsx';
      

    // XLSX.write(_wb, {bookType:'xlsx', bookSST:true, type: 'base64'});
    // XLSX.writeFile(_wb, _fileBase + Util.dateHMS(new Date)+'.xlsx'); 

    saveAs(new Blob([Util.s2ab(wbout)],{type:"application/octet-stream"}), _fileName);
    // saveAs(new Blob([Util.s2ab(wbout)],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}), _fileBase);
    // saveAs(new Blob([Util.s2ab(wbout)],{type:"application/binary"}), _fileBase);
    // FileSaver.saveAs(new Blob([Util.s2ab(wbout)],{type:"application/binary"}), _fileBase);
    // FileSaver.saveAs(new Blob([Util.s2ab(wbout)],{type:"application/octet-stream"}), _fileName);
    // FileSaver.saveAs(new Blob([Util.s2ab(wbout)],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"}), _fileBase);
    // FileSaver.saveAs(new Blob([Util.s2ab(wbout)],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"}), _fileBase);
  }
})

Template.UBAMonitoringNotesIndividual.onDestroyed(() => {
  Template.UBAMonitoringNotesIndividual.__helpers.get("resetSearch").call()
})


function selectElementContents(el) {
  var body = document.body, range, sel;
  if (document.createRange && window.getSelection) {
    range = document.createRange();
    sel = window.getSelection();
    sel.removeAllRanges();
    try {
      range.selectNodeContents(el);
      sel.addRange(range);
    } catch (e) {
      range.selectNode(el);
      sel.addRange(range);
    }
  } else if (body.createTextRange) {
    range = body.createTextRange();
    range.moveToElementText(el);
    range.select();
  }
}


