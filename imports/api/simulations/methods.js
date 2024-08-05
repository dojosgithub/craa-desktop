import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Simulations } from './simulations.js'

// const all_simulations = new MysqlSubscription('all_simulations')

Meteor.methods({
  'Simulations.update'(simObj) {
    check(simObj, {
      id: Number,
      name: String,
      label: String
    })    

    // this.unblock()

    let output = Meteor.wrapAsync((simObj, callback) => {

      let update = Simulations.update({
        id: simObj.id
      }, {
        $set: {
          name: simObj.name,
          label: simObj.label,
          modified: new Date
        }
      }, (err, res) => {
        if(err) {
          // callback(null, {data: 'fail'})
          callback(null, {success: false, data: err})
        } else {
          // console.log(res)
          // callback(null, {data: res})
          callback(null, {success: true, data: res})
        }        
      })
// console.log(uppdate)
//       if(update && update === 1) {
//         callback(null, {success: true, data: update})        
//       } else {
//         callback(null, {success: false, data: 'Error'})
//       }

      // let query = `
      //   UPDATE craa_simulations 
      //   SET name = ${liveDb.db.escape(simObj.name)}, label = ${liveDb.db.escape(simObj.label)} 
      //   WHERE id = ${liveDb.db.escape(simObj.id)}
      // `      
      // liveDb.db.query(
      //   query,
      //   (err, res) => {
      //     if(err) {
      //       // callback(null, {data: 'fail'})
      //       callback(null, {success: false, data: err})
      //     } else {
      //       // callback(null, {data: res})
      //       callback(null, {success: true, data: res})
      //     }
      //   }
      // )   
    })

    let result = output(simObj)

    if(result) {
      return result
    }
  },
  'Simulations.update.rescuePillsPrescribed'(simObj) {
    check(simObj, {
      id: Number,
      rescue_pills_prescribed: Number      
    })    

    // this.unblock()

    let output = Meteor.wrapAsync((args, callback) => {

      Simulations.update({
        id: simObj.id
      }, {
        $set: {
          rescue_pills_prescribed: simObj.rescue_pills_prescribed,
          modified: new Date
        }
      }, (err, res) => {
        if(err) {
          callback(null, {data: 'fail'})
          // callback(null, {success: false, data: err})
        } else {
          callback(null, {data: res})
          // callback(null, {success: true, data: res})
        }        
      })

      // let query = `
      //   UPDATE craa_simulations 
      //   SET rescue_pills_prescribed = ${liveDb.db.escape(simObj.rescue_pills_prescribed)} 
      //   WHERE id = ${liveDb.db.escape(simObj.id)}
      // `      
      // liveDb.db.query(
      //   query,
      //   (err, res) => {
      //     if(err) {
      //       callback(null, {data: 'fail'})
      //     } else {
      //       callback(null, {data: res})
      //     }
      //   }
      // )   
    })

    let result = output('dk')

    if(result) {
      return result
    }
  },  
  'Simulations.insert'(sim) {
    check(sim, {
      name: String,
      label: String
    })

    // this.unblock()

    let lastId = Simulations.find({}, {
      sort: {id: -1},
      limit: 1
    }).fetch()

    let output = Meteor.wrapAsync((lastId, callback) => {

      if(lastId) {
        let 
          now = new Date,
          newId = parseInt(lastId)+1

        let simObj = {
          id: newId,
          name: sim.name,
          label: sim.label,
          time_hour: 2,
          status: 1,
          rescue_pills_prescribed: 0,
          created: now,
          modified: now
        }

        Simulations.insert(simObj, (err, res) => {
          if(err) {
            callback(null, {success: false, data: err})
          } else {

            callback(null, {success: true, data: res})

            // let query = `
            //   INSERT INTO craa_simulations (id, name, label, created, modified) 
            //   VALUES (${liveDb.db.escape(newId)}, ${liveDb.db.escape(sim.name)}, ${liveDb.db.escape(sim.label)}, ${liveDb.db.escape(now)}, ${liveDb.db.escape(now)})
            // `

            // liveDb.db.query(
            //   query,
            //   (err, res) => {
            //     if(err) {
            //       callback(null, {success: false, data: err})
            //     } else {
            //       callback(null, {success: true, data: res})
            //     }
            //   })


          }        
        })

      } else {
        callback(null, {success: false, data: "No last id to compute."})
      }


    })

    let result = output(lastId[0].id)

    if(result) {
      return result
    }
  },
  'Simulations.remove'(sid) {
    check(sid, Number)

    // this.unblock()

    let output = Meteor.wrapAsync((sid, callback) => {
      let now = new Date

      Simulations.update({
        id: sid
      }, {
        $set: {
          status: 2,
          modified: new Date
        }
      }, (err, res) => {
        if(err) {
          // callback(null, {data: 'fail'})
          callback(null, {success: false, data: err})
        } else {
          // callback(null, {data: res})
          callback(null, {success: true, data: res})
        }        
      })

      // let query = `
      //   UPDATE craa_simulations SET status = '2', modified = ${liveDb.db.escape(now)} 
      //   WHERE id = ${liveDb.db.escape(sid)}
      // `

      // liveDb.db.query(
      //   query,
      //   (err, res) => {
      //     if(err) {
      //       callback(null, {success: false, data: err})
      //     } else {
      //       callback(null, {success: true, data: res})
      //     }
      //   })
    })

    let result = output(sid)

    if(result) {
      return result
    }
  },
  'ETL.Simulations.transfer'() {
   
    // this.unblock()

    let 
      i = 0, 
      _outputData = {},
      now = new Date
    
    all_simulations.reactive()

    // console.log(all_behaviors.length)

    let output = Meteor.wrapAsync((args, callback) => {

      all_simulations.forEach((s) => {
        
        i++
        
        // let sObj = {
        //   id: s.id,
        //   name: s.name,
        //   label: s.label,
        //   time_hour: s.time_hour,
        //   status: s.status,
        //   rescue_pills_prescribed: s.rescue_pills_prescribed,
        //   created: s.created,
        //   modified: s.modified
        // }
        
        Simulations.upsert({
          id: s.id
        }, {
          $set: {
            name: s.name,
            label: s.label,
            time_hour: s.time_hour,
            status: s.status,
            rescue_pills_prescribed: s.rescue_pills_prescribed,
            created: s.created,
            modified: s.modified           
          }
        }, (err, res) => {          
          if(err) {
            _outputData = {success: false, data: err}
          } else {
            _outputData = {success: true, data: res}
          }          
        })

        if(i === all_simulations.length) {
          callback(null, _outputData)
        } 

      })
  
    })

    let result = output('dk')

    if(result) {
      return result
    }
  },
  "Simulations.findingsOrderUpdatedAt"(obj) {
    check(obj, {
      sid: Number
    });
    // this.unblock();

    Simulations.update({
      id: obj.sid
    }, {
      $set: {
        findingsOrderUpdatedAt: new Date
      }
    });
  },
  'Simulations.group.update'(obj) {
    check(obj, {
      _id: String,
      group: Match.Optional(Match.OneOf(undefined, null, Number))
    })
    // this.unblock();

    let output = Meteor.wrapAsync((args, callback) => {
      
      let _updated = Simulations.update(obj._id, {
        $set: {
          group: obj.group
        }
      })              
      
      callback(null, _updated)
  
    })

    let result = output('dk')

    if(result) {
      return { res: result };
    }
  },
  "Simulations.numOfSelectedFindings"(obj) {
    check(obj, {
      sid: Number,
      selected: Number
    })

    console.log(obj);

    return Simulations.update({
      id: obj.sid
    }, {
      $set: {
        numSelected: obj.selected
      }
    });

  }  
})