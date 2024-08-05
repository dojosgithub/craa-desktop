import { Session } from 'meteor/session'

import { Util } from '/imports/lib/util.js'

import { Simulations } from '/imports/api/simulations/simulations.js'

import './simulation-preferences.html'
import '/imports/ui/stylesheets/simulations/simulation-preferences.less'

Template.SimulationPreferences.onRendered(simPreferences => { 
})

Template.SimulationPreferences.helpers({
  rescuePillsPrescribed() {
    if(Session.get("Simulations.id")) {
      let sim = Simulations.findOne({
        id: Session.get("Simulations.id")
      })

      // console.log(Session.get("Simulations.id"), sim)

      if(sim) {
        Session.set("Simulations.rpp", sim.rescue_pills_prescribed)

        return sim.rescue_pills_prescribed
      }
    }
  }
})

Template.SimulationPreferences.events({
  'change #rescue_pills_prescribed'(e, tpl) {
    e.preventDefault()

    if(Session.get("Simulations.id")) {
      let simulation_id = parseInt(Session.get("Simulations.id"))
      // console.log(simulation_id)

      let rescuePillsPrescribed = $(e.currentTarget).is(':checked')

      let simObj = {
        id: simulation_id,
        rescue_pills_prescribed: rescuePillsPrescribed ? 1 : 0
      }

      Meteor.call("Simulations.update.rescuePillsPrescribed", simObj, (err, res) => {
        if(err) {
          Util.alert({mode: 'error', msg: err})
        } else {
          // if(res && res.data.affectedRows === 1) {
          if(res && res.data === 1) {
            Util.alert()
            // Session.set("Simulations.rpp", simObj.rescue_pills_prescribed)
          }            
        }
      })

    } else {
      Util.alert({mode: 'error'})
    }   

    Util.log(Meteor.user(), Session.get("Simulations.id")+"/changerpp", "simpref")    
  }  
})