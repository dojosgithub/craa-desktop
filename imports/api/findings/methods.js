import { Promise } from 'meteor/promise'

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

// import { XLSX }  from 'xlsx' //-- Not working?
const XLSX = require('xlsx');

import { DocumentFolders } from '/imports/api/document-folders/document-folders.js';
import { Documents } from '/imports/api/documents/documents.js';
import { Findings } from './findings.js';
import { isPlainObject } from 'jquery';

// const all_behaviors = new MysqlSubscription('all_behaviors')

Meteor.methods({
  /*==============================*
   *   Findings methods    *
   *==============================*/  
   'Findings.update'(findingObj) {
      check(findingObj, {
        fid: String,
        dfid: Number,
        _dfid: String,
        id: Number,
        finding: String,
        severity: String,
        category_id: Number,
        category: String,
        cfr: String,
        ich_gcp: String,
        document_id: Number,
        compare_with: Number,        
      })

      // this.unblock()

      // console.log(findingObj)

      let _$set = {        
        finding: findingObj.finding,
        severity: findingObj.severity,
        category_id: findingObj.category_id,
        category: findingObj.category,
        cfr: findingObj.cfr,
        ich_gcp: findingObj.ich_gcp,
        modified: new Date
      }

      if(findingObj.document_id >= 0) { //-- when unlinking the doc, it should be 0
        _$set['document_id'] = findingObj.document_id
      }

      if(findingObj.compare_with >= 0) { //--when unlinking the doc, it should be 0
        _$set['compare_with'] = findingObj.compare_with
      }

      let output = Meteor.wrapAsync((args, callback) => {
            // DocumentFolders.update(findingObj._dfid, {
            //   $set: {
            //     trigger: new Date
            //   }
            // })
        Findings.update(findingObj.fid, {
          $set: _$set
        }, (err, res) => {
          if(err) {
            _outputData = {success: false, data: err}
          } else {            
            _outputData = {success: true, data: res}
          }
          callback(null, _outputData)           
        })
      })

      let result = output('dk')
// console.log(result)
      if(result) {
        return result
      }
   },
   'Findings.update.status'(findingObj) {
      check(findingObj, {
        _id: String,
        status: Number       
      })

      // this.unblock()

      let _outputData = {}

      let output = Meteor.wrapAsync((args, callback) => {

        Findings.update(findingObj._id, {
          $set: {
            status: findingObj.status,
            modified: new Date
          }
        }, (err, res) => {
          if(err) {
            _outputData = {success: false, data: err}
          } else {
            _outputData = {success: true, data: res}
          }
          callback(null, _outputData)           
        })
      })

      let result = output('dk')

      if(result) {
        return result
      }
   },
  upload: (bstr, name) => {
    /* read the data and return the workbook object to the frontend */
    return XLSX.read(bstr, {type:'binary'});
  },
  "Findings.export"(fObj) {
    check(fObj, {
      simulation_id: Number,
      documents: Array
    })

    let _findings = Findings.find({
      simulation_id: parseInt(fObj.simulation_id),
      status: {$ne: 4}
    }, {
      sort: {id: 1}
    })

    if(_findings && _findings.fetch() && _findings.fetch().length > 0) {

      let output = Meteor.wrapAsync((args, callback) => {

        let findings = _findings.fetch()

        let _docs = fObj.documents

        let data = [["id", "Finding", "Severity", "Domain", "CFR", 
          "ICH-GCP", "Document ID", "Document", "Document2 ID", "Document2", "Status"]]

        findings.forEach((f) => {

          let 
            document = _docs[f.document_id],
            compare = _docs[f.compare_with]

          let fD = [f.id, f.finding, f.severity, f.category, f.cfr, f.ich_gcp, 
            f.document_id, document, f.compare_with, compare, f.status]

          data.push(fD)

          // return wb;            
        })

        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = {SheetNames: ["Sheet1"], Sheets:{Sheet1:ws }};

        callback(null, {success: true, data: wb})
      })

      let result = output('dk')

      if(result) {
        return result
      }       
    }
  },
  'Findings.import'(bstr, name) {

    let findings = Findings.find().fetch()

    /* read the data and return the workbook object to the frontend */
    // return XLSX.read(bstr, {type:'binary'});
    let obj = {
      findings: findings,
      xlsx: XLSX.read(bstr, {type:'binary'})
    }
    return obj
  },
  'Findings.insert'(findingsObj) {
    check(findingsObj, {
      data: Array,
      simulation_id: Number
    })
    // this.unblock()

    let 
      i = 0, j =0,
      _outputData = {},
      now = new Date    

    let lastId = Findings.find({}, {
      sort: {id: -1},
      limit: 1
    }).fetch()

    let _domains = [
      {name: 'ICF Process', id: 1},
      {name: 'IRB Reporting', id: 2},
      {name: 'IEC Reporting', id: 2},
      {name: 'Protocol Requirement', id: 3},
      {name: 'IEC Submission/Approval', id: 4},
      {name: 'IRB Submission/Approval', id: 4},
      {name: 'Source Documentation', id: 5},        
      {name: 'Source to EDC/EDC', id: 6},
      {name: 'Potential Fraud', id: 7},
      {name: 'Delegation of Authority', id: 8},
      {name: 'Delegation of Authority and Training', id: 9},
      {name: 'Source Documentation/Source to EDC/EDC', id: 10},
      {name: 'Potential Fraud/Scientific Misconduct', id: 11}
    ]

    let _domainDict = []

    _domainDict['ICF Process'] = 1
    _domainDict['IRB Reporting'] = 2
    _domainDict['IEC Reporting'] = 2
    _domainDict['EC Reporting'] = 2
    _domainDict['Protocol Requirement'] = 3
    _domainDict['IRB Submission/Approval'] = 4
    _domainDict['IEC Submission/Approval'] = 4
    _domainDict['Source Documentation'] = 5
    _domainDict['Source Documentation / Source to CRF / CRF'] = 5
    _domainDict['Source to CRF/CRF'] = 6
    _domainDict['Source to EDC/EDC'] = 6
    _domainDict['Potential Fraud'] = 7
    _domainDict['Delegation of Authority'] = 8
    _domainDict['Source Documentation/Source to EDC/EDC'] = 10 
    _domainDict['Potential Fraud/Scientific Misconduct'] = 11 

    let output = Meteor.wrapAsync((lastid, callback) => {

      let 
        findingsArray = findingsObj.data,
        simulation_id = findingsObj.simulation_id
// console.log(findingsArray)
      if(findingsArray && findingsArray.length > 1 && simulation_id) {

        if(lastid) {

          let newId = parseInt(lastid)

          findingsArray.forEach((f) => {
            // i++

            if(f[0]) { //-- in any cases, Finding conetent is required

              // if(!f[0]) {
                newId++
              // }
              // newId = f[0] ? f[0] : newId + 1              
              j++
        
              // Findings.upsert({
              //   id: parseInt(f[0])
              // }, {
              //   $setOnInsert: {
              //     id: newId
              //   },
              //   $set: {
              //     finding: f[1].trim(),
              //     simulation_id: parseInt(simulation_id),
              //     severity: f[2].trim() || '',
              //     // category_id: parseInt(f[3]) || '',
              //     category: f[3].trim() || '',                
              //     cfr: f[4].trim() || '',
              //     ich_gcp: f[5].trim() || '',                
              //     document_id: parseInt(f[6]) || '',
              //     compare_with: parseInt(f[8]) || '',
              //     status: parseInt(f[10]) || '',
              //     created: new Date,
              //     modified: new Date
              //   }
              // }, (err, res) => {     
              //   i++ 
              //   // console.log(i, err, res, findingsArray.length)
              //   if(err) {
              //     _outputData = {success: false, data: err}
              //   } else {
              //     _outputData = {success: true, data: res}
              //   }

              //   if(i === findingsArray.length-1) {
              //     callback(null, _outputData)
              //   }
              // })

              let 
                _domain = f[2] && f[2].trim(),
                _domainId = _domainDict[_domain]

              if(_domainId) { //-- add findings only when they get domain id (=category id)
                Findings.insert({
                  id: newId,
                  finding: f[0] && f[0].trim(),
                  simulation_id: parseInt(simulation_id),
                  severity: f[1] && f[1].trim() || '',                
                  // category: f[2] && f[2].trim() || '',                
                  category: _domain,                
                  category_id: _domainId,                
                  cfr: f[3] && f[3].trim() || '',
                  ich_gcp: f[4] && f[4].trim() || '',                
                  document_id: f[5] && parseInt(f[5]) || '',
                  compare_with: f[7] && parseInt(f[7]) || '',
                  status: parseInt(f[9]) || '',
                  created: new Date,
                  modified: new Date                
                }, (err, res) => {     
                  i++ 
                  // console.log(i, err, res, findingsArray.length)
                  if(err) {
                    _outputData = {success: false, data: err}
                  } else {
                    _outputData = {success: true, data: res}
                  }

                  if(i === findingsArray.length-1) {
                    callback(null, _outputData)
                  }
                })

              } 
              else {
                callback(null, {success: false, data: 'domainId'})
              }

            } //-- if(f[0]) {
          })
        }
      }
  
    })

    let result = output(lastId[0].id)

    if(result) {
      return result
    }

  },
  "Findings.remove.all"(simulationId) {
    check(simulationId, Number)

    // let output = Meteor.wrapAsync((simulationId, callback) => {
    return Findings.update({
      simulation_id: simulationId
    }, {
      $set: {
        status: 4,
        modified: new Date
      }
    }, {
      multi: true
    })
  },
  'ETL.Findings.transfer'() {
   
    // this.unblock()

    let 
      i = 0, 
      _outputData = {},
      now = new Date
    
    all_behaviors.reactive()

    // console.log(all_behaviors.length)

    let output = Meteor.wrapAsync((args, callback) => {

      all_behaviors.forEach((f) => {
        
        i++
        
        // let fObj = {
        //   id: f.id,
        //   finding: f.behavior,
        //   simulation_id: f.simulation_id,
        //   document_id: f.document_id,
        //   compare_with: f.compare_with,
        //   severity: f.severity,
        //   cfr: f.cfr,
        //   ich_gcp: f.ich_gcp,
        //   category: f.category, 
        //   category_id: f.category_id,
        //   status: f.status,
        //   created: f.created,
        //   modified: f.modified || ''
        // }

        // // Findings.insert(fObj, (err, res) => {          
        Findings.upsert({
          id: f.id
        }, {
          $set: {
            finding: f.behavior,
            simulation_id: f.simulation_id,
            document_id: f.document_id,
            compare_with: f.compare_with,
            severity: f.severity,
            cfr: f.cfr,
            ich_gcp: f.ich_gcp,
            category: f.category, 
            category_id: f.category_id,
            status: f.status,
            created: f.created,
            modified: f.modified || ''            
          }
        }, (err, res) => {          
          if(err) {
            _outputData = {success: false, data: err}
          } else {
            _outputData = {success: true, data: res}
          }          
        })

        if(i === all_behaviors.length) {
          callback(null, _outputData)
        } 

      })
  
    })

    let result = output('dk')

    if(result) {
      return result
    }
  },   
  "Findings.w.sid.compact"(sid) {
    check(sid, Number)
    // this.unblock()

    return Findings.find({
      simulation_id: sid,
      status: 1
    }, {
      sort: {id: 1},
      fields: {
        id: 1,
        finding: 1
      }
    }).fetch()
  },
  // "Findings.by.sid"(obj) {
  //   check(obj, {
  //     sid: Number
  //   })
    // this.unblock()

  //   return Findings.find({
  //     simulation_id: obj.sid,
  //     status: 1
  //   }, {
  //     sort: {order: 1}
  //   }).fetch()
  // },
  "Findings.by.sid"(obj) {
    check(obj, {
      sid: Number
    })
    // this.unblock()

    let output = Meteor.wrapAsync((arg, callback) => {

      let pipelineFindings = 
      [
        {
          $match: {
            simulation_id: obj.sid,
            status: 1
          }
        },
        {
         $project: {
            id: 1,
            simulation_id: 1,
            finding: 1,
            order: { "$ifNull": [ "$order", 999 ] }          
          }        
        },
        {
          $sort: { "order": 1 }
        }                     
      ]

      // let _findings = aggregateQueryFindings(pipelineFindings, {cursor: {}});
      let _findings = Promise.await(Findings.rawCollection().aggregate(pipelineFindings).toArray());
// console.log(_findings)
      callback(null, {success: true, data: _findings})
    })

    let result = output('dq')

    if(result) {
      return result
    }
  },
  "Findings.by.sid.initial"(obj) {
    check(obj, {
      sid: Number
    })
    // this.unblock()

    let output = Meteor.wrapAsync((arg, callback) => {

      let pipelineFindings = 
      [
        {
          $match: {
            simulation_id: obj.sid,
            status: 1
          }
        },
        {
         $project: {
            id: 1,
            simulation_id: 1,
            finding: 1,
            order: { "$ifNull": [ "$order", 999 ] }          
          }        
        },
        {
          $sort: { "id": 1 }
        }                     
      ]

      // let _findings = aggregateQueryFindings(pipelineFindings, {cursor: {}});
      let _findings = Promise.await(Findings.rawCollection().aggregate(pipelineFindings).toArray());
// console.log(_findings)
      callback(null, {success: true, data: _findings})
    })

    let result = output('dq')

    if(result) {
      return result
    }
  },  
  "Findings.by.sid.ordered"(obj) {
    check(obj, {
      sid: Number
    })
    // this.unblock()

    let output = Meteor.wrapAsync((arg, callback) => {

      let _findings = Findings.find({
        simulation_id: obj.sid
      }, {
        sort: {
          order: 1
        }
      }).fetch();

      callback(null, {success: true, data: _findings})
    })

    let result = output('dq')

    if(result) {
      return result
    }

      // return Findings.find({
      //   simulation_id: obj.sid
      // }, {
      //   sort: {
      //     order: 1
      //   }
      // }).fetch();    
  },
  "Findings.by.sid.orderBy.id"(obj) {
    check(obj, {
      sid: Number
    })
    // this.unblock()

    let output = Meteor.wrapAsync((arg, callback) => {

      let _findings = Findings.find({
        simulation_id: obj.sid,
        status: 1
      }, {
        sort: {
          id: 1,
          order: 1,          
        }
      }).fetch();

      callback(null, {success: true, data: _findings})
    })

    let result = output('dq')

    if(result) {
      return result
    }

      // return Findings.find({
      //   simulation_id: obj.sid
      // }, {
      //   sort: {
      //     order: 1
      //   }
      // }).fetch();    
  },
  "Findings.bySid.orderedBy.domain"(obj) {
    check(obj, {
      sid: Number
    })
    // this.unblock()

    let output = Meteor.wrapAsync((arg, callback) => {

      let _findings = Findings.find({
        simulation_id: obj.sid,
        status: 1
      }, {
        sort: {
          order: 1,
          category: 1          
        }
      }).fetch();

      callback(null, {success: true, data: _findings})
    })

    let result = output('dq')

    if(result) {
      return result
    }    
  },  
  "Findings.count"() {
    // this.unblock()

    let output = Meteor.wrapAsync((arg, callback) => {

      // let 
        // rawFindings = Findings.rawCollection(),
        // aggregateQueryFindings = Meteor.wrapAsync(rawFindings.aggregate, rawFindings);

      let pipelineFindings = 
      [
        {
          $match: {
            status: 1
          }
        },
        {
          $group: {
            "_id": "$simulation_id",
            "count": { $sum: 1 }
          }
        },
        {
         $project: {
            "_id": 0,
            sid: "$_id",
            count: 1
          }        
        }                     
      ]

      // let _findings = aggregateQueryFindings(pipelineFindings, {cursor: {}});
      let _findings = Promise.await(Findings.rawCollection().aggregate(pipelineFindings).toArray());    
      
      Meteor.call("SimUsersSummary.scored.count",{}, (err, res) => {
        if(err) {
          callback(null, {success: false, data: null});
        } else {
          if(res && res.data) {
            callback(null, {success: true, data: {findings: _findings, simulations: res.data }})
          } else {
            callback(null, {success: false, data: null});
          }
        }        
      });

      // callback(null, {success: true, data: _findings})
    })

    let result = output('dq')

    if(result) {
      return result
    }
  },
  "Findings.orders.update"(obj) {
    // check(obj, [{
    //   sid: Number,
    //   id: Number,
    //   order: Number,
    //   _order: Number,
    //   finding: String
    // }]);
    check(obj, {
      sid: Number,
      orders: [{
        id: Number,
        order: Number,
        _order: Number,
        finding: String
      }]});    
    // this.unblock();

    let output = Meteor.wrapAsync((arg, callback) => {

      let _findingsOrderUpdateBulk = Findings.rawCollection().initializeUnorderedBulkOp();

      obj.orders.map((f) => {
        _findingsOrderUpdateBulk.find( { id: f.id } ).update( {
          $set: { order: f.order }
        });       
      })

      _findingsOrderUpdateBulk.execute();

      callback(null, {success: true, data: obj.orders })
    })

    let result = output('dq')

    if(result) {

      // let _updatedFindings = Findings.find({
      //   simulation_id: obj.sid,
      //   status: 1
      // }, {
      //   $sort: {
      //     order: 1        
      // }}).fetch();

      // result.data = _updatedFindings;

      return result
    }
  },
  "Findings.order.export"(fObj) {
    check(fObj, {
      sid: Number      
    })

    let _findings = Findings.find({
      simulation_id: fObj.sid,
      status: 1
    }, {
      sort: {
        order: 1,
        id: 1
      }
    });

    if(_findings && _findings.fetch() && _findings.fetch().length > 0) {

      let output = Meteor.wrapAsync((args, callback) => {

        let _docs = Documents.find({
          simulation_id: fObj.sid,
          status: 1
        }).fetch();

        let _docDict = [];

        if(_docs && _docs.length > 0) {
          _docs.map((d) => {
            let _dkey = 'd_'+d.id;

            if(!_docDict[_dkey]) {
              _docDict[_dkey] = d;
            }
          })
        }

        let data = [["Order", "Id", "Finding", "Severity", "Domain", "CFR", 
          "ICH-GCP", "Document ID", "Document", "Document2 ID", "Document2"]]

        _findings.forEach((f) => {

          let 
            docKey = 'd_'+ f.document_id,
            cpKey = 'd_'+ f.compare_with;

          let 
            docId = f.document_id,
            docName = docKey && _docDict[docKey] && _docDict[docKey].name,
            cpId = f.compare_with,
            cpName = cpKey && _docDict[cpKey] && _docDict[cpKey].name;

          let fD = [f.order, f.id, f.finding, f.severity, f.category, f.cfr, f.ich_gcp, 
            f.document_id, docName, f.compare_with, cpName]

          data.push(fD)

          // return wb;            
        })

        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = {SheetNames: ["Findings"], Sheets:{Findings:ws }};

        callback(null, {success: true, data: wb})
      })

      let result = output('dk')

      if(result) {
        return result
      }       
    }
  },
  "Findings.tips.update"(obj) {
    check(obj, {
      id: Number,
      tips: Array
    })
    // this.unblock();

    return Findings.update({
      id: obj.id
    }, {
      $set: {
        tips: obj.tips
      }
    })
  },
  "Findings.exclude"(obj) {
    check(obj, {
      _id: String,
      excluded: Boolean
    })

    return Findings.update({
      _id: obj._id
    }, {
      $set: {
        excluded: obj.excluded
      }
    });

  }
})