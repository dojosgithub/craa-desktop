import { Session } from 'meteor/session'

import '/imports/lib/template-helpers.js'
import { Util } from '/imports/lib/util.js'

import { Simulations } from '/imports/api/simulations/simulations.js'
import { Findings } from '/imports/api/findings/findings.js'

import './findings-individual.html'
import '/imports/ui/stylesheets/uba/findings-individual.less'

// import './compliance-calculation-individual.js'

Template.UBAFindingsIndividual.onCreated(function() {

})

Template.UBAFindingsIndividual.onRendered(function() {

  Tracker.autorun(() => {
    
    if(Session.get("UBA.FindingsIndividual.users")) {

      // console.log(Session.get("UBA.FindingsIndividual.users"))
      $(".uba-findings-individual-source-user-search").search({
        source: Session.get("UBA.FindingsIndividual.users"),
        fields: {          
          title: 'name' 
        },
        searchFields: ['name'],
        // minCharacters : 3,
        // cache: false,
        onSelect(result, response) {
          if(result) {
            Session.set("UBA.FindingsIndividual.user.source", result)
          }
        }
      })

      $(".uba-findings-individual-target-user-search").search({
        source: Session.get("UBA.FindingsIndividual.users"),
        fields: {          
          title: 'name' 
        },
        searchFields: ['name'],
        // minCharacters : 3,
        // cache: false,
        onSelect(result, response) {
          if(result) {
            Session.set("UBA.FindingsIndividual.user.target", result)
          }
        }
      })
    } else {
      $(".uba-findings-individual-user").val('')
    }
// console.log(Session.get("UBA.FindingsIndividual.user.source"), Session.get("UBA.FindingsIndividual.user.target"))
    if(Session.get("UBA.FindingsIndividual.user.source")) {
      $("#uba_findings_individual_source_user").val(Session.get("UBA.FindingsIndividual.user.source").name)
    }

    if(Session.get("UBA.FindingsIndividual.user.target")) {
      $("#uba_findings_individual_target_user").val(Session.get("UBA.FindingsIndividual.user.target").name)      
    }

    if(Session.get("UBA.FindingsIndividual.sid")) {
      $(".sel-findings-individual-simulation").dropdown('set selected', Session.get("UBA.FindingsIndividual.sid"))  
    }

  })

  // $('.sel-findings-individual-simulation').dropdown({
    // clearable: true
  // })
})

Template.UBAFindingsIndividual.helpers({
  Simulations() {
    return Simulations.find();  
  },
  resetSearch() {
    Session.set("UBA.FindingsIndividual.users", []);
    Session.set("UBA.FindingsIndividual.findings", null);
    // Session.set("UBA.FindingsIndividual.user.source", null)
    // Session.set("UBA.FindingsIndividual.user.target", null)
    Session.set("UBA.FindingsIndividual.compare.results", []);
    Session.set("UBA.FindingsIndividual.compare.results.total", null);
    Session.set("UBA.FindingsIndividual.compare.results.hasStudy", null);   
    Session.set("UBA.ComplianceCalculationIndividual.compare.results", []); 
    
    // Session.set("UBA.FindingsIndividual.sid", null);

    // $('.sel-findings-individual-simulation').dropdown('clear');
    // // $('#sel_findings_individual_simulation').dropdown('clear');
    // $(".sel-findings-individual-simulation").dropdown('set selected', '-1')  

  },
  Findings() {
    return Session.get("UBA.FindingsIndividual.findings")
  },
  Results() {    
    // console.log(Session.get("UBA.FindingsIndividual.compare.results"))
    return Session.get("UBA.FindingsIndividual.compare.results")
  },
  Total() {
    return Session.get("UBA.FindingsIndividual.compare.results.total")
  },
  hasStudy() {
    return Session.get("UBA.FindingsIndividual.compare.results.hasStudy")
  },
  simSelected() {
    if(Session.get("UBA.FindingsIndividual.sid")) {
      return this.id === parseInt(Session.get("UBA.FindingsIndividual.sid"))
    }
  },
  // sourceUserName() {
  //   if(Session.get("UBA.FindingsIndividual.user.source")) {
  //     return Session.get("UBA.FindingsIndividual.user.source").name
  //   }
  // },
  // targetUserName() {
  //   if(Session.get("UBA.FindingsIndividual.user.target")) {
  //     return Session.get("UBA.FindingsIndividual.user.target").name
  //   }
  // },  
})

Template.UBAFindingsIndividual.events({
  'change #sel_findings_individual_simulation'(e, tpl) {
    e.preventDefault()
    
    Template.UBAFindingsIndividual.__helpers.get('resetSearch').call()

    $('.ui.search').search('clear cache')
    $(".uba-findings-individual-user").val('')

    let 
      sid = $('#sel_findings_individual_simulation').val(),
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
            Session.set("UBA.FindingsIndividual.users", users)
            Session.set("UBA.FindingsIndividual.sid", sid)

            Meteor.subscribe("findings_w_sid_mini", parseInt(sid))
          }
        }
      })
    }
  },
  'click .btn-compare-findings-individual'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))
    // $(".uba-findings-individual-column .attached.tab.first").addClass('loading')

    let
      sourceUser = Session.get("UBA.FindingsIndividual.user.source"),
      targetUser = Session.get("UBA.FindingsIndividual.user.target")      

    if(sourceUser && targetUser) {

      let obj = {
        sourceUser: sourceUser.uid,
        targetUser: targetUser.uid,
        sid: parseInt(Session.get("UBA.FindingsIndividual.sid")),
        findings: []
      }
// console.log(obj, Findings.find().fetch())
      findings = Findings.find({
        simulation_id: obj.sid
      }).fetch()

      let
       _findingIds = [],
       _findingsDict = []

      if(findings && findings.length > 0) {
        findings.forEach((f) => {
          _findingIds.push(f.id)
          // _findingsDict[f._id] = f.finding
          let fkey = 'f'+f.id
          _findingsDict[fkey] = f.finding
        })
      }
      obj.findings = _findingIds

      Meteor.call("UBA.FindingsIndividual.compare", obj, (err, res) => { //-- see users-score-summary
        if(err) {
          Util.alert({mode:'error', msg: err})
        } else {
          // console.log(res)
          if(res.success) {
            if(res.data) {
              
              let _cpFs = []
              res.data.forEach((d) => {
                if(d[0]) { //-- if sid exists, it's a normal findings data
                  let key = 'f'+d[0]
                  // let cpFsObj = {
                  //   finding: _findingsDict[key],
                  //   source: d[1] ? 'identified' : 'unidentified',
                  //   target: d[2] ? 'identified' : 'unidentified',
                  //   match: d[3] ? 'TRUE' : 'FALSE'
                  // }

                  let cpFsObj = {
                    id: d[0],
                    finding: _findingsDict[key],
                    source: d[1],
                    target: d[2],
                    match: d[3],
                    sNote: d[4],
                    tNote: d[5],
                    simil: d[6],
                    similF: d[7],
                    cAtClass: d[8],
                    simil3: d[9],
                    simil4: d[10]
                  }

                  // let cpFsObj = [_findingsDict[key],d[1],d[2], d[3]]
                
                  _cpFs.push(cpFsObj)
                } else { //-- if no sid exists, it's the Total data
                  Session.set("UBA.FindingsIndividual.compare.results.total", 
                    {findings: d[1], matched: d[2], percent: d[3], diff: d[5], tDup1m: d[6], tDup5m: d[7], tDup1mPercent: d[8], tDup5mPercent: d[9], tDupTotal: d[10]})
                  Session.set("UBA.FindingsIndividual.compare.results.hasStudy", d[4])
                }
              })

              Session.set("UBA.FindingsIndividual.compare.results", _cpFs)

              Template.UBAFindingsIndividual.__helpers.get("Results").call()
            }
          }
        }
        Util.loader({done: true})
        // $(".uba-findings-individual-column .attached.tab.first").removeClass('loading')
      })

    } else {
      Util.alert({mode: 'error', msg: "Both users to compare should be provided."})
      Util.loader({done: true})
      // $(".uba-findings-individual-column .attached.tab.first").removeClass('loading')
    }
  },
  'click .btn-view-compliance-data'(e, tpl) {
    e.preventDefault()

    // Template.UBAComplianceCalculationIndividual.__helpers.get("resetSearch").call()

    Session.set("UBA.ComplianceCalculationIndividual.user.source", Session.get("UBA.FindingsIndividual.user.source"))
    Session.set("UBA.ComplianceCalculationIndividual.user.target", Session.get("UBA.FindingsIndividual.user.target"))

    Session.set("UBA.ComplianceCalculationIndividual.sid", Session.get("UBA.FindingsIndividual.sid"))
    Session.set("UBA.ComplianceCalculationIndividual.users",  Session.get("UBA.FindingsIndividual.users"))
// console.log(Session.get("UBA.ComplianceCalculationIndividual.user.source"), Session.get("UBA.ComplianceCalculationIndividual.user.target"))

    // Template.UBAComplianceCalculationIndividual.__helpers.get("setUsers").call()

    $('.uba-grid-container .menu .item').tab('change tab', 'second')    

  },
  'click .btn-reset-findings-individual'(e, tpl) {
    e.preventDefault()

    Template.UBAFindingsIndividual.__helpers.get("resetSearch").call()
    
    Session.set("UBA.FindingsIndividual.sid", null)

    Session.set("UBA.FindingsIndividual.user.source", null)

    Session.set("UBA.FindingsIndividual.user.target", null)

    Session.set("UBA.FindingsIndividual.compare.results", null)
    Session.set("UBA.FindingsIndividual.compare.results.total", null)

    // Session.set("UBA.ComplianceCalculationIndividual.compare.results", null)
    // Session.set("UBA.ComplianceCalculationIndividual.compare.results.total", null)

    $("#sel_findings_individual_simulation").dropdown('clear')
    $("#uba_findings_individual_source_user").val('')
    $("#uba_findings_individual_target_user").val('')
    // $("#sel_findings_individual_simulation").val(-1)

    // $(".uba-findings-individual-source-user-search").search('clear cache')
    // $(".uba-findings-individual-target-user-search").search('clear cache')
    // $(".uba-findings-individual-user").val('')

    // $(".uba-findings-individual-source-user-search .results").remove()
    // $(".uba-findings-individual-target-user-search .results").remove()
  }  
})

Template.UBAFindingsIndividual.onDestroyed(function() {
  Template.UBAFindingsIndividual.__helpers.get("resetSearch").call()
})

