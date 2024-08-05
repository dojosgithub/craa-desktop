import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { EDCSubjects } from './edc-subjects.js'

Meteor.methods({  
  'EDCSubjects.insert'(subject) {
    // console.log(subject)
    check(subject, {
      name: String,
      label: String,
      simulation_id: Number,
      protocol_id: Number,
      site_id: Number
    })

    // this.unblock()

    let lastId = EDCSubjects.find({}, {
      sort: {id: -1},
      limit: 1
    }).fetch()

    let output = Meteor.wrapAsync((lastId, callback) => {

      if(lastId) {
        let 
          now = new Date,
          newId = parseInt(lastId)+1

        let subjectObj = {
          id: newId,
          name: subject.name,
          label: subject.label,
          simulation_id: subject.simulation_id,
          protocol_id: subject.protocol_id,
          site_id: subject.site_id,
          status: 1,          
          created: now,
          modified: now
        }

        EDCSubjects.insert(subjectObj, (err, res) => {
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
  "EDCSubjects.get.bySiteId"(subject) { 
    // console.log(subject)
    // check(subject, {site_id: Match.Optional(Match.OneOf(undefined, null, Number))});
    check(subject, {site_id: Number});
    // check(subject, Number)

    // this.unblock();

    let output = Meteor.wrapAsync((args, callback) => {
      
      let _subjects = EDCSubjects.find({site_id: subject.site_id}).fetch()

      if(_subjects) {
        callback(null, {success: true, data: _subjects}) 
      } else {
        callback(null, {success: false, data: 0})
      }

    })

    let result = output('dq')

    if(result) {
      return result
    }    
  }
})
