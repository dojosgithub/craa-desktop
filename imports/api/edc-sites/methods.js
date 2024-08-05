import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { EDCSites } from './edc-sites.js'

Meteor.methods({  
  'EDCSites.insert'(site) {
    check(site, {
      name: String,
      label: String,
      simulation_id: Number,
      protocol_id: Number
    })

    // this.unblock()

    let lastId = EDCSites.find({}, {
      sort: {id: -1},
      limit: 1
    }).fetch()

    let output = Meteor.wrapAsync((lastId, callback) => {

      if(lastId) {
        let 
          now = new Date,
          newId = parseInt(lastId)+1

        let siteObj = {
          id: newId,
          name: site.name,
          label: site.label,
          simulation_id: site.simulation_id,
          protocol_id: site.protocol_id,
          status: 1,          
          created: now,
          modified: now
        }

        EDCSites.insert(siteObj, (err, res) => {
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
