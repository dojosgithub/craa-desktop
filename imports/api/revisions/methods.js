import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'

import { Revisions } from './revisions.js'

import { Simulations } from '/imports/api/simulations/simulations.js'

import { Util } from '/imports/lib/server/util.js'

Meteor.methods({
  "Revisions.insert"(obj) {

    let category = obj.category

    if(category === 1) {
      check(obj, {
        requester: String,
        category: Number,
        simulation_id: Number,
        name: String,
        label: String
      })
    }

    // this.unblock()

    let _rhObj = {
      revisor: obj.requester,
      category: obj.category,
      simulationId: obj.simulation_id,
      revision: {},
      createdAt: new Date,
      modifiedAt: new Date
    }

    if(category === 1) {
      _rhObj.revision = {
        name: obj.name,
        label: obj.label
      }
    }

    let output = Meteor.wrapAsync((_rhObj, callback) => {

        Revisions.insert(_rhObj, (err, res) => {
            let _outputData

            if(err) {

              _outputData = {success: false, data: err}

            } else {

              if(category === 1) {

                let simObj = {
                  id: obj.simulation_id,
                  name: obj.name,
                  label: obj.label
                }

                // Meteor.call("Simulations.update", simObj, (err, res) => {
                //   if(err) {
                //     _outputData = {success: false, data: err}
                //   } else {
                //     _outputData = {success: true, data: res}
                //   }
                //   callback(null, _outputData)
                // })
                let result = Util.revisionCall(category, 'Simulations.update', simObj)
                if(result) {
                  callback(null, result)
                }
              }

            }            
        })

    })

    let result = output(_rhObj)

    if(result) {
      return result
    }    
  }
})
