import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Util } from '/imports/lib/server/util.js'

import { DocumentFolders } from './document-folders.js'
import { DocumentFolderColors } from '../document-folder-colors/document-folder-colors.js'

// const all_document_folders = new MysqlSubscription('all_document_folders')

Meteor.methods({
  /*==============================*
   *   Document Folder methods    *
   *==============================*/
  'DocumentFolders.insert'(dfObj) {
    check(dfObj, {
      name: String,
      simulation_id: Number,
      order: Number
    })

    // this.unblock()

    let now = new Date

    let lastId = DocumentFolders.find({}, {
      sort: {id: -1},
      limit: 1
    }).fetch()

    let output = Meteor.wrapAsync((lastId, callback) => {

      if(lastId) {
        let 
          now = new Date,
          newId = parseInt(lastId)+1

        let dfoObj = {
          id: newId,
          name: dfObj.name,
          simulation_id: dfObj.simulation_id,
          folder_order: dfObj.order,
          status: 1,          
          created: now,
          modified: now
        }

        DocumentFolders.insert(dfoObj, (err, res) => {
          if(err) {
            data = {data: 'fail'}
          } else {
            data = {data: res}
          }
          callback(null, data)
        })

        // let query = `
        //   INSERT INTO craa_document_folders (id, name, folder_order, simulation_id, created, modified) 
        //   VALUES (${liveDb.db.escape(newId)}, ${liveDb.db.escape(dfObj.name)}, ${liveDb.db.escape(dfObj.order)}, 
        //     ${liveDb.db.escape(dfObj.simulation_id)}, ${liveDb.db.escape(now)}, ${liveDb.db.escape(now)})
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
  'DocumentFolders.orders.update'(docFolderObj) {
    check(docFolderObj[0], {
      id: Number,
      order: Number
    })    

    // this.unblock()

    let 
      i = 0, 
      data = {},
      now = new Date

    let output = Meteor.wrapAsync((args, callback) => {
// console.log(i, docFolderObj.length)
      docFolderObj.forEach((d) => {
        // console.log(d)
        i++
        
        let order = d.order +1

        DocumentFolders.update({
          id: d.id
        }, {
          $set: {        
            folder_order: order,
            modified: now
          }
        })

        // let query = `
        //   UPDATE craa_document_folders 
        //   SET folder_order = ${liveDb.db.escape(order)}, modified = ${liveDb.db.escape(now)} 
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

        if(i === docFolderObj.length) {
          callback(null, data)
        }        

      })
  
    })

    let result = output('dk')

    if(result) {
      return result
    }
  },
  'DocumentFolders.update.status'(docFolderObj) {
    check(docFolderObj, {
      id: Number,
      status: Number
    })    
    // this.unblock()

    let now = new Date

    let output = Meteor.wrapAsync((args, callback) => {

      DocumentFolders.update({
        id: docFolderObj.id
      }, {
        $set: {
          status: docFolderObj.status,
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
      //   UPDATE craa_document_folders 
      //   SET status = ${liveDb.db.escape(docFolderObj.status)}, modified = ${liveDb.db.escape(now)} 
      //   WHERE id = ${liveDb.db.escape(docFolderObj.id)}
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
  'DocumentFolders.update.name'(docFolderObj) {
    check(docFolderObj, {
      id: Number,
      name: String
    })    
    // this.unblock()

    let now = new Date

    let output = Meteor.wrapAsync((args, callback) => {

      DocumentFolders.update({
        id: docFolderObj.id
      }, {
        $set: {
          name: docFolderObj.name,
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
      //   UPDATE craa_document_folders 
      //   SET name = ${liveDb.db.escape(docFolderObj.name)} 
      //   WHERE id = ${liveDb.db.escape(docFolderObj.id)}
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
  'DocumentFolders.get.allActive'(options) {
    check(options, {
      simulations: Match.Optional(Match.OneOf(undefined, null, Array)),
    })
    // this.unblock();

    let output = Meteor.wrapAsync((args, callback) => {

      let $_match = {
        status: 1
      };

      let $_sort = {
        "name": 1,
        "docs.document_order": -1
      }

      if(options.simulations && options.simulations.length > 0) {
        $_match['simulation_id'] = { $in: options.simulations };
        $_sort = {
          "folder_order": 1,
          "docs.document_order": -1
        }        
      }

      let 
        _colors = DocumentFolderColors.find().fetch(),
        _folderColorDict = [],
        _docColorDict = [];

      if(_colors && _colors.length > 0) {
        _colors.forEach((c) => {
          if(c.type === 'folder') {
            if(!_folderColorDict[c.name]) {
              _folderColorDict[c.name] = c.color;
            }
          } else {
            _docColorDict[c.name] = c.color;
          }
        })
      }

      let pipelineDocumentFolders = 
      [
        {
          $match: $_match
        },
       {
          $lookup: {
             from: "simulations",
             let: { sid: "$simulation_id" },
             pipeline: [
                { $match:
                   { $expr:
                      { $and:
                         [
                           { $eq: [ "$id",  "$$sid" ] },
                           { $eq: [ "$status", 1 ] }
                         ]
                      }
                   }
                },
                // { $sort: { "document_order": 1 } }
             ],
             as: "sims"
          }
        },        
        {
          $unwind: "$sims"
        },
       {
          $lookup: {
             from: "documents",
             let: { id: "$id" },
             pipeline: [
                { $match:
                   { $expr:
                      { $and:
                         [
                           { $eq: [ "$folder_id",  "$$id" ] },
                           { $eq: [ "$status", 1 ] }
                         ]
                      }
                   }
                },
                { $sort: { "document_order": -1, "id": 1 } }             
             ],
             as: "docs"
          }
        },        
        {
          $unwind: "$docs"
        },
        // {
        //   $match: {
        //     "docs.status": 1,
        //     // "docs.has_pills": { $ne: 1 }
        //   }
        // },
        // {
        //   $sort: {
        //     "doc.document_order": 1
        //   }
        // },
        {
          $group: {
            "_id": "$name",
            "id": { $first: "$id" },
            "folder_order": { $first: "$folder_order" },
            // "document_order": { $first: "$folder_order" },
            "folder_ids": { $addToSet: "$id" },
            "document_ids": { $addToSet: "$docs.id" },
            "document_names": { $addToSet: "$docs.name" },
            "docs": { $addToSet: {id: "$docs.id", name:"$docs.name", order: "$docs.document_order"} }
          }          
        },
        {
         $project: {
            "_id": 0,
            "id": "$id",
            "folder_order": "$folder_order",
            "name": "$_id",
            "folder_ids": "$folder_ids",
            "document_ids": "$document_ids",
            "document_names": "$document_names",
            "docs": "$docs"
          }        
        },
        {
          $sort: $_sort
        }                     
      ]

      let 
        _docFolders = Promise.await(DocumentFolders.rawCollection().aggregate(pipelineDocumentFolders).toArray()),
        _docFolders1 = [],
        _docFolders2 = [],
        _docFolders3 = [];

      if(_docFolders && _docFolders.length > 0) {
        let _divider = 3;

        _docFolders.forEach((d,i) => {
          // if(i & 1) { //-- odd
          //   d.
          //   _docFoldersOdd.push(d);
          // } else { //-- even

          // }

          // d.document_names.sort((a,b) => {            
          //   return ('' + a).localeCompare(b);
          // });

          d['color'] = _folderColorDict[d.name];
          d['doc_ids'] = d.document_ids.join('_');
          d['docs_count'] = 0;
          d['colored_docs_count'] = 0;
          d['all_docs_colored'] = false;

          if(d.docs) {
            // let _docNames = d.document_names.map((d,i) => {
            //   return {
            //     name: d,
            //     id: d.document_ids && d.document_ids[i] || null,
            //     color: _docColorDict[d]
            //   }
            // })            

            let _coloredDocsCount = 0;

            let _uniqueDocs = Util.uniqueObject(d.docs, 'name');

            d['docs_count'] = _uniqueDocs.length;

            let _docs = _uniqueDocs.map((c,i) => {
              
              let _color = _docColorDict[c.name];

              if(_color) {
                _coloredDocsCount++;
              }
              return {
                name: c.name,
                id: c.id,
                color: _color,
                order: c.order
              }
            })

            d['colored_docs_count'] = parseInt(_coloredDocsCount);
            
            if(_coloredDocsCount === _uniqueDocs.length) {
              d['all_docs_colored'] = true;
            }

            d['docs'] = _docs;
          }

          if(i%_divider === 0) {
            _docFolders1.push(d);
          }
          else if(i%_divider === 1) {
            _docFolders2.push(d);
          }
          else {
            _docFolders3.push(d);
          }

        })
      }

      // callback(null, {success: true, data: _docFolders})
      // callback(null, {success: true, data: {
      //   folder1: _docFolders1,
      //   folder2: _docFolders2,
      //   folder3: _docFolders3
      // }})

      callback(null, {success: true, data: [_docFolders1,_docFolders2,_docFolders3]});

    })

    let result = output('dk')

    if(result) {
      return result
    }

  }
  // 'ETL.DocumentFolders.transfer'() {
   
  //   this.unblock()

  //   let 
  //     i = 0, 
  //     _outputData = {},
  //     now = new Date
    
  //   all_document_folders.reactive()

  //   // console.log(all_behaviors.length)

  //   let output = Meteor.wrapAsync((args, callback) => {

  //     all_document_folders.forEach((d) => {
        
  //       i++
        
  //       DocumentFolders.upsert({
  //         id: d.id
  //       }, {
  //         $set: {
  //           name: d.name,            
  //           simulation_id: d.simulation_id,
  //           folder_order: d.folder_order,
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

  //       if(i === all_document_folders.length) {
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