import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

const XLSX = require('xlsx');

import { SimUsersSummary } from './sim-users-summary.js';
import { SimulationStatus } from '/imports/api/simulation-status/simulation-status.js';
import { SimulationUsersStatusRT } from '/imports/api/simulation-users-status-rt/simulation-users-status-rt.js';
import { AssesseeLog } from '/imports/api/assessee-log/assessee-log.js';
import { Assessments } from '/imports/api/assessments/assessments.js';
import { ScoringBehaviors } from '/imports/api/scoring-behaviors/scoring-behaviors.js';

Meteor.methods({
  "SimUsersSummary.user"(uid) {
    check(uid, String)

    return SimUsersSummary.find({
      userId: uid
    }).fetch()
  },
  "ETL.SimUsersSummary.setOStartDate"() {
    // this.unblock()

    let output = Meteor.wrapAsync((args, callback) => {

      // let _initSUS = SimUsersSummary.find({
      //   oStartedAt: {$exists: false}
      // }).fetch()   

      // if(_initSUS && _initSUS.length > 0) {
      //   _initSUS.forEach((s) => {
      //     SimUsersSummary.update(s._id, {
      //       $set: {
      //         oStartedAt: ""
      //       }
      //     })          
      //   })
      // }

      // let _sStatus = SimulationStatus.find({
      //   status: 'started'
      // }).fetch()

      // if(_sStatus && _sStatus.length > 0) {

      //   _sStatus.forEach((s, i) => {
      //     SimUsersSummary.update({
      //       userId: s.user_id,
      //       buId: s.bu_id,
      //       simulationId: s.simulation_id,
      //       oStartedDate: { $exists: false }
      //     }, {
      //       $set: {
      //         oStartedAt: s.createdAt || null
      //       }
      //     })

      //     if(i === _sStatus.length -1) {
      //       callback(null, {success: true, data: i})
      //     }
      //   })
      // }
      
      let _sus = SimUsersSummary.find().fetch()

      if(_sus && _sus.length > 0) {
        _sus.forEach((s, i) => {
          let _aLog = AssesseeLog.findOne({
            'assessee.assessee_id': s.userId,
            'simulation.client_id': s.clientId,
            'simulation.bu_id': s.buId,
            'simulation.id': s.simulationId,
            trigger: 'simst'
          })

          if(_aLog) {
            SimUsersSummary.update(s._id, {
              $set: {
                oStartedAt: _aLog.createdAt
              }
            })
          }

          if(i === _sus.length -1) {
            callback(null, {success: true, data: i})
          }

        })
      }

    })

    let result = output('dk')

    if(result) {
      return result
    }

  },
  "UBA.FindingsIndividual.users"(sid) {
    check(sid, Number)
    // this.unblock()

    return SimUsersSummary.find({
      simulationId: sid,
      roleKey: '6',
      resultStage: {$ne: ''}
    }, {
      sort: {firstname: 1},
      fields: {
        firstname: 1,
        lastname: 1,
        userId: 1
      }
    }).fetch()
  },
  "ETL.SimUsersSummary.addReopenedKey"() {
    // this.unblock()

    let output = Meteor.wrapAsync((args, callback) => {
      
      let _susr = SimulationUsersStatusRT.find({
        status: "Reopened"
      }, {
        fields: {
          userId: 1,
          simulationId: 1,
          clientId: 1          
        }
      }).fetch()

      if(_susr && _susr.length > 0) {

        _susr.forEach((s, i) => {

          SimUsersSummary.update({
            clientId: s.clientId,
            userId: s.userId,
            simulationId: s.simulationId
          }, {
            $set: {
              reopened: true
            }
          })

          if(i === _susr.length -1) {
            callback(null, {success: true, data: i})
          }

        })
      }

    })

    let result = output('dk')

    if(result) {
      return result
    }

  },
  "SimUsersSummary.update.qa"(obj) {
    check(obj, {
      _id: String,
      assessmentId: String,
      qa: Number
    });
    // this.unblock();

    let output = Meteor.wrapAsync((args, callback) => {

      if(obj._id) {

        let _res = SimUsersSummary.update(obj._id, {
          $set: {
            qa: obj.qa
          }
        });

        if(_res) {

          let 
            _asmt = Assessments.findOne(obj.assessmentId),
            _assessor = [];

          if(_asmt) {
            if(_asmt.assessor && _asmt.assessor.length > 0) {
              _assessor = _asmt.assessor;
            }            
          }

          _res = Assessments.update(obj.assessmentId, {
            $set: {
              qa: obj.qa,
              assessor: _assessor
            }
          });
          callback(null, {success: true, data: _res});
        } else {
          callback(null, {success: true, data: _res});
        }
      } else {
        callback(null, {success: false, data: null});
      }

    });

    let result = output('dk')

    if(result) {
      return result
    };
  },
  "SimUsersSummary.update.qaScorers"(obj) {
    check(obj, {
      _id: String,
      assessmentId: String,
      qaScorers: Array
    });
    // this.unblock();

    let output = Meteor.wrapAsync((args, callback) => {

      if(obj._id) {        

        // let _res = SimUsersSummary.update(obj._id, {
        //   $set: {
        //     qaScorers: obj.qaScorers
        //   }
        // });


        let 
          _sus = SimUsersSummary.findOne(obj._id);
          // $_set = {};
// console.log(_sus)
        if(_sus) {

          let 
            _qaData = _sus.qaData || [],
            _qaScorersOld = [],
            _qaScorersNew = _sus.qaScorers;

          _qaData.forEach((q,i) => {
            if(q && q._id) {
              _qaScorersOld.push(q._id);
              if(!obj.qaScorers.includes(q._id)) { //-- if the scorer is not picked this time
                _qaData[i]._status = 4; //-- update its status to '4:deleted'
              } else {
                _qaData[i]._status = 1;
              }
            }
          })

          $_set = {
            qaScorers: obj.qaScorers,
            qaData: _qaData
          }

          obj.qaScorers.forEach((q) => {
            if(!_qaScorersOld.includes(q)) {
              let _qaDataObj = {
                _id: q,
                _status: 1            
              }

              $_set.qaData.push(_qaDataObj);              
            }
          })

          let _res = SimUsersSummary.update(obj._id, {
            $set: $_set
          });

          let 
            _asmt = Assessments.findOne(obj.assessmentId);
            // $_set = {};
// console.log(_asmt)
          if(_asmt) {

            let 
              _qaData = _asmt.qaData || [],
              _qaScorersOld = [],
              _qaScorersNew = _asmt.qaScorers;

            _qaData.forEach((q,i) => {
              if(q && q._id) {
                _qaScorersOld.push(q._id);
                if(!obj.qaScorers.includes(q._id)) { //-- if the scorer is not picked this time
                  _qaData[i]._status = 4; //-- update its status to '4:deleted'
                } else {
                  _qaData[i]._status = 1;
                }
              }
            })

            $_set = {
              qaScorers: obj.qaScorers,
              qaData: _qaData
            }

            obj.qaScorers.forEach((q) => {
              if(!_qaScorersOld.includes(q)) {
                let _qaDataObj = {
                  _id: q,
                  _status: 1
                }

                $_set.qaData.push(_qaDataObj);              
              }
            })

            _res = Assessments.update(obj.assessmentId, {
              $set: $_set
            });

            if(_res) {
              callback(null, {success: true, data: _res});
            } else {
              callback(null, {success: true, data: _res});
            }

          } //-- if(_asmt) {
          else {
            callback(null, {success: false, data: null});
          }
        } //-- if(_sus)
        else {
          callback(null, {success: false, data: null});  
        }

      } else {
        callback(null, {success: false, data: null});
      }

    });

    let result = output('dk');

    if(result) {
      return result;
    };
  },
  "SimUsersSummary.qaAnswers.update"(obj) {
    check(obj, {
      assessmentId: String,
      id: Number,
      identified: Boolean
    });
    // this.unblock();

    let _sus = SimUsersSummary.findOne({
      assessmentId: obj.assessmentId,
      'qaAnswers.id': obj.id
    });

    let _res = null;

    if(_sus) {

      _res = SimUsersSummary.update({
        assessmentId: obj.assessmentId,
        'qaAnswers.id': obj.id
      }, {
        $set: {
          'qaAnswers.$.identified': obj.identified
        }
      });

    } else {
      _res = SimUsersSummary.update({
        assessmentId: obj.assessmentId
      }, {
        $addToSet: {
          qaAnswers: {
            id: obj.id,
            identified: obj.identified,
            mnid: 0
          }
        }
      });      
    }

    // let _bh = ScoringBehaviors.findOne({
    //   assessment_id: obj.assessmentId,
    //   'qaAnswer.id': obj.id
    // });

    // if(_bh) {

      _res = ScoringBehaviors.update({
        assessment_id: obj.assessmentId,
        'behavior.id': obj.id
      }, {
        $set: {
          'qaAnswer.identified': obj.identified
        }
      });

    // } else {
    //   _res = ScoringBehaviors.update({
    //     assessment_id: obj.assessmentId,
    //     id: obj.id
    //   }, {
    //     $addToSet: {
    //       qaAnswer: {
    //         id: obj.id,
    //         identified: obj.identified,
    //         mnid: 0
    //       }
    //     }
    //   });      
    // }
// console.log(_res)
    return _res || 1;

  },
  "SimUsersSummary.qaAnswers.update.mnid"(obj) {
    check(obj, {
      assessmentId: String,
      id: Number,
      mnid: Match.Optional(Match.OneOf(undefined, null, Number))
    });
    // this.unblock();

    let _res = SimUsersSummary.update({
      assessmentId: obj.assessmentId,
      'qaAnswers.id': obj.id
    }, {
      $set: {
        'qaAnswers.$.mnid': obj.mnid
      }
    });

    _res = ScoringBehaviors.update({
      assessment_id: obj.assessmentId,
      'behavior.id': obj.id
    }, {
      $set: {
        'qaAnswer.mnid': obj.mnid
      }
    });

    return _res
  },
  "SimUsersSummary.get.qa.data"(obj) {
    check(obj, {
      assessmentId: String
    });
    // this.unblock();

    let _initQaAnswers = [];

    let output = Meteor.wrapAsync((args, callback) => {

      let _sbs = ScoringBehaviors.find({
        assessment_id: obj.assessmentId,
        qa: { $exists: false } //-- this is critical to get only the initial sbs done by the original scorers as we only need this for collecting correct answers
      }).fetch();

      if(_sbs && _sbs.length > 0) {

        
        _sbs.forEach((f) => {
          let a1,a2,adj,identified,mnid;             
          if(f.assessor1) {
            a1 = f.assessor1.identified || (f.assessor1.identified === false ? false : null);
          }
          if(f.assessor2) {
            a2 = f.assessor2.identified || (f.assessor2.identified === false ? false : null);
          }
          if(a1 !== a2 && f.adjudicator) {
            identified = f.adjudicator.identified || (f.adjudicator.identified === false ? false : null);
            mnid = f.adjudicator.mnid || null;
          } else {
            mnid = f.assessor2 && f.assessor2.mnid || null;
            identified = a2;
          }

          let _qaAnswerObj = {
            id: f.behavior.id,
            identified: identified,
            mnid: mnid
          }

          _initQaAnswers.push(_qaAnswerObj);

        })

        SimUsersSummary.update({
          assessmentId: obj.assessmentId
        },{
          $set: {
            qaAnswers: _initQaAnswers
          }
        });

      } //-- if(_sbs && _sbs.length > 0) {

      let pipelineSUS = 
      [
        {
          $match: {
            assessmentId: obj.assessmentId
          }
        },
        {
          $lookup: {
            from: 'monitoring_notes',
            let: { 
              uid: '$userId', 
              asmtId: '$assessmentId', 
              strSid: { $toString: '$simulationId'}              
            },
            pipeline: [
              {
                $match: {
                  status: 1,
                  $expr: {
                    $and: [
                      { $eq: ['$creator', '$$uid'] },
                      { $eq: ['$simulation_id', '$$strSid'] }
                    ]
                  }
                }
              },
              // {}
              // { $project: { id: 0, _id: 0 } }
            ],
            as: 'notes'
          }
        },
        {
          $unwind: "$notes"
        },
        {
          $match: {
            "notes.status": 1
          }
        },        
        {
          $lookup: {
            from: "scoring_behaviors",
            localField: "assessmentId",
            foreignField: "assessment_id",
            as: "sbs"
          }
        },
        {
          $lookup: {
            from: "document_folders",
            localField: "simulationId",
            foreignField: "simulation_id",
            as: "dfs"
          }
        },
        {
          $unwind: "$dfs"
        },
        {
          $match: {
            "dfs.status": 1
          }
        },
        {
          $lookup: {
            from: "documents",
            localField: "dfs.id",
            foreignField: "folder_id",
            as: "docs"
          }
        },
        {
          $unwind: "$docs"
        },
        {
          $match: {
            "docs.status": 1
          }
        },
        {
          $group: {
            "_id": {
                assessmentId: "$assessmentId",
                userId: "$userId",
                simulationId: "$simulationId"
            },
            qaAnswers: { $first: "$qaAnswers" },
            qaScorers: { $first: "$qaScorers" },
            notes: { $addToSet: "$notes" },
            dfs: { $addToSet: "$dfs" },
            docs: { $addToSet: "$docs" },
            sbs: { $first: "$sbs" },
            scorer1Id: { $first: "$scorer1Id" },
            scorer2Id: { $first: "$scorer2Id" },
            fullname: { $first: "$fullname" },
            initial: { $first: "$initial" }
          }
        },
        {
          $project: {
            _id: 0,
            uid: "$_id.userId",
            aid: "$_id.assessmentId",
            sid: "$_id.simulationId",                    
            qaAnswers: "$qaAnswers",
            qaScorers: "$qaScorers",
            notes: "$notes",
            sbs: "$sbs",
            dfs: "$dfs",
            docs: "$docs",
            scorer1Id: "$scorer1Id",
            scorer2Id: "$scorer2Id",
            fullname: "$fullname",
            initial: "$initial"
          }
        },
        // {
        //   $sort: { //-- not working
        //     // "dfs.folder_order": 1,
        //     // "docs.document_order": 1,
        //     // "notes.key": 1
        //   }
        // }               
      ]
      
      let _sus = Promise.await(SimUsersSummary.rawCollection().aggregate(pipelineSUS).toArray());      
// console.log(_sus)
      if(_sus && _sus.length > 0) {

        _sus.forEach((s, i) => { //-- actually only one element, so, this can be just _sus[0] instead of a loop block
          let 
            _assessmentId = s.aid,
            _userId = s.uid,
            _simulationId = parseInt(s.sid),
            _docFoldersRaw = s.dfs,
            _docsRaw = s.docs,
            _notesRaw = s.notes,
            _sbsRaw = s.sbs, //-- scoring behaviors data of all scorers(=QA scorers + initial 2 scorers)
            // _qaAnswers = s.qaAnswers,
            _qaAnswers = _initQaAnswers,
            _qaScorers = s.qaScorers || [],
            _allQAScorersIds = [],
            _allQAScorers = [],
            _usersDict = [],
            _scorerDummies = [],
            _totalFindings = 0,
            _userQAScoreDict = [],
            _fullname = s.fullname,
            _initial = s.initial;

          // if(_qaScorers && _qaScorers.length > 0) {
            
            _allScorersIds = _qaScorers.concat([s.scorer1Id, s.scorer2Id]); //-- QA scorers + initial 2 scorers
            // _allScorersIds = [s.scorer1Id, s.scorer2Id].concat(_qaScorers); //-- QA scorers + initial 2 scorers

            let _users = Meteor.users.find({
              _id: { $in: _allScorersIds }
            }, {
              fields: {
                'profile.firstname': 1,
                'profile.lastname': 1,
                'profile.fullname': 1
              }
            }).fetch();

            if(_users && _users.length > 0) {

              // _users.sort((a,b) => {
              //   return a.profile.firstname.localeCompare(b.profile.firstname);
              // })

              _users.forEach((u,i) => { //-- 07/07/2021, redundant but needed to keep the initial scorers in the beginning of the scorer list
                if(u.profile) {

                  if(u._id === s.scorer1Id) {
                    u.profile['_order'] = 0;
                  }
                  else if(u._id === s.scorer2Id) {
                    u.profile['_order'] = 1;
                  } else {
                    u.profile['_order'] = 99;
                  }
                }
              }); //-- _users.forEach((u,i) => {

              _users.sort((a,b) => a.profile._order - b.profile._order);

              // console.log(_users);

              _users.forEach((u,i) => {
                if(u.profile) {
                  
                  u.profile['order'] = i+1;
                  // u.profile['_order'] = 99;                  
                  u.profile['percent'] = 0;                

                  _usersDict[u._id] = u

                  _userQAScoreDict[u._id] = 0;

                  //-- this one doesn't work as it becomes mutable for any
                  //-- scoring_behavior data. This should be done inside 
                  //-- the loop where each scoring_behaviors data is dealt.
                  // let _dummyScorer = {
                  //   uid: u._id,
                  //   ufname: u.profile.firstname,
                  //   ulname: u.profile.lastname,
                  //   ufullname: u.profile.fullname,
                  //   order: i+1,
                  //   identified: null,
                  //   point: null,
                  //   mnid: null
                  // }

                  // _scorerDummies.push(_dummyScorer); 
                }
              }); //-- _users.forEach((u,i) => {

              _allQAScorers = _users;

            }

          // } //-- if(_qaScorers && _qaScorers.length > 0) {
// console.log(_usersDict)
// console.log(_allQAScorers)
          _docFoldersRaw.sort((a,b) => {
            return a.folder_order - b.folder_order;
          });

          _docsRaw.sort((a,b) => {
            return a.document_order - b.document_order;
          });

          _notesRaw.sort((a,b) => {
            return a.key - b.key;
          });
// console.log(_notesRaw)
          let 
            _docFolderDict = [],
            _docDict = [],
            _noteDocDict = [],
            _notes = [],
            _qaAnswersDict = [],
            _sbsDocDict = [];

          if(_notesRaw && _notesRaw.length > 0) {

            _notesRaw.forEach((n,i) => {
              let _dkey = 'd' + n.document.document_id;

              if(!_noteDocDict[_dkey]) {
                _noteDocDict[_dkey] = {
                  did: n.document.document_id,
                  dfid: n.document.folder_id,
                  notes: []
                };
              }

              _noteDocDict[_dkey].notes.push(n);
            });

          } else { //-- if(_notesRaw && _notesRaw.length > 0) {
            callback(null, {success: true, msg: "No monitoring notes to view."});
          }

          if(_docsRaw && _docsRaw.length > 0) {
            _docsRaw.forEach((d,i) => {

              let
                _docKey = 'd'+d.id, 
                _folderKey = 'df'+d.folder_id;

              if(!_docDict[_docKey]) {
                _docDict[_docKey] = d;
              }

              if(!_docFolderDict[_folderKey]) {
                _docFolderDict[_folderKey] = [];
              }

              _docFolderDict[_folderKey].push(d);

              // let _notesOnThisDoc = _noteDocDict['d'+d.id] && _noteDocDict['d'+d.id].notes || null;

              // if(_notesOnThisDoc) {
              //   let _noteObj = {
              //     folderId: d.folder_id,
              //     documentId: d.id,
              //     name: d.name,
              //     hasPills: d.has_pills,
              //     notes: _noteDocDict['d'+d.id] && _noteDocDict['d'+d.id].notes || []
              //   }

              //   _notes.push(_noteObj);
              // }
            })
          } //-- if(_docsRaw && _docsRaw.length > 0) {

          if(_docFoldersRaw && _docFoldersRaw.length > 0) {
            _docFoldersRaw.forEach((df,i) => {
              let _dfkey = 'df'+df.id;
              if(_docFolderDict[_dfkey]) {
                let _docs = _docFolderDict[_dfkey];

                _docs.forEach((d) => {

                  let _notesOnThisDoc = _noteDocDict['d'+d.id] && _noteDocDict['d'+d.id].notes || null;

                  if(_notesOnThisDoc) {
                    let _noteObj = {
                      folderId: d.folder_id,
                      documentId: d.id,
                      name: d.name,
                      hasPills: d.has_pills,
                      notes: _noteDocDict['d'+d.id] && _noteDocDict['d'+d.id].notes || []
                    }

                    _notes.push(_noteObj);
                  }

                })
              }
            })
          };

          if(_qaAnswers && _qaAnswers.length > 0) {
            _qaAnswers.forEach((q) => {
              let _fkey = 'f'+q.id;
              if(!_qaAnswersDict[_fkey]) {
                _qaAnswersDict[_fkey] = q  
              }
            })

            _totalFindings = _qaAnswers.length;
            // console.log(_totalFindings);
          }
// console.log(_qaAnswersDict)
          if(_sbsRaw && _sbsRaw.length > 0) {
            // console.log(_scorerDummies)
            // console.log(_sbsRaw.length);
            _sbsRaw.forEach((s) => {
              if(s.behavior) {
// console.log(s.behavior)
                let 
                  _dkey = 'd'+s.behavior.document_id,                  
                  _fkey = 'f'+s.behavior.id,
                  // _answer = _qaAnswersDict[_fkey] && _qaAnswersDict[_fkey].identified,
                  _answer = null,
                  _amnid = _qaAnswersDict[_fkey] && _qaAnswersDict[_fkey].mnid || null;

                if(_qaAnswersDict[_fkey]) {
                  _answer = _qaAnswersDict[_fkey].identified;
                }
// console.log(_fkey, _qaAnswersDict, _qaAnswersDict[_fkey]);

                if(!_sbsDocDict[_dkey]) {
                  // console.log("dkey => ", _dkey);
                  _sbsDocDict[_dkey] = [];                  
                };

                if(!_sbsDocDict[_dkey][_fkey]) {

                  //-- this dummyScorer block may be inefficient in itself, 
                  //-- but, should be done this way for now to avoid data-overwritten 
                  //-- issue due to its mutable nature.                          
                  let _initialScorersData = [];

                  _allQAScorers.forEach((u,i) => {
                    if(u.profile) {
                      u.profile['order'] = i+1;
                      _usersDict[u._id] = u

                      let _dummyScorer = {
                        uid: u._id,
                        ufname: u.profile.firstname,
                        ulname: u.profile.lastname,
                        ufullname: u.profile.fullname,
                        order: i+1,
                        identified: null,
                        point: null,
                        mnid: null,
                        _order: 99,
                        cAt: new Date
                      }

                      _initialScorersData.push(_dummyScorer);
                    }
                  });

                  _sbsDocDict[_dkey][_fkey] = {
                    finding: s.behavior.finding,
                    fid: s.behavior.id,
                    answer: _answer,
                    mnid: _amnid,
                    scorers: _initialScorersData
                  }

                };

                let 
                  _uid = null,
                  _identified = null,
                  _mnid = null;

                if(s.qa && s.assessor) { //-- QA scorer's scoring_behavior data
                  if(s.assessor) {
                    let 
                      _assessor = s.assessor,
                      _uid = _assessor._id,
                      _idx = _usersDict[_uid] && _usersDict[_uid].profile.order -1,
                      _point = _assessor.identified === _answer ? 1 : 0;
                    
                    // let _scorersHash = _sbsDocDict[_dkey][_fkey].scorers;

                    // let _scorerObj = {
                    //   uid: _uid,
                    //   ufname: _usersDict[_uid].profile.firstname,
                    //   ulname: _usersDict[_uid].profile.lastname,
                    //   ufullname: _usersDict[_uid].profile.fullname,
                    //   order: _usersDict[_uid].profile.order,
                    //   identified: _assessor.identified,
                    //   point: _assessor.identified === _answer ? 1 : 0,
                    //   mnid: _assessor.mnid
                    // }

                    // _sbsDocDict[_dkey][_fkey].scorers.push(_scorerObj);
                    if( _sbsDocDict[_dkey][_fkey].scorers[_idx]) {
                      _sbsDocDict[_dkey][_fkey].scorers[_idx].identified = _assessor.identified;
                      _sbsDocDict[_dkey][_fkey].scorers[_idx].point = _point;
                      _sbsDocDict[_dkey][_fkey].scorers[_idx].mnid = _assessor.mnid || null;
                      _sbsDocDict[_dkey][_fkey].scorers[_idx].cAt = s.createdAt;

                      _userQAScoreDict[_uid] += _point;

                      let _percent = 0;

                      if(_userQAScoreDict[_uid] > 0) {
                        _percent = Math.round(_userQAScoreDict[_uid] / _totalFindings * 100);
                      }
                      
                      _allQAScorers[_idx].profile.percent = _percent;
                    }

// console.log(_point, _userQAScoreDict[_uid], _totalFindings, _percent)
                    // console.log(_dkey, _fkey, _usersDict[_uid].profile.fullname, _usersDict[_uid].profile.order, _idx)
                    // console.log(_sbsDocDict[_dkey][_fkey].scorers)
// console.log(_idx,  _scorersHash[_idx].identified, _assessor.identified);
// console.log(_idx, _sbsDocDict[_dkey][_fkey].scorers)

                  }

                  // if(_sbsDocDict['d81'] && _sbsDocDict['d81']['f188']) {
                  //   console.log(_dkey, _fkey);
                  //   console.log(_sbsDocDict['d81']['f188'].scorers[2]);
                  // }

                } else { //-- initial/normal scoring data with assessor1 and assessor 2

                  if(s.assessor1) {
                    let 
                      _assessor1 = s.assessor1,
                      _uid = _assessor1._id,
                      _idx =_usersDict[_uid] &&  _usersDict[_uid].profile.order -1,
                      _point = _assessor1.identified === _answer ? 1 : 0;

                    // console.log(_usersDict[_uid].profile.fullname, _usersDict[_uid].profile.order, _idx)

                    // let _scorer1Hash = _sbsDocDict[_dkey][_fkey].scorers;  

                    // let _scorer1Obj = {
                    //   uid: _uid,
                    //   ufname: _usersDict[_uid].profile.firstname,
                    //   ulname: _usersDict[_uid].profile.lastname,
                    //   ufullname: _usersDict[_uid].profile.fullname,
                    //   order: _usersDict[_uid].profile.order,
                    //   identified: _assessor1.identified,
                    //   point: _assessor1.identified === _answer ? 1 : 0,
                    //   mnid: _assessor1.mnid                     
                    // }

                    // _sbsDocDict[_dkey][_fkey].scorers.push(_scorer1Obj); 

                    _sbsDocDict[_dkey][_fkey].scorers[_idx].identified = _assessor1.identified;
                    _sbsDocDict[_dkey][_fkey].scorers[_idx].point = _point;
                    _sbsDocDict[_dkey][_fkey].scorers[_idx].mnid = _assessor1.mnid || null;
                    _usersDict[_uid].profile._order = 0;

                    _userQAScoreDict[_uid] += _point;


                    let _percent = 0;

                    if(_userQAScoreDict[_uid] > 0) {
                      _percent = Math.round(_userQAScoreDict[_uid] / _totalFindings * 100);
                    }
                    
                    _allQAScorers[_idx].profile.percent = _percent;

                  }

                  if(s.assessor2) {
                    let 
                      _assessor2 = s.assessor2,
                      _uid = _assessor2._id,
                      _idx = _usersDict[_uid] && _usersDict[_uid].profile.order -1,
                      _point = _assessor2.identified === _answer ? 1 : 0;

                    // console.log(_usersDict[_uid].profile.fullname, _usersDict[_uid].profile.order, _idx)

                    // let _scorer2Hash = _sbsDocDict[_dkey][_fkey].scorers;                        

                    // let _scorer2Obj = {
                    //   uid: _uid,
                    //   ufname: _usersDict[_uid].profile.firstname,
                    //   ulname: _usersDict[_uid].profile.lastname,
                    //   ufullname: _usersDict[_uid].profile.fullname,
                    //   order: _usersDict[_uid].profile.order,
                    //   identified: _assessor2.identified,
                    //   point: _assessor2.identified === _answer ? 1 : 0,
                    //   mnid: _assessor2.mnid                     
                    // }

                    // _sbsDocDict[_dkey][_fkey].scorers.push(_scorer2Obj);
                    _sbsDocDict[_dkey][_fkey].scorers[_idx].identified = _assessor2.identified;
                    _sbsDocDict[_dkey][_fkey].scorers[_idx].point = _point;
                    _sbsDocDict[_dkey][_fkey].scorers[_idx].mnid = _assessor2.mnid || null;
                    _usersDict[_uid].profile._order = 1;

                    _userQAScoreDict[_uid] += _point;

                    let _percent = 0;

                    if(_userQAScoreDict[_uid] > 0) {
                      _percent = Math.round(_userQAScoreDict[_uid] / _totalFindings * 100);
                    }
                    
                    _allQAScorers[_idx].profile.percent = _percent;                                         
                  }

                  // if(_sbsDocDict['d81'] && _sbsDocDict['d81']['f188']) {
                  //   console.log(_dkey, _fkey);
                  //   console.log(_sbsDocDict['d81']['f188'].scorers[2]);
                  // }

                  // _totalFindings++;

                }; //-- if(s.assessor) {} else {}

                // if(_sbsDocDict['d81'] && _sbsDocDict['d81']['f188']) {
                //   console.log(_dkey, _fkey);
                //   console.log(_sbsDocDict['d81']['f188'].scorers[2]);
                // }
              } //-- if(s.behavior) {
            }) //-- _sbsRaw.forEach((s) => {
// console.log(_sbsDocDict['d81']['f188'].scorers[2])
          } //-- if(_sbsRaw && _sbsRaw.length > 0) {

// console.log(_sbsDocDict['d81']['f188'].scorers[2])
          let _sbsData = [];
// console.log(_sbsDocDict)
          Object.entries(_sbsDocDict).forEach(([dk,dv]) => {
            let _sbsObj = {
              did: _docDict[dk].id,
              dname: _docDict[dk].name,
              findings: []
            }
// console.log(dk, dv)
            Object.entries(dv).forEach(([fk,fv]) => {              

              // let _dummyScorer = {
              //   uid: null,
              //   ufname: null,
              //   ulname: null,
              //   ufullname: null,
              //   order: null,
              //   identified: null,
              //   point: null,
              //   mnid: null
              // }

              // fv.scorers.sort((a, b) => {
              //   return a.order - b.order;
              // });
// console.log(dk, fk, fv.scorers)
              let _findingObj = {
                finding: fv.finding,
                fid: fv.fid,
                answer: fv.answer,
                mnid: fv.mnid,
                scorers: fv.scorers
              }

              _sbsObj.findings.push(_findingObj);
            })

            _sbsData.push(_sbsObj);

          });

          // _allQAScorers.sort((a,b) => a.profile._order-b.profile._order);

          let _allData = {
            assessmentId: _assessmentId,
            userId: _userId,
            simulationId: _simulationId,
            notes: _notes,
            countNotes: _notesRaw.length,
            docs: _docsRaw,
            docFolders: _docFoldersRaw,
            // sbs: _sbsRaw,
            sbs: _sbsData,
            qaAnswers: _qaAnswers,
            qaScorers: _allQAScorers,
            fullname: _fullname,
            initial: _initial
          }

          callback(null, {success: true, data: _allData})

        })
      } else { //-- if(_sus && _sus.length > 0) {
        callback(null, {success: true, msg: "No data to load."});
      }

      // callback(null, {success: true, data: _sus})
    });

    let result = output('dq')

    if(result) {
      return result
    }
  },
  "SimUsersSummary.qa.export.all"() {
    // this.unblock();

    let output = Meteor.wrapAsync((args, callback) => {

      let pipelineSUS = 
      [
        {
          $match: {
            qa: 1
          }
        },                
        {
          $lookup: {
            from: "scoring_behaviors",
            localField: "assessmentId",
            foreignField: "assessment_id",
            as: "sbs"
          }
        },
        // {
        //   $group: {
        //     "_id": {
        //         assessmentId: "$assessmentId",
        //         userId: "$userId",
        //         simulationId: "$simulationId"
        //     },
        //     qaAnswers: { $first: "$qaAnswers" },
        //     qaScorers: { $first: "$qaScorers" },
        //     notes: { $addToSet: "$notes" },
        //     dfs: { $addToSet: "$dfs" },
        //     docs: { $addToSet: "$docs" },
        //     sbs: { $first: "$sbs" },
        //     scorer1Id: { $first: "$scorer1Id" },
        //     scorer2Id: { $first: "$scorer2Id" }
        //   }
        // },
        // {
        //   $project: {
        //     _id: 0,
        //     uid: "$_id.userId",
        //     aid: "$_id.assessmentId",
        //     sid: "$_id.simulationId",                    
        //     qaAnswers: "$qaAnswers",
        //     qaScorers: "$qaScorers",
        //     notes: "$notes",
        //     sbs: "$sbs",
        //     dfs: "$dfs",
        //     docs: "$docs",
        //     scorer1Id: "$scorer1Id",
        //     scorer2Id: "$scorer2Id"
        //   }
        // },
        // {
        //   $sort: { //-- not working
        //     // "dfs.folder_order": 1,
        //     // "docs.document_order": 1,
        //     // "notes.key": 1
        //   }
        // }
        {
          $project: {
            assessmentId: "$assessmentId",
            simulationId: "$simulationId",
            simulationName: "$simulationName",
            userId: "$userId",
            firstname: "$firstname",
            lastname: "$lastname",
            fullname: "$fullname",
            initial: "$initial",
            qa: "$qa",
            qaScorers: "$qaScorers",
            qaAnswers: "$qaAnswers",
            sbs: "$sbs",
            scorer1Id: "$scorer1Id",
            scorer2Id: "$scorer2Id"
          }
        }
      ]
      
      let _sus = Promise.await(SimUsersSummary.rawCollection().aggregate(pipelineSUS).toArray());      
      
      // console.log(_sus);

      if(_sus && _sus.length > 0) {
        // let _initScorers = Meteor.users.find({
        //   'profile.role': '7',
        //   'profile.status': 1
        // }, {
        //   sort: {
        //     'profile.firstname': 1
        //   }
        // }).fetch();

        let 
          _scorerIds = [],
          _qaScorerIds = [];

        _sus.forEach((s) => {
          if(s.qaScorers) {
            s.qaScorers.forEach((q) => {
              if(!_qaScorerIds.includes(q)) {
                _qaScorerIds.push(q);
              }
            })            
          }

          if(!_scorerIds.includes(s.scorer1Id)) {
            _scorerIds.push(s.scorer1Id);
          }
          if(!_scorerIds.includes(s.scorer2Id)) {
            _scorerIds.push(s.scorer2Id);
          }          
        })

        let _allScorerIds = _scorerIds.concat(_qaScorerIds);

        let _scorers = Meteor.users.find({
          // 'profile.role': '7',
          // 'profile.status': 1
          _id: { $in: _allScorerIds }
        }, {
          sort: {
            'profile.firstname': 1
          }
        }).fetch();

        // console.log(_qaScorerIds);
        // console.log(_scorerIds);

        let 
          data = [["simulation","user","initial"]],
          _answersDict = [],
          _scorersDict = [],
          _userScoreDict = [];

        if(_scorers && _scorers.length > 0) {
          _scorers.forEach((u, i) => {
            u.profile['idx'] = i;

            _scorersDict[u._id] = u;

            data[0].push(u.profile.fullname);

            _userScoreDict[u._id] = []; //-- initialize _userScoreDict per user
          })
        }

        // console.log(data)        

        _sus.forEach((s,i) => {
          let
            _asmtId = s.assessmentId,
            _skey = 's'+s.simulationId,
            _totalFindings = 0;

          if(s.qaAnswers && s.qaAnswers.length > 0) {
            s.qaAnswers.forEach((a) => {
              let _fkey = 'f'+a.id;
              _answersDict[_fkey] = a;

              // _userScoreDict[u._id][_fkey] = {
              //   correct: 0,
              //   percent: 0,
              //   score: 0
              // };
            })

            _totalFindings = s.qaAnswers.length;            
          };          

          // console.log(_answersDict)

          if(s.sbs && s.sbs.length > 0) {

            s.sbs.forEach((b) => {
              let 
                _fid = b.behavior && b.behavior.id,
                _fkey = 'f'+_fid;

              if(b.qa && b.assessor) {
                let _uid = b.assessor._id;
                
                if(_userScoreDict[_uid]) {

                  if(!_userScoreDict[_uid][_asmtId]) {
                    _userScoreDict[_uid][_asmtId] = {
                      correct: 0,
                      percent: 0,
                      total: _totalFindings                    
                    }
                  }

                  let _point = b.assessor.identified === (_answersDict[_fkey] && _answersDict[_fkey].identified) ? 1 : 0;

                  _userScoreDict[_uid][_asmtId].correct += _point;
                  _userScoreDict[_uid][_asmtId].percent = Math.round(_userScoreDict[_uid][_asmtId].correct / _userScoreDict[_uid][_asmtId].total * 100);                

                }
                // console.log(_uid, _userScoreDict[_uid], b.assessor.identified, _answersDict[_fkey], _point)              
              } else {
                if(b.assessor1) {
                  let _uid = b.assessor1._id;
                  
                  if(_userScoreDict[_uid]) {

                    if(!_userScoreDict[_uid][_asmtId]) {
                      _userScoreDict[_uid][_asmtId] = {
                        correct: 0,
                        percent: 0,
                        total: _totalFindings                    
                      }
                    }

                    let _point = b.assessor1.identified === (_answersDict[_fkey] && _answersDict[_fkey].identified) ? 1 : 0;

                    _userScoreDict[_uid][_asmtId].correct += _point;
                    _userScoreDict[_uid][_asmtId].percent = Math.round(_userScoreDict[_uid][_asmtId].correct / _userScoreDict[_uid][_asmtId].total * 100);    
                  }                
                }

                if(b.assessor2) {
                  let _uid = b.assessor2._id;
                  
                  if(_userScoreDict[_uid]) {

                    if(!_userScoreDict[_uid][_asmtId]) {
                      _userScoreDict[_uid][_asmtId] = {
                        correct: 0,
                        percent: 0,
                        total: _totalFindings                    
                      }
                    }

                    let _point = b.assessor2.identified === (_answersDict[_fkey] && _answersDict[_fkey].identified) ? 1 : 0;

                    _userScoreDict[_uid][_asmtId].correct += _point;
                    _userScoreDict[_uid][_asmtId].percent = Math.round(_userScoreDict[_uid][_asmtId].correct / _userScoreDict[_uid][_asmtId].total * 100); 

                  }                
                }                
              }

            }) //-- s.sbs.forEach((b) => {

            // console.log(_userScoreDict);

            let _dataObj = [s.simulationName,s.fullname,s.initial];

            if(_scorers && _scorers.length > 0) {
              _scorers.forEach((u, i) => {
                let 
                  _uid = u._id,
                  _score = _userScoreDict[_uid] && _userScoreDict[_uid][_asmtId] && _userScoreDict[_uid][_asmtId].percent || 0;

                _dataObj.push(_score);
              })
            };

            data.push(_dataObj);            

          } //-- if(s.sbs && s.sbs.length > 0) {
        }) //-- _sus.forEach((s,i) => {

        // console.log(data);

        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = {SheetNames: ["Scoring QA"], Sheets:{'Scoring QA':ws }};

        callback(null, {success: true, data: wb});
      } //- if(_sus && _sus.length > 0) {
      else {
        callback(null, {success: false, data: null});
      }
    });

    let result = output('dq')

    if(result) {
      return result
    }

  }
});

