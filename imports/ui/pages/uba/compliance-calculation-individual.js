import { Session } from 'meteor/session'

import '/imports/lib/template-helpers.js'
import { Util } from '/imports/lib/util.js'

import { Simulations } from '/imports/api/simulations/simulations.js'

import './compliance-calculation-individual.html'
import '/imports/ui/stylesheets/uba/compliance-calculation-individual.less'

Template.UBAComplianceCalculationIndividual.onCreated(function() {

})

Template.UBAComplianceCalculationIndividual.onRendered(function() {

  Tracker.autorun(() => {
    // console.log(Session.get("UBA.FindingsIndividual.sid"))
    if(Session.get("UBA.ComplianceCalculationIndividual.sid")) {      
      $(".sel-comp-calc-individual-simulation").dropdown('set selected', Session.get("UBA.ComplianceCalculationIndividual.sid"))  
    }

    if(Session.get("UBA.ComplianceCalculationIndividual.users")) {

      // console.log(Session.get("UBA.FindingsIndividual.users"))
      $(".uba-comp-calc-individual-source-user-search").search({
        source: Session.get("UBA.ComplianceCalculationIndividual.users"),
        fields: {          
          title: 'name' 
        },
        searchFields: ['name'],
        // minCharacters : 3,
        // cache: false,
        onSelect(result, response) {
          if(result) {
            Session.set("UBA.ComplianceCalculationIndividual.user.source", result)
          }
        }
      })

      $(".uba-comp-calc-individual-target-user-search").search({
        source: Session.get("UBA.ComplianceCalculationIndividual.users"),
        fields: {          
          title: 'name' 
        },
        searchFields: ['name'],
        // minCharacters : 3,
        // cache: false,
        onSelect(result, response) {
          if(result) {
            Session.set("UBA.ComplianceCalculationIndividual.user.target", result)
          }
        }
      })

    } else {
      $(".uba-comp-calc-individual-user").val('')
    }

    if(Session.get("UBA.ComplianceCalculationIndividual.user.source")) {
      // console.log(Session.get("UBA.ComplianceCalculationIndividual.user.source"))
      // $(".uba-comp-calc-individual-source-user-search").search('set value', Session.get("UBA.ComplianceCalculationIndividual.user.source")) 
      $("#uba_comp_calc_individual_source_user").val(Session.get("UBA.ComplianceCalculationIndividual.user.source").name)
    }

    if(Session.get("UBA.ComplianceCalculationIndividual.user.target")) {
      // console.log(Session.get("UBA.ComplianceCalculationIndividual.user.target"))
      $("#uba_comp_calc_individual_target_user").val(Session.get("UBA.ComplianceCalculationIndividual.user.target").name)      
    }

  })
  
})

Template.UBAComplianceCalculationIndividual.helpers({  
  Simulations() {
    return Simulations.find()
  },
  Results() {    
    // console.log(Session.get("UBA.FindingsIndividual.compare.results"))
    return Session.get("UBA.ComplianceCalculationIndividual.compare.results")
  },
  resetSearch() {
    Session.set("UBA.ComplianceCalculationIndividual.compare.results", [])
    Session.set("UBA.ComplianceCalculationIndividual.compare.results.total", null)

    Session.set("UBA.ComplianceCalculationIndividual.users", null)
    Session.set("UBA.ComplianceCalculationIndividual.sid", null)

    // Session.set("UBA.ComplianceCalculationIndividual.user.source", null)
    // Session.set("UBA.ComplianceCalculationIndividual.user.target", null)

  },
  resetUser() {
    Session.set("UBA.ComplianceCalculationIndividual.user.source", null)
    Session.set("UBA.ComplianceCalculationIndividual.user.target", null)
  },
  Total() {
    return Session.get("UBA.ComplianceCalculationIndividual.compare.results.total")
  },
  // setUsers() {

  //   Session.set("UBA.ComplianceCalculationIndividual.user.source", Session.get("UBA.FindingsIndividual.user.source"))
  //   Session.set("UBA.ComplianceCalculationIndividual.user.target", Session.get("UBA.FindingsIndividual.user.target"))

  //   $("#uba_comp_calc_individual_source_user").val(Session.get("UBA.FindingsIndividual.user.source").name)
  //   $("#uba_comp_calc_individual_target_user").val(Session.get("UBA.FindingsIndividual.user.target").name)

  // }  
})

Template.UBAComplianceCalculationIndividual.events({
  'change #sel_comp_calc_individual_simulation'(e, tpl) {
    e.preventDefault()
    
    Template.UBAFindingsIndividual.__helpers.get('resetSearch').call()
    Template.UBAComplianceCalculationIndividual.__helpers.get("resetSearch").call()

    $('.ui.search').search('clear cache')
    $(".uba-comp-calc-individual-user").val('')

    let 
      sid = $('#sel_comp_calc_individual_simulation').val(),
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
            Session.set("UBA.ComplianceCalculationIndividual.users", users)
            Session.set("UBA.ComplianceCalculationIndividual.sid", sid)

            Meteor.subscribe("findings_w_sid_mini", parseInt(sid))
          }
        }
      })
    }
  },  
  'click .btn-compare-comp-calc-individual'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    let
      sourceUser = Session.get("UBA.ComplianceCalculationIndividual.user.source"),
      targetUser = Session.get("UBA.ComplianceCalculationIndividual.user.target"),
      sid = Session.get("UBA.ComplianceCalculationIndividual.sid")      
// console.log(sourceUser, targetUser, sid)
    if(sourceUser && targetUser && sid) {

      let obj = {
        sourceUser: sourceUser.uid,
        targetUser: targetUser.uid,
        sid: parseInt(sid)        
      }

      Meteor.call("UBA.ComplianceCalculationIndividual.compare", obj, (err, res) => {
        if(err) {
          Util.alert({mode:'error', msg: err})
        } else {
          // console.log(res)
          if(res.success) {
            if(res.data) {
              Session.set("UBA.ComplianceCalculationIndividual.compare.results", res.data)
              Session.set("UBA.ComplianceCalculationIndividual.compare.results.total", res.data[res.data.length-1])
            } else {
              Util.alert({mode:'error'})
            }
          } else {
            Util.alert({mode:'error'})
          }
        }              
        Util.loader({done: true})        
      })

    } else {
      Util.alert({mode: 'error', msg: 'Not enough input data.'})
      Util.loader({done: true})  
    }   
  },
  'click .btn-reset-comp-calc'(e, tpl) {
    e.preventDefault()

    Template.UBAComplianceCalculationIndividual.__helpers.get("resetSearch").call()
    Template.UBAComplianceCalculationIndividual.__helpers.get("resetUser").call()

    $("#sel_comp_calc_individual_simulation").dropdown('clear')

    $('.uba-comp-calc-individual-source-user-search').search('clear cache')
    $('.uba-comp-calc-individual-target-user-search').search('clear cache')
    $(".uba-comp-calc-individual-user").val('')


  }  
})



