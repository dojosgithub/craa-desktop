import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

const XLSX = require('xlsx');

import { s3Config } from '/imports/startup/server/s3-config.js'

const os = Npm.require('os')
const fs = Npm.require('fs')

import { DocumentFolders } from '/imports/api/document-folders/document-folders.js'
import { Documents } from './documents.js'

// const all_documents = new MysqlSubscription('all_documents')

Meteor.methods({
  "Documents.export"(docObj) {
    check(docObj, {
      simulation_id: Number      
    })

    // this.unblock()

// console.log(docObj)

    if(docObj && docObj.simulation_id) {

      let output = Meteor.wrapAsync((args, callback) => {        

        let dfs = DocumentFolders.find({
          simulation_id: docObj.simulation_id
        }, {
          sort: {
            folder_order: 1
          }
        }).fetch()

        if(dfs && dfs.length > 0) {

          let data = [["Folder", "Document ID", "Document Name", "Status", "CreatedAt", "ModifiedAt"]]

          dfs.forEach((df) => {
            // let obj = {
            //   folder_name: df.name
            // }
            let obj = []

            let docs = Documents.find({
              folder_id: df.id
            }, {
              sort: {
                document_order: 1
              }
            }).fetch()

            if(docs && docs.length > 0) {
              docs.forEach((d) => {
                let status = d.status === 1 ? 'Active' : 'Inactive'
                obj = [df.name, d.id, d.name, status, d.created, d.modified]
                data.push(obj)
              })              
            } else {
              obj = [df.name, '', '', '', '', '']
              data.push(obj)
            }
            
          })

          const ws = XLSX.utils.aoa_to_sheet(data);
          const wb = {SheetNames: ["Sheet1"], Sheets:{Sheet1:ws }};

          callback(null, {success: true, data: wb})

        }


      })

      let result = output('dk')

      if(result) {
        return result
      }       
    }
  },  
//   "Documents.export"(docObj) {
//     check(docObj, {
//       simulation_id: Number,
//       document_list: Array
//     })

    // this.unblock()

// // console.log(docObj)

//     if(docObj && docObj.document_list.length > 0) {

//       let output = Meteor.wrapAsync((args, callback) => {        

//         let _docList = docObj.document_list

//         // let data = [["ID", "Document Name", "Folder", "Status", "CreatedAt", "ModifiedAt"]]
//         let data = [["Folder", "Document ID", "Document Name", "Status", "CreatedAt", "ModifiedAt"]]

//         _docList.forEach((df) => {

// // console.log(df, df.documents)
//           if(df.documents && df.documents.length > 0) {
//             let di = 0, dD = []
//             df.documents.forEach((d) => {
//               let 
//                 dfName = di === 0 ? df.name : '',
//                 dStatus = d.status === 1 ? 'Active' : 'InActive'

//               dD = [dfName, d.id, d.name, dStatus, d.created, d.modified] 
//               data.push(dD)
//               di++             
//             })


            
//           }

//           // return wb;            
//         })

//         const ws = XLSX.utils.aoa_to_sheet(data);
//         const wb = {SheetNames: ["Sheet1"], Sheets:{Sheet1:ws }};

//         callback(null, {success: true, data: wb})
//       })

//       let result = output('dk')

//       if(result) {
//         return result
//       }       
//     }
//   },  
  /*==============================*
   *   Documents methods          *
   *==============================*/  
  'Documents.orders.update'(docObj) {
    // console.log(docObj)
    if(docObj && docObj[0] && docObj[0].id) {
      check(docObj[0], {
        id: Match.Optional(Match.OneOf(undefined, null, Number)),
        order: Match.Optional(Match.OneOf(undefined, null, Number)),
        fid: Match.Optional(Match.OneOf(undefined, null, Number)),
      })

      // this.unblock()

      let 
        i = 0, 
        data = {},
        now = new Date

      let output = Meteor.wrapAsync((args, callback) => {
  // console.log(i, docObj.length)
        docObj.forEach((d, i) => {
          // console.log(d)
          // i++
          
          let order = d.order +1

          Documents.update({
            id: d.id
          }, {
            $set: {        
              document_order: order,
              modified: now
            }
          }, (err, res) => {

            // let query = `
            //   UPDATE craa_documents 
            //   SET document_order = ${liveDb.db.escape(order)}, modified = ${liveDb.db.escape(now)} 
            //   WHERE id = ${liveDb.db.escape(d.id)}
            // `      
            // liveDb.db.query(
            //   query,
            //   (err, res) => {
            //     if(err) {
            //       data = {data: 'fail'}
            //     } else {
            //       data = {data: res}
            //     }
            //   }
            // )

            if(err) {
              data = {data: 'fail'}
            } else {
              data = {data: res}
            }

            if(i === docObj.length-1) {
              callback(null, data)
            } 

          })       

        })
    
      })

      let result = output('dk')

      if(result) {
        return result
      }
    } else {
      return {data: 'fail'}
    }
  },
  'Documents.insert'(dObj) {
    check(dObj, {
      folder_id: Number,
      name: String,
      simulation_id: Number,
      document_order: Number,
      has_pills: Number,
      medication_type: Number,
      pills: Number,
      pills_taken: Number,
      pills_prescribed: Number
    })

    // this.unblock()

    let lastId = Documents.find({}, {
      sort: {id: -1},
      limit: 1
    }).fetch()

    let output = Meteor.wrapAsync((lastId, callback) => {

      if(lastId) {
        let 
          now = new Date,
          newId = parseInt(lastId)+1

        let _dObj = {
          id: newId,
          name: dObj.name,
          simulation_id: dObj.simulation_id,
          folder_id: dObj.folder_id,
          document_order: dObj.document_order,
          has_pills: dObj.has_pills,
          medication_type: dObj.medication_type,
          pills: dObj.pills,
          pills_taken: dObj.pills_taken,
          pills_prescribed: dObj.pills_prescribed,
          status: 1,
          created: now,
          modified: now
        }  

        Documents.insert(_dObj, (err, res) => {
          if(err) {
            data = {data: 'fail'}
          } else {
            data = {data: res}
          }
          callback(null, data)
        })

        // let query = `
        //   INSERT INTO craa_documents (id, name, document_order, folder_id, simulation_id, has_pills, medication_type, pills, pills_taken, pills_prescribed, created, modified) 
        //   VALUES (${liveDb.db.escape(newId)}, ${liveDb.db.escape(dObj.name)}, ${liveDb.db.escape(dObj.document_order)}, 
        //     ${liveDb.db.escape(dObj.folder_id)}, ${liveDb.db.escape(dObj.simulation_id)}, ${liveDb.db.escape(dObj.has_pills)}, 
        //     ${liveDb.db.escape(dObj.medication_type)}, ${liveDb.db.escape(dObj.pills)}, ${liveDb.db.escape(dObj.pills_taken)}, 
        //     ${liveDb.db.escape(dObj.pills_prescribed)}, ${liveDb.db.escape(now)}, ${liveDb.db.escape(now)})
        // `

        // liveDb.db.query(
        //   query,
        //   (err, res) => {
        //     if(err) {
        //       data = {data: 'fail'}
        //     } else {
        //       data = {data: res}
        //     }
        //     callback(null, data)
        //   }
        // )
      }
    })

    let result = output(lastId[0].id)

    if(result) {
      return result
    }
  },
  'Documents.update'(docObj) {
    check(docObj, {
      id: Number,
      name: String
    })    

    // this.unblock()

    let now = new Date

    let output = Meteor.wrapAsync((args, callback) => {

      Documents.update({
        id: docObj.id
      }, {
        $set: {
          name: docObj.name,
          modified: now
        }
      }, (err, res) => {
        if(err) {
          data = {data: 'fail'}
        } else {
          data = {data: res}
        }
        callback(null, data)
      })

      // let query = `
      //   UPDATE craa_documents 
      //   SET name = ${liveDb.db.escape(docObj.name)} 
      //   WHERE id = ${liveDb.db.escape(docObj.id)}
      // `      
      // liveDb.db.query(
      //   query,
      //   (err, res) => {
      //     if(err) {
      //       data = {data: 'fail'}
      //     } else {
      //       data = {data: res}
      //     }
      //     callback(null, data)
      //   }
      // )      
  
    })

    let result = output('dk')

    if(result) {
      return result
    }
  },
  'Documents.update.status'(docObj) {
    check(docObj, {
      id: Number,
      status: Number
    })    

    // this.unblock()

    let now = new Date

    let output = Meteor.wrapAsync((args, callback) => {

      Documents.update({
        id: docObj.id
      }, {
        $set: {
          status: docObj.status,
          modified: now
        }
      }, (err, res) => {
        if(err) {
          data = {data: 'fail'}
        } else {
          data = {data: res}
        }
        callback(null, data)
      })

      // let query = `
      //   UPDATE craa_documents 
      //   SET status = ${liveDb.db.escape(docObj.status)} 
      //   WHERE id = ${liveDb.db.escape(docObj.id)}
      // `      
      // liveDb.db.query(
      //   query,
      //   (err, res) => {
      //     if(err) {
      //       data = {data: 'fail'}
      //     } else {
      //       data = {data: res}
      //     }
      //     callback(null, data)
      //   }
      // )      
  
    })

    let result = output('dk')

    if(result) {
      return result
    }
  },
  'Documents.update.medication'(medObj) {
    check(medObj, {
      documentId: Number,
      medicationType: Number,
      pillsToShow: Number,
      pillsTaken: Number,
      pillsPrescribed: Number
    })    

    // let pillsPrescribed = null

    // if(medObj.medicationType === 1) {
    //   check(medObj, {
    //     pillsPrescribed: Number
    //   })

    //   pillsPrescribed = medObj.pillsPrescribed
    // }

    // this.unblock()

    let now = new Date

    let output = Meteor.wrapAsync((args, callback) => {

      Documents.update({
        id: medObj.documentId
      }, {
        $set: {
          medication_type: medObj.medicationType,
          pills: medObj.pillsToShow,
          pills_taken: medObj.pillsTaken,
          pills_prescribed: medObj.pillsPrescribed,          
          modified: now
        }
      }, (err, res) => {
        if(err) {
          data = {data: 'fail'}
        } else {
          data = {data: res}
        }
        callback(null, data)
      })

      // let query = `
      //   UPDATE craa_documents 
      //   SET medication_type = ${liveDb.db.escape(medObj.medicationType)},
      //   pills = ${liveDb.db.escape(medObj.pillsToShow)},
      //   pills_taken = ${liveDb.db.escape(medObj.pillsTaken)},
      //   pills_prescribed = ${liveDb.db.escape(medObj.pillsPrescribed)}
      //   WHERE id = ${liveDb.db.escape(medObj.documentId)}
      // `      
      // liveDb.db.query(
      //   query,
      //   (err, res) => {
      //     if(err) {
      //       data = {data: 'fail'}
      //     } else {
      //       data = {data: res}
      //     }
      //     callback(null, data)
      //   }
      // )      
  
    })

    let result = output('dk')

    if(result) {
      return result
    }
  },  
  // 'ETL.Documents.transfer'() {
   
    // this.unblock()

  //   let 
  //     i = 0, 
  //     _outputData = {},
  //     now = new Date
    
  //   all_documents.reactive()

  //   // console.log(all_behaviors.length)

  //   let output = Meteor.wrapAsync((args, callback) => {

  //     all_documents.forEach((d) => {
        
  //       i++
        
  //       Documents.upsert({
  //         id: d.id
  //       }, {
  //         $set: {
  //           name: d.name,            
  //           simulation_id: d.simulation_id,                              
  //           folder_id: d.folder_id,
  //           document_order: d.document_order,
  //           has_pills: d.has_pills,
  //           medication_type: d.medication_type,
  //           pills: d.pills,
  //           pills_taken: d.pills_taken,
  //           pills_prescribed: d.pills_prescribed,
  //           status: d.status,            
  //           created: d.created,
  //           modified: d.modified           
  //         }
  //       }, (err, res) => {          
  //         if(err) {
  //           _outputData = {success: false, data: err}
  //         } else {
  //           _outputData = {success: true, data: res}
  //         }          
  //       })

  //       if(i === all_documents.length) {
  //         callback(null, _outputData)
  //       } 

  //     })
  
  //   })

  //   let result = output('dk')

  //   if(result) {
  //     return result
  //   }
  // },  
})