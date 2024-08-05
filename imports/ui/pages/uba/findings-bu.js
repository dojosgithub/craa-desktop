import { Session } from 'meteor/session';

// const XLSX = require('xlsx');

import { Clients } from '/imports/api/clients/clients.js'
import { Findings } from '/imports/api/findings/findings.js'
import { UserComparison } from '/imports/api/user-comparison/user-comparison.js'

import '/imports/lib/template-helpers.js'
import { Util } from '/imports/lib/util.js'

import d3 from '/imports/lib/vis/d3/d3.353.min.js' //-- 3.5
import FileSaver from '/imports/lib/filesaver.min.js'

import './findings-bu.html'
import '/imports/ui/stylesheets/uba/findings-bu.less'

let _selfUBAFindingsBU

Template.UBAFindingsBU.onCreated(function() {
  _selfUBAFindingsBU = this

  Session.set("UBA.FindingsBU.viewTopList", false)
})

Template.UBAFindingsBU.onRendered(function() {
  Tracker.autorun(() => {
    let
      users = UserComparison.find().fetch(),
      _ucp = []

    if(users) {
      users.forEach((u) => {
        _ucp.push(u.cpKey) 
      })

      // console.log(users)
      Session.set("UBA.FindingsBU.UsersCompared", _ucp)
    }
  })  

})

Template.UBAFindingsBU.helpers({
  Clients() {
    let clients = Clients.find()

    // console.log(clients.fetch())
    // Session.set("UBA.FindingsBU.clients", clients.fetch())
    return clients
  },
  BUs() {
    return Session.get("UBA.FindingsBU.bus")
  },
  Simulations() {
    return Session.get("UBA.FindingsBU.simulations")
  },
  // Names() {
  //   return Session.get("UBA.FindingsBU.names")
  // },
  Results() {
    return Session.get("UBA.FindingsBU.results")
  },
  TopResults() {
    return Session.get("UBA.FindingsBU.results.top")
  },  
  resetData() {
    Session.set("UBA.FindingsBU.names", null)
    Session.set("UBA.FindingsBU.results", null)
    Session.set("UBA.FindingsBU.computed", false)
    Session.set("UBA.FindingsBU.results.top", null)
    Session.set("UBA.FindingsBU.results.mean", null)
    Session.set("UBA.FindingsBU.viewTopList", false)
  },
  resetDropdown() {
    Session.set("UBA.FindingsBU.sid", null)
    Session.set("UBA.FindingsBU.buid", null)
    Session.set("UBA.FindingsBU.simulations", null)

    Session.set("UBA.FindingsBU.cid", null)
    Session.set("UBA.FindingsBU.bus", null)    
  },
  hasComputed() {
    return Session.get("UBA.FindingsBU.computed")
  },
  clientSelected() {
    return this._id === Session.get("UBA.FindingsBU.cid")
  },
  buSelected() {
    return this._id === Session.get("UBA.FindingsBU.buid")
  },
  simSelected() {    
    return this.id === parseInt(Session.get("UBA.FindingsBU.sid"))
  },
  thisSid() {
    return Session.get("UBA.FindingsBU.sid")
  },
  meanScore() {
    return Session.get("UBA.FindingsBU.results.mean")
  },
  UsersCompared() {
    let
      users = UserComparison.find().fetch(),
      _ucp = []

    if(users) {
      users.forEach((u) => {
        _ucp.push(u.cpKey) 
      })

      Session.set("UBA.FindingsBU.UsersCompared", _ucp)
    }
  },
  isCompared(cpKey) {
    if(Session.get("UBA.FindingsBU.UsersCompared")) {
      // console.log(cpKey, Session.get("UBA.FindingsBU.UsersCompared").includes(cpKey))
      return Session.get("UBA.FindingsBU.UsersCompared").includes(cpKey)
    }
  },
  viewTopList() {
    // Util.loader({done: true})
    // if(Session.get("UBA.FindingsBU.viewTopList")) 
    return Session.get("UBA.FindingsBU.viewTopList")
  }
//   initProgress() {
//     _selfUBAFindingsBU.progress = setInterval(function() {
//       console.log('bbb')
//       $('#findings_bu_progress').progress('increment')
//     }, 1000)    
//   },
//   progressValue() {
//     _selfUBAFindingsBU.progress = setInterval(function() {
//       let
//         val = Session.get("UBA.FindingsBU.results.progress.value"),
//         _val = val + 5

//       Session.set("UBA.FindingsBU.results.progress.value", _val)
// console.log(_val)
//       return _val

//     }, 1000)    
//   },  
//   destroyProgress() {
//     console.log('aaa')
//     $('#findings_bu_progress').progress('complete')
//     clearInterval(_selfUBAFindingsBU.progress)
//   },
//   lengthOfResults() {
//     return Session.get("UBA.FindingsBU.results.diff.length")
//   }
})

Template.UBAFindingsBU.events({
  'change .sel-findings-bu-client'(e, tpl) {
    e.preventDefault()

    let cid = $('.sel-findings-bu-client').val()

    // console.log(cid)

    if(cid) {
      let bus = Clients.find({
        'bus.client_id': cid
      }, {
        fields: {
          bus: 1
        }
      }).fetch()

      Session.set("UBA.FindingsBU.sid", null)
      Session.set("UBA.FindingsBU.buid", null)
      Session.set("UBA.FindingsBU.simulations", null)

      Session.set("UBA.FindingsBU.cid", cid)
      Session.set("UBA.FindingsBU.bus", bus[0].bus)

    }
  },
  'change .sel-findings-bu-bu'(e, tpl) {
    e.preventDefault()

    let 
      buid = $('.sel-findings-bu-bu').val(),
      cid = Session.get("UBA.FindingsBU.cid") 

    if(buid) {
      let sims = Clients.find({
        '_id': cid,
        'bus._id': buid,
        'bus.simulations.bu_id': buid
        // 'bus.simulations': { $elemMatch: { bu_id: buid }}
      }
      , {
        fields: {
          'bus._id': 1,
          'bus.client_id': 1,
          'bus.simulations': 1,
          // 'bus.simulations.bu_id': 1,
        }
      }
      ).fetch()
// console.log(buid, sims)

      if(sims && sims.length > 0 && sims[0].bus) {
        let _sims = sims[0].bus.filter(b => b._id === buid)
        // console.log(_sims)

        Session.set("UBA.FindingsBU.buid", buid)
        Session.set("UBA.FindingsBU.simulations", _sims[0].simulations)
      }

    }
  },
  'change .sel-findings-bu-simulation'(e, tpl) {
    e.preventDefault()

    let 
      sid = $('.sel-findings-bu-simulation').val(),
      buid = Session.get("UBA.FindingsBU.buid"),
      cid = Session.get("UBA.FindingsBU.cid") 

    if(sid) {
      Session.set("UBA.FindingsBU.sid", sid)
    }
  },
  'click .btn-compute-findings-bu'(e, tpl) {
    e.preventDefault()

    // $(".uba-findings-bu-loader .dimmer").append('<div class="ui text loader">Computing user data ...</div>')

    Util.loader($(e.currentTarget))

    Template.UBAFindingsBU.__helpers.get("resetData").call()

    let
      sid = Session.get("UBA.FindingsBU.sid"),
      buid = Session.get("UBA.FindingsBU.buid"),
      cid = Session.get("UBA.FindingsBU.cid")

    if(cid && buid && sid) {
      
      // Session.set("UBA.FindingsBU.results.progress.value", 5)

      Session.set("UBA.FindingsBU.computed", true)
      Session.set("UBA.FindingsBU.viewTopList", false)

      let obj = {
        cid: cid,
        buid: buid,
        sid: parseInt(sid)
      }

      Meteor.call("UBA.FindingsBU.compute", obj, (err, res) => {
        if(err) {
          Util.alert({mode: 'error', msg: err})
        } else {
          if(res && res.success && res.data) {
            // console.log(res)
            if(res.data.diff && res.data.diff.length > 0) {
              // Session.set("UBA.FindingsBU.names", res.data.names)
              Session.set("UBA.FindingsBU.results", res.data.diff)
              Session.set("UBA.FindingsBU.results.top", res.data.top)
              Session.set("UBA.FindingsBU.results.top.length", res.data.top.length)
              Session.set("UBA.FindingsBU.results.mean", res.data.mean)
              Session.set("UBA.FindingsBU.results.diff.length", res.data.diff.length -1)              

            } else {
              Util.alert({mode: 'error', msg: 'Not enough data to present.'})
            }
            Util.loader({done: true})
          } else {
            Util.alert({mode: 'error'})
          }
        }

        Util.loader({done: true});
      })

    } else {
      Util.alert({mode: 'error', msg: 'Insufficient data. Please try again with valid client-bu-simulation data set.'});
      Util.loader({done: true});
    }
  },
  'click .match-percent'(e, tpl) {
    e.preventDefault()

    let 
      sid = Session.get("UBA.FindingsBU.sid"),
      u1Name = $(e.currentTarget).data('n1'),
      u2Name = $(e.currentTarget).data('n2'),
      u1Id = $(e.currentTarget).data('u1'),
      u2Id = $(e.currentTarget).data('u2')

    if(sid && u1Name && u2Name && u1Id && u2Id) {
// console.log(sid, u1Name, u2Name, u1Id, u2Id)
      Session.set("UBA.FindingsIndividual.sid", sid)

      let sUser = {
        name: u1Name,
        uid: u1Id
      }

      Session.set("UBA.FindingsIndividual.user.source", sUser)

      let tUser = {
        name: u2Name,
        uid: u2Id
      }

      Session.set("UBA.FindingsIndividual.user.target", tUser)

      Session.set("UBA.FindingsIndividual.compare.results", null)
      Session.set("UBA.FindingsIndividual.compare.results.total", null)

      Session.set("UBA.ComplianceCalculationIndividual.compare.results", null)
      Session.set("UBA.ComplianceCalculationIndividual.compare.results.total", null)

      $('.uba-grid-container .menu .item').tab('change tab', 'second')       
    }    
  },
  'mouseenter .match-percent'(e, tpl) {
    e.preventDefault()

    let 
      _x = e.pageX,
      _y = e.pageY,
      x = _x > 400 ? _x - 200 : _x, 
      y = _y > 500 ? _y - 200 : _y -120

    // console.log(_x, _y)

    let 
      u1Name = $(e.currentTarget).data('n1'),
      u2Name = $(e.currentTarget).data('n2'),
      u1Id = $(e.currentTarget).data('u1'),
      u2Id = $(e.currentTarget).data('u2'),
      u1C = $(e.currentTarget).data('c1'),
      u2C = $(e.currentTarget).data('c2')

    $('.uba-findings-bu-user-info').show().css({
      top: y + 'px',
      left: x + 'px'
    // }).html("<b>Top:</b> " + u2Name + "<br><b>Left:</b> " + u1Name)
    }).html(u1Name + " (" + u1C + ")" + "<br>" + u2Name + " (" + u2C + ")")

  },
  'mouseleave .match-percent'(e, tpl) {
    e.preventDefault()

    $('.uba-findings-bu-user-info').hide()
  },
  'click .btn-reset-findings-bu'(e, tpl) {
    e.preventDefault()

    Template.UBAFindingsBU.__helpers.get("resetData").call()
    Template.UBAFindingsBU.__helpers.get("resetDropdown").call()
  },
  'click .chkb-top-scores'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget).parent())

    let
      isChecked = $(e.currentTarget).is(':checked'),
      u1 = $(e.currentTarget).data('u1'),
      u2 = $(e.currentTarget).data('u2'),
      sid = $(e.currentTarget).data('sid')
    

    if(u1 && u2 && sid) {
      let _aU = [u1, u2]
      _aU.sort()
      
      let _key = _aU[0] + sid + _aU[1]
      // console.log(isChecked, _aU, sid, _key)

      let obj = {
        user1: _aU[0],
        user2: _aU[1],
        sid: parseInt(sid),
        cpKey: _key,
        cpValue: isChecked,
        admin: Meteor.userId()
      }

      Meteor.call("UserComparison.upsert", obj, (err, res) => {
        if(err) {
          Util.alert({mode: 'error', msg: "Something went wrong. Please try again. " + err})
        } else {
          Util.alert()
          // Template.UBAFindingsBU.__helpers.get("UsersCompared").call()
        }

        Util.loader({done: true});
      })
    } else {
      Util.alert({mode: 'error'});
      Util.loader({done: true})
    }
  },
  'click .btn-view-top-list'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))
    let 
      _len = Session.get("UBA.FindingsBU.results.top.length"),
      _proceed = false

    // // if(_len > 1000) {
    // //   if(confirm("The list will get only the users from the same countries. You can export all top users in case you need to view all.")) {
    // //     Session.set("UBA.FindingsBU.viewTopList", true)
    // //   }
    // // }
    if(_len > 500) {
      // alert("The list will get only the users from the same countries. You can export all top users in case you need to view all.")
      // Util.alert({mode: 'info', msg: "This might take a few more seconds. The list will get only the users from the same countries. You can export all top users in case you need to view all."})
      setTimeout(function() {
        Session.set("UBA.FindingsBU.viewTopList", true)
        Util.loader({done: true})
      }, 1000)        
      
    }  else {
      Session.set("UBA.FindingsBU.viewTopList", true)
      Util.loader({done: true})
    }   
    
    // if(_len > 500) {
    //   // alert("The list will get only the users from the same countries. You can export all top users in case you need to view all.")
    //   Util.alert({mode: 'info', msg: "The list will get only the users from the same countries. You can export all top users in case you need to view all."})
    // }    
  },
  'click .btn-export-top-list'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    setTimeout(function() {
      
      let _data = Session.get("UBA.FindingsBU.results.top")
      // let _data = Session.get("UBA.FindingsBU.results")

      let blob = new Blob([d3.csv.format(_data)], {type: "text/csv;charset=utf-8"});
      let _dlFilename = 'top-users-' + new Date().getTime() + '.csv'
      FileSaver.saveAs(blob, _dlFilename);

      Util.loader({done: true})

    }, 1000)
  }  
})

Template.UBAFindingsBU.onDestroyed(() => {
  Template.UBAFindingsBU.__helpers.get("resetData").call()
})

