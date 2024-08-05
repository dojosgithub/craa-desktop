import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

// import { XLSX }  from 'xlsx' //-- Not working?
const XLSX = require('xlsx');

import { Util } from '/imports/lib/server/util.js'

import { MonitoringNotes } from './monitoring-notes.js';
import { AssesseeLog } from '/imports/api/assessee-log/assessee-log.js';
import { Assessments } from '/imports/api/assessments/assessments.js';
import { Documents } from '/imports/api/documents/documents.js';


Meteor.methods({
  'MonitoringNotes.export'(user) {
    check(user, {
      uid: String,
      sid: Number,
      cid: String,
      buid: String
    })

    let notes = MonitoringNotes.find({
      creator: user.uid,
      simulation_id: user.sid.toString(),
      client_id: user.cid,
      bu_id: user.buid,
      // status: 1
    }, {
      sort: {
        createdAt: 1,
        // modifiedAt: 1
      }
    }).fetch()

    if(notes && notes.length > 0) {

      let output = Meteor.wrapAsync((sid, callback) => {

        let documents = Documents.find({
          simulation_id: sid,
          status: 1
        }).fetch()

        let docs = []
        if(documents && documents.length > 0) {
          documents.forEach((d) => {
            docs[d.id] = d.name
          })
        }

        let data = [["content", "document", "page", "viewport", "Status", "MNID", "created [UTC]", "modified [UTC]"]]

        notes.forEach((n) => {

          let 
            doc = docs[n.document.document_id],
            _status = n.status,
            _rStatus = ''

          if(_status === 4) {
            _rStatus = "Deleted"
          }
          else {
            if(new Date(n.createdAt).getTime() !== new Date(n.modifiedAt).getTime()) {
              _rStatus = 'Edited'
            }
          }

          let note = [n.content, doc, n.page, n.viewport, _rStatus, n.key, Util.dateHMS2(n.createdAt), Util.dateHMS2(n.modifiedAt)]

          data.push(note)

          // return wb;            
        })

        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = {SheetNames: ["Monitoring Notes"], Sheets:{'Monitoring Notes':ws }};

        callback(null, {success: true, data: wb})
      })

      let result = output(user.sid)

      if(result) {
        return result
      }       
    }

  },
  'ETL.MonitoringNotes.modified'() {
    // check(obj, {
    //   userId: String,
    //   simulationId: Number      
    // })

    let targets = Assessments.find({
      createdAt: {
        $lt: new Date("2017-08-24T01:00:00.000Z")
      }
    }, {
      sort: {
        createdAt: -1
      },
      // skip: 0,
      // limit: 1
    }).fetch()

/*
console.log(targets)  
 _id: 'gJhmCqdhzQLcFZEhv',
  assessee_id: 'MxWD7wAni5qm98sgy',
*/
    let i = 0;
    if(targets && targets.length > 0) {
      targets.forEach((a) => {
        // if(i < 10) {
        //   console.log(targets[i]._id)
        // }
        // i++

        let 
          assessee = a.assessee_id,
          simulation = a.simulation_id; //-- String

        let notes = MonitoringNotes.find({
          creator: assessee,
          simulation_id: simulation
        }).fetch()

        if(notes && notes.length > 0) {
          notes.forEach((n) => {
            MonitoringNotes.update({
              _id: n._id
            }, {
              $set: {
                modifiedAt: n.createdAt
              }
            })            
          })
        }

        let logs = AssesseeLog.find({
          'assessee.assessee_id': assessee,
          'simulation.id': parseInt(simulation),
          trigger: 'mnes'
        }, {
          fields: {
            note: 1
          }
        }).fetch()

        if(logs && logs.length > 0) {
          logs.forEach((l) => {
            let
              noteId = l.note._id, 
              modified = l.note.modifiedAt;

            let note = MonitoringNotes.findOne(noteId)
              
            if(note) {
              let mAt = note.modifiedAt

              if(modified !== mAt) {
                MonitoringNotes.update(noteId, {
                  $set: {
                    modifiedAt: modified
                  }
                })                
              }
            }

          })
        }
      })
    }

    // let logs = AssesseeLog.find({
    //   // 'assessee.assessee_id': userId,
    //   // 'simulation.id': simulationId,
    //   trigger: 'mnes',
    //   createdAt: {
    //     $lt: new Date("2017-08-23T23:00:00.000Z")
    //   }
    // }, {
    //   fields: {
    //     note: 1
    //   },
    //   sort: {
    //     createdAt: -1
    //   }
    // }).fetch()

// console.log(logs[0])

    // if(logs && logs.length > 0) {
    //   let creators = [];

    //   logs.forEach((l) => {
    //     let
    //       noteId = l.note._id, 
    //       modified = l.note.modifiedAt

    //     let note = MonitoringNotes.findOne(noteId)
          
    //     if(note) {
    //       let mAt = note.modifiedAt

    //       if(modified !== mAt) {
    //         MonitoringNotes.update(noteId, {
    //           $set: {
    //             modifiedAt: modified
    //           }
    //         })

    //         creators.push(note.creator)
    //       }
    //     }
    //   })


    // }

  }
})
