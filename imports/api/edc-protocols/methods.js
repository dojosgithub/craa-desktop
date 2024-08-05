import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { EDCProtocols } from './edc-protocols.js'

Meteor.methods({  
  'EDCProtocols.insert'(proto) {
    check(proto, {
      name: String,
      label: String,
      simulation_id: Number
    })

    // this.unblock()

    let lastId = EDCProtocols.find({}, {
      sort: {id: -1},
      limit: 1
    }).fetch()

    let output = Meteor.wrapAsync((lastId, callback) => {

      if(lastId) {
        let 
          now = new Date,
          newId = parseInt(lastId)+1

        let protoObj = {
          id: newId,
          name: proto.name,
          label: proto.label,
          simulation_id: proto.simulation_id,        
          status: 1,          
          created: now,
          modified: now
        }

        EDCProtocols.insert(protoObj, (err, res) => {
          if(err) {
            callback(null, {success: false, data: err})
          } else {

            callback(null, {success: true, data: res})

          }        
        })

      } else {
        callback(null, {success: false, data: "No last id to compute."})
      }


    })

    let result = output(lastId && lastId[0] && lastId[0].id || '0')

    if(result) {
      return result
    }
  },
})
