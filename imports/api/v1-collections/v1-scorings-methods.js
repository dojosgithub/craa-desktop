import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Promise } from 'meteor/promise'

var moment = require('moment');

import { Util } from '/imports/lib/server/util.js'

import { V1UsersRaw, V1AssessmentsRaw, V1ScoringsRaw } from './v1-raw-collections.js';
import { V1AssessmentsTemp , V1ScoringsTemp, V1V2FindingsMap, 
          V1SimUsersSummaryTemp, V1UsersScoreSummaryTemp } from './v12-temp-collections.js';


Meteor.methods({
  "ETL.V1ScoringsRaw.integrate.test"() {
    return ['a','b'];
  },
  "ETL.V1ScoringsRaw.integrate"() {
    // this.unblock()

    let _clientsData = {
      inVentiv: {
        _id: 'EGHYDswSwfjXktdjP',
        name: 'inVentiv',
        bus: {
          NA: {
            _id: 'EGHYDswSwfjXktdjP-1470499457014',
            name: 'NA'
          },
          EMEA: {
            _id: 'EGHYDswSwfjXktdjP-1470499533711',
            name: 'EMEA'
          },
          APAC: {
            _id: 'EGHYDswSwfjXktdjP-1470499621682',
            name: 'APAC'
          },
          LATAM: {
            _id: 'EGHYDswSwfjXktdjP-1470499637282',
            name: 'LATAM'
          }
        }
      }
    };

    //-- module_id to v2 simulation_id
    // let _modDataDict = [];
    //-- ? mod: 33,34,35 is for v1-cat 30, but, no v2 version of it?... 
    //-- ,so, this is not clear 
    // _modDataDict['m33'] = 9 //-- mod: 33,34,35, v1-cat: 30 <=> v2 sim 9 ?
    // _modDataDict['m42'] = 9 //-- mod: 42,43,44, v1-cat: 35 <=> v2 sim 9

    //-- assessment_category_id to v2 simulation_id
    let _asmtCatSimDataDict = [];
    _asmtCatSimDataDict['c30'] = {
      v1Simulation: {
        id: 30,
        name: 'US Baseline 2015'
      },
      v2Simulation: {
        id: 9,
        name: "Baseline-OA-NA--1",
        bu_id: "EGHYDswSwfjXktdjP-1470499457014",
        bu_name: "NA"
      }
    };

    // _asmtCatSimDataDict['c35'] = {
    //   v1Simulation: {
    //     id: 35,
    //     name: 'NA OA Baseline 2016'
    //   },
    //   v2Simulation: {
    //     id: 9,
    //     name: "Baseline-OA-NA--1",
    //     // bu_id: "EGHYDswSwfjXktdjP-1470499457014",
    //     // bu_name: "NA"
    //   }
    // };

    //-- ? v1-31 (EAPA Baseline 2015), not clear, can be v2-10 (Baseline-OA-EAPA--1)
    //-- or, v2-30 (Baseline-OA-Global--1)...
    //-- interestingly, v1 user Vasily Borisov (2934) took both v1-31 (EAPA) 
    //-- and v1-35 (NA)...
    _asmtCatSimDataDict['c31'] = { //-- this can be only for Vasily Borisov - 2934...
      v1Simulation: {
        id: 31,
        name: 'EAPA Baseline 2015'
      },
      v2Simulation: {
        id: 10,
        name: "Baseline-OA-EAPA--1",
        // bu_id: "EGHYDswSwfjXktdjP-1470499533711",
        // bu_name: "EMEA"
      }
    };

    _asmtCatSimDataDict['c35'] = {
      v1Simulation: {
        id: 35,
        name: 'NA OA Baseline 2016'
      },
      v2Simulation: {
        id: 9,
        name: "Baseline-OA-NA--1",
        // bu_id: "EGHYDswSwfjXktdjP-1470499457014",
        // bu_name: "NA"
      }
    };

    _asmtCatSimDataDict['c36'] = { 
      v1Simulation: {
        id: 36,
        name: 'EAPA Baseline 2016'
      },
      v2Simulation: {
        id: 10,
        name: "Baseline-OA-EAPA--1"
      }
    };

    let output = Meteor.wrapAsync((args, callback) => {

      let 
        _allAssessments = V1AssessmentsTemp.find().fetch(),
        _allAssessmentsDict = [];

      if(_allAssessments && _allAssessments.length > 0) {
        _allAssessments.forEach((a) => {
          
          // let _aKey = a.assessee_id + '-' + a.v1_simulation.id;
          let _aKey = a.v1UserId + '-' + a.v1_simulation.id;          

          _allAssessmentsDict[_aKey] = a;
        })
      }

// console.log(_allAssessmentsDict)

      // let 
        // rawAssessments = V1AssessmentsRaw.rawCollection(),
        // aggregateQueryAssessments = Meteor.wrapAsync(rawAssessments.aggregate, rawAssessments);

      let pipelineAssessments = 
      [
        {
          //-- for test purpose...
          $match: {
            // user_id: 2923,
            //-- this user took both US Baseline 2015(=30) and NA OA Baseline 2016 (=30) 
            //-- and no mapping etc. data for US Baseline 2015. Let's try & process 35 only for now...
            // assessment_category_id: 35, -- NA OA Baseline 2016
            client_id: 2922, //-- inVentiv
            // user_id: 2925 //-- just for test
          }
        },
        {
          $lookup: {
            from: 'v1_scorings_raw',
            localField: 'id',
            foreignField: 'assessment_id',
            as: 'scorings'
          }
        },
        {
          $unwind: "$scorings"
        },
        {
          $lookup: {
            from: 'v1_behaviors_raw',
            localField: 'scorings.behavior_id',
            foreignField: 'id',
            as: 'behaviors'
          }
        },
        {
          $unwind: "$behaviors"
        },
        {
          $lookup: {
            from: 'v1_v2_findings_map',
            localField: 'behaviors.id',
            foreignField: 'v1_finding_id',
            as: 'v1V2FindingsMap'
          }
        },
        {
          $unwind: "$v1V2FindingsMap"
        },                
        {
          $project: {            
            userId: '$user_id',
            scorerId: '$scorings.scorer_id',
            asmtCatId: '$assessment_category_id',
            modId: '$module_id',
            behaviorId: "$scorings.behavior_id",
            behavior: "$behaviors.behavior",
            isOverlapping: "$scorings.is_overlapping",
            showInModule: "$scorings.show_in_module",
            severity: "$scorings.severity",
            identifiedText: "$scorings.identified_text",
            identified: "$scorings.identified",
            isAdjudication: "$scorings.is_adjudication",
            v2FindingId: "$v1V2FindingsMap.v2_finding_id"
          }
        },
        {
          $sort: {
            user_id: 1
          }
        }
        // {
        //   $group: {
        //     _id: "$scorings.assessment_category_id",
        //     userId: { $first: "$user_id" },
        //     scorings: {
        //       $push: "$scorings"
        //     }
        //   }
        // },
        // {
        //   $project: {
        //     asmtCatId: '$_id',
        //     userId: '$userId',
        //     // asmtCatId: '$assessment_category_id',
        //     // modId: '$module_id',
        //     scorings: "$scorings"
        //   }
        // }        
      ]

      // let _scorings = aggregateQueryAssessments(pipelineAssessments);      
      let _scorings = Promise.await(V1AssessmentsRaw.rawCollection().aggregate(pipelineAssessments).toArray());
// console.log(_scorings.length)
      let 
        _scoringsDict = [],
        _scoringsModDict = [],
        _scoringsBehaviorDict = [];

      if(_scorings && _scorings.length > 0) {

        _scorings.forEach((s) => {

//           if(!_scoringsBehaviorDict[s.behavior]) {
//             _scoringsBehaviorDict[s.behavior] = [];
// 
//             let _behaviorKey = 'b' + s.behaviorId;
//             _scoringsBehaviorDict[_behaviorKey] = [];
//           }

          // _scoringsBehaviorDict[s.behavior].push(s.behaviorId);

          // scoringsBehaviorDict[_behaviorKey]['identified'] = false;

// if(s.userId === 2925 && s.v2FindingId === 470) {
//   console.log(s);
//   console.log(_scoringsDict[s.userId][s.asmtCatId][s.behavior]);
// }
          if(s.v2FindingId > 0) {

            let 
              _uidKey = s.userId.toString(),
              _sidKey = s.asmtCatId.toString(),
              _modKey = s.modId.toString(),              
              _fidKey = s.v2FindingId.toString();

            if(!_scoringsDict[_uidKey]) {
              _scoringsDict[_uidKey] = [];              
            }
            if(!_scoringsDict[_uidKey][_sidKey]) {
              _scoringsDict[_uidKey][_sidKey] = [];              
            }            
            if(!_scoringsModDict[_uidKey]) {              
              _scoringsModDict[_uidKey] = [];
            }            
            if(!_scoringsModDict[_uidKey][_modKey]) {
              _scoringsModDict[_uidKey][_modKey] = []; 
            }            
            if(!_scoringsModDict[_uidKey][_modKey][_sidKey]) {
              _scoringsModDict[_uidKey][_modKey][_sidKey] = []; 
            }
            if(!_scoringsModDict[_uidKey][_modKey][_sidKey][_fidKey]) {
              //-- if this is first time this Finding gets parsed, 
              //-- initiate it's scoring cycle...
              _scoringsModDict[_uidKey][_modKey][_sidKey][_fidKey] = [];
              _scoringsModDict[_uidKey][_modKey][_sidKey][_fidKey]['scored'] = false;
            }
            if(!_scoringsDict[_uidKey][_sidKey][_fidKey]) {
              _scoringsDict[_uidKey][_sidKey][_fidKey] = {
                behavior: s.behavior,
                identified: false,
                behaviorId: [s.behaviorId],
                isOverlapping: false,
                showInModule: 0,
                scored: false,
                scorerId: [s.scorerId],
                modId: [s.modId],
                severity: s.severity,
                v2BehaviorId: [s.v2FindingId],
                scoringKey: 1 //-- 1: Not Identified, 0: Identified              
                // adjudication: s.adjudication
              };
            }

            //-- Score unless the score of this Finding is not decided yet.
            if(!_scoringsDict[_uidKey][_sidKey][_fidKey]['scored']) {

              //-- Score each module unless its score is decided already.
              if(!_scoringsModDict[_uidKey][_modKey][_sidKey][_fidKey]['scored']) {
                _scoringsModDict[_uidKey][_modKey][_sidKey][_fidKey]['identified'] = s.identified;

                let _scoringKey = s.identified ? 2 : 1;

                _scoringsDict[_uidKey][_sidKey][_fidKey]['scoringKey'] = 
                  _scoringsDict[_uidKey][_sidKey][_fidKey]['scoringKey'] * _scoringKey;

                if(s.isAdjudication === 1) { //-- If it's an adjudicated score,
                  //-- the score for this module is decided by this, so, 
                  //-- no more scoring on this module is needed.
                  _scoringsModDict[_uidKey][_modKey][_sidKey][_fidKey]['scored'] = true;

                 //-- Score of this module is decided here.
                 _scoringsDict[_uidKey][_sidKey][_fidKey]['identified'] = s.identified;

                  //-- And if it's Identified, the score for this Finding itself becomes 
                  //-- 'Identified' and we can move on to the next Finding.
                  if(s.identified) {
                    _scoringsDict[_uidKey][_sidKey][_fidKey]['scored'] = true;
                  } 
                } //-- if(s.isAdjudication === 1)
                else {
                  _scoringsDict[_uidKey][_sidKey][_fidKey]['identified'] = 
                    _scoringsDict[_uidKey][_sidKey][_fidKey]['scoringKey'] % 2 === 0 ? true : false;
// 
//                   if(s.behaviorId === 2780) {
//                     console.log(_scoringsDict[_uidKey][_sidKey][_fidKey]['scoringKey'] % 2)
//                     console.log(_scoringsDict[_uidKey][_sidKey][_fidKey]['scoringKey'] % 2 === 0)
//                     console.log(_uidKey,_sidKey,_fidKey,_scoringsDict[_uidKey][_sidKey][_fidKey])
//                   }
                }

              }

//               if(s.isAdjudication === 1) { //-- If it's an adjudicated score,
//                 //-- the score for this module is decided by this, so, 
//                 //-- no more scoring on this module is needed.
//                 _scoringsDict[_uidKey][_modKey][_sidKey][_fidKey]['scored'] = true;
// 
//                 //-- And if it's Identified, the score for this Finding itself becomes 
//                 //-- 'Identified' and we can move on to the next module.
//                 if(s.identified) {
//                   //-- Score this module as 'Identified',
//                   _scoringsDict[_uidKey][_sidKey][_fidKey]['identified'] = s.identified;
//                   //-- and, stop scoring for this Finding.
//                   _scoringsDict[_uidKey][_sidKey][_fidKey]['scored'] = true;
//                 }
//               } else {
//                 _scoringsDict[_uidKey][_sidKey][_fidKey]['identified'] = 
//                   _scoringsDict[_uidKey][_sidKey][_fidKey]['scoringKey'] % 2 === 0 ? true : false;
//               }              
            }

            if(!_scoringsDict[_uidKey][_sidKey][_fidKey]['behaviorId'].includes(s.behaviorId)) {
              _scoringsDict[_uidKey][_sidKey][_fidKey]['behaviorId'].push(s.behaviorId);
              _scoringsDict[_uidKey][_sidKey][_fidKey]['v2BehaviorId'].push(s.v2FindingId);
            }            

          } //-- if(s.v2FindingId > 0)

//           if(s.isAdjudication === 1) {
//             // _scoringsBehaviorDict[_behaviorKey]['identified'] = s.identified;
// 
//             //-- added by dk on 10/05/2018
//             if(s.identified) { //-- count this only when it's adjudicated as 'Identified' b/c adjudicator doesn't see other modules at the moment
//               _scoringsDict[s.userId][s.asmtCatId][s.behavior]['identified'] = s.identified
// 
//               //-- and stop scoring
//               _scoringsDict[s.userId][s.asmtCatId][s.behavior]['scored'] = true
//             }
// 
//             //-- once we get adjudicated score for this behavior, no more scoring? (nope, se above 10/05/2018)
//             // _scoringsBehaviorDict[_behaviorKey]['scored']  = true
//             // _scoringsDict[s.userId][s.asmtCatId][s.behavior]['scored'] = true
// 
//             if(!_scoringsDict[s.userId][s.asmtCatId][s.behavior]['behaviorId'].includes(s.behaviorId)) {
//               _scoringsDict[s.userId][s.asmtCatId][s.behavior]['behaviorId'].push(s.behaviorId);
//               _scoringsDict[s.userId][s.asmtCatId][s.behavior]['v2BehaviorId'].push(s.v2FindingId);
//             }
// 
//           } else {
//             //-- only when it's not fully scored yet...probably, this is not needed b/c 
//             //-- the Adjudicated score will come at last after all these...but, just in case...
//             // if(!_scoringsBehaviorDict[_behaviorKey]['scored']) {
//             // if(!_scoringsDict[s.userId][s.asmtCatId][s.behavior]['scored']) {
//             if(_scoringsDict[s.userId][s.asmtCatId][s.behavior]['scored'] === false) {
// 
//               _scoringsDict[s.userId][s.asmtCatId][s.behavior]['identified'] = s.identified;
// 
//               //-- if this behavior will be shown in another module, and scored as 'identified', 
//               //-- then, it should be the final score for this simulation...
//               if(s.identified === true 
//                   && _scoringsDict[s.userId][s.asmtCatId][s.behavior]['isOverlapping']) {
// 
//                   _scoringsDict[s.userId][s.asmtCatId][s.behavior]['scored'] = true;               
// 
//               } else {
// 
//               }
// 
//               // if(!_scoringsDict[s.userId][s.asmtCatId][s.behavior]['behaviorId'].includes(s.behaviorId)) {
//               //   _scoringsDict[s.userId][s.asmtCatId][s.behavior]['behaviorId'].push(s.behaviorId);
//               //   _scoringsDict[s.userId][s.asmtCatId][s.behavior]['v2BehaviorId'].push(s.v2FindingId);
//               // }
// 
//             }
// 
//             if(!_scoringsDict[s.userId][s.asmtCatId][s.behavior]['behaviorId'].includes(s.behaviorId)) {
//               _scoringsDict[s.userId][s.asmtCatId][s.behavior]['behaviorId'].push(s.behaviorId);
//               _scoringsDict[s.userId][s.asmtCatId][s.behavior]['v2BehaviorId'].push(s.v2FindingId);
//             }
// 
//           }

          // let _scoringObj = {
          //   
          // }

        }) //-- _scorings.forEach((s) => {

        // console.log(_scoringsBehaviorDict)
        // console.log(_scoringsDict)

        let _scoringsDataToReturn = [];

        Object.keys(_scoringsDict).forEach((u) => {
          Object.keys(_scoringsDict[u]).forEach((s) => {
            Object.keys(_scoringsDict[u][s]).forEach((f) => {

              let 
                _sObj = _scoringsDict[u][s][f],
                _v1BehaviorIdsObj = _sObj.behaviorId,
                _v2BehaviorIdsObj = _sObj.v2BehaviorId;

              let 
                // _asmtKey = u + '-' + _asmtCatSimDataDict['c'+a]['v2Simulation'].id,
                _asmtKey = u + '-' + s,
                _asmtData = _allAssessmentsDict[_asmtKey];

                if(!_asmtData) {
                  console.log(_asmtKey)
                }

              if(_asmtData) {

                let _sDataObj = {
                  userId: parseInt(u),
                  asmtCatId: parseInt(s),                
                  behaviorIds: _v1BehaviorIdsObj, //-- array of all behavior ID's in modules
                  findingIds: _v2BehaviorIdsObj, //-- array of all v2 Finding ID's (this will be only one, or, multiple same ids, but, just in case...)
                  behavior: _sObj.behavior,
                  identified: _sObj.identified,
                  severity: _sObj.severity,
                  behaviorId: _v1BehaviorIdsObj[_v1BehaviorIdsObj.length-1], //-- the last behavior_id (esp. in case it's overlapping in modules)
                  findingId: _v2BehaviorIdsObj[_v2BehaviorIdsObj.length-1],
                  // modId: _sObj.v2FindingId,
                  simulationId: _asmtCatSimDataDict['c'+s]['v2Simulation'].id,
                  assessmentId: _asmtData._id,
                  assesseeId: _asmtData.assessee_id
                }
// if(_sDataObj.findingId === 475) {
//   console.log(_sDataObj)
// }
                _scoringsDataToReturn.push(_sDataObj);

                // V1ScoringsTemp.insert(_sDataObj);
                V1ScoringsTemp.upsert({
                  userId: parseInt(u),
                  asmtCatId: parseInt(s),
                  simulationId: _sDataObj.simulationId,
                  // assessmentId: _sDataObj.assessmentId,
                  behaviorId: _sDataObj.behaviorId,
                  findingId: _sDataObj.findingId
                }, {
                  $set: {
                    assesseeId: _sDataObj.assesseeId,
                    assessmentId: _sDataObj.assessmentId,
                    behavior: _sObj.behavior,
                    severity: _sObj.severity,
                    behaviorIds: _v1BehaviorIdsObj, 
                    findingIds: _v2BehaviorIdsObj,                  
                    identified: _sObj.identified,
                    tempTag: '101112018_193950'
                  }
                });

// if(u === '2925' && _v1BehaviorIdsObj.length === 3) {
//   console.log(_sDataObj)
// }

              }

            })
          })
        })

        callback(null, {success: true, data: _scoringsDataToReturn});
        // callback(null, {success: true, data: _scoringsDict});

      } //-- if(_scorings && _scorings.length > 0) {
      else {
        callback(null, {success: false, data: []});
      }
      // callback(null, {success: true, data: _scorings});
      // callback(null, {success: true, data: _scoringsDataToReturn});

    }) //-- let output = Meteor.wrapAsync((args, callback) => {

    let result = output('dq');

    if(result) {

      let _data = result.data;

      // return result
      return _data
    }
  },
  "ETL.V1ScoringsRaw.V1UsersScoreSummary.create"() {
    // this.unblock();

    let output = Meteor.wrapAsync((args, callback) => {

      // let 
        // rawScorings = V1ScoringsTemp.rawCollection(),
        // aggregateQueryScorings = Meteor.wrapAsync(rawScorings.aggregate, rawScorings);

      let pipelineScorings = 
      [
        {
          $lookup: {
            from: 'v1_sim_users_summary_temp',
            localField: 'assessmentId',
            foreignField: 'assessmentId',
            as: 'sus'
          }
        },
        {
          $unwind: "$sus"
        },
        // { //-- just for test
        //   $match: {
        //     'sus.v1UserId': 2925
        //   }
        // },        
        {
          $lookup: {
            from: 'v1_assessments_temp',
            localField: 'assessmentId',
            foreignField: '_id',
            as: 'asmt'
          }
        },
        {
          $unwind: "$asmt"
        },
        {
          $lookup: {
            from: 'findings',
            localField: 'findingId',
            foreignField: 'id',
            as: 'finding'
          }
        },
        {
          $unwind: "$finding"
        },        
        {
          $project: {
            assessmentId: "$asmt._id",
            clientId: "$asmt.client_id",
            buId: "$asmt.bu_id",
            assesseeId: "$asmt.assessee_id",
            simulationId: "$asmt.simulation_id",
            findingId: "$findingId",
            behaviorId: "$behaviorId",
            v1UserId: "$userId",
            finding: "$finding",
            severity: "$severity",
            identified: "$identified",
            duration: "$asmt.duration",
            timer: "$asmt.timer",
            submittedAt: "$asmt.submittedAt",
            sus: "$sus"
          }
        }        
      ]

      let
        // _scorings = aggregateQueryScorings(pipelineScorings),
        _scorings = Promise.await(V1ScoringsTemp.rawCollection().aggregate(pipelineScorings).toArray());
        _scoringsDict = [];

      if(_scorings && _scorings.length > 0) {

        _scorings.forEach((s) => {

// if(s.v1UserId === 2923) {
//   console.log(s)
// }
          let _severity = s.severity;

          if(!_scoringsDict[s.assessmentId]) {

            let _hasCFR = s.finding.cfr ? true : false;

            _scoringsDict[s.assessmentId] = {
              clientId: s.clientId,
              buId: s.buId,
              assesseeId: s.assesseeId,
              simulationId: s.simulationId,
              severity: {},
              domain: {},
              unidentified_findings: {
                num_findings: 0,
                has_cfr: _hasCFR,
                findings: []                
              },
              findingIds: [],
              severitySummary: [],
              domainSummary: [],
              domainScore: 0,
              numIF: 0,
              numUF: 0,
              totalF: 0,
              v1: true,
              v1UserId: s.v1UserId,
              duration: s.duration,
              timer: s.timer,
              publishedAt: s.sus.publishedAt
            };
          }

          if(!_scoringsDict[s.assessmentId]['severity'][_severity]) {
            _scoringsDict[s.assessmentId]['severity'][_severity] = {
              severity: _severity,
              identified: 0,
              not_identified: 0,
              percent_identified: 0,
              total: 0
            };            
          }

          if(!_scoringsDict[s.assessmentId]['domain'][s.finding.category]) {
            _scoringsDict[s.assessmentId]['domain'][s.finding.category] = {
              name: s.finding.category,
              id: s.finding.category_id,
              identified: 0,
              not_identified: 0,
              percent_identified: 0,
              total: 0
            };            
          }          

          // if(!_scoringsDict[s.assessmentId][finding._id]) {
          //   _scoringsDict[s.assessmentId][finding._id] = {              
          //   };
          // };

          if(s.identified) {

            _scoringsDict[s.assessmentId]['severity'][_severity].identified += 1;
            _scoringsDict[s.assessmentId]['domain'][s.finding.category].identified += 1;
            _scoringsDict[s.assessmentId].numIF += 1;

          } else {

            _scoringsDict[s.assessmentId]['severity'][_severity].not_identified += 1;
            _scoringsDict[s.assessmentId]['domain'][s.finding.category].not_identified += 1;
            _scoringsDict[s.assessmentId].numUF += 1;

            let _ufObj = {
              id: s.finding.id,
              behavior: s.finding.finding,
              category_id: s.finding.category_id,
              severity: s.finding.severity
            }

            _scoringsDict[s.assessmentId]['unidentified_findings'].findings.push(_ufObj);
            _scoringsDict[s.assessmentId]['unidentified_findings'].num_findings += 1;

            _scoringsDict[s.assessmentId]['findingIds'].push(s.finding.id);

          }

          _scoringsDict[s.assessmentId]['severity'][_severity].total += 1;
          _scoringsDict[s.assessmentId]['domain'][s.finding.category].total += 1;
          _scoringsDict[s.assessmentId].totalF += 1;

          _scoringsDict[s.assessmentId]['severity'][_severity].percent_identified 
            = Math.round(_scoringsDict[s.assessmentId]['severity'][_severity].identified 
              / _scoringsDict[s.assessmentId]['severity'][_severity].total * 100);

          _scoringsDict[s.assessmentId]['domain'][s.finding.category].percent_identified 
            = Math.round(_scoringsDict[s.assessmentId]['domain'][s.finding.category].identified 
              / _scoringsDict[s.assessmentId]['domain'][s.finding.category].total * 100);


          _scoringsDict[s.assessmentId].domainScore 
            = Math.round(_scoringsDict[s.assessmentId].numIF / _scoringsDict[s.assessmentId].totalF * 100);

// if(s.v1UserId === 2923) {
//   console.log("severity => ", _severity)
//   console.log(_scoringsDict[s.assessmentId]['severity'][_severity].identified)
//   console.log(_scoringsDict[s.assessmentId]['severity'][_severity].total)
//   console.log(_scoringsDict[s.assessmentId]['severity'][_severity].percent_identified)
// 
//   console.log("category => " , s.finding.category)
//   console.log(_scoringsDict[s.assessmentId]['domain'][s.finding.category].identified)
//   console.log(_scoringsDict[s.assessmentId]['domain'][s.finding.category].total)
// }

        })

      } //-- if(_scorings && _scorings.length > 0) {

      Object.keys(_scoringsDict).forEach((asmtId) => {

        let 
          _data = _scoringsDict[asmtId],
          _initObject = {
            client_id: _data.clientId,
            bu_id: _data.buId,
            simulation_id: parseInt(_data.simulationId),
            // assessee_id: _data.assesseeId,
            userId: _data.v1UserId
          },
          _ussObject = {
            assessee_id: _data.assesseeId,
            assessment_id: asmtId,
            // client_id: _data.clientId,
            // bu_id: _data.buId,
            // simulation_id: _data.simulationId,
            // assessee_id: _data.assesseeId,
            severity: {},
            domain: {},
            severitySummary: [],
            domainSummary: [],
            unidentified_findings: {},
            findingIds: [],
            domainScore: _data.domainScore,
            numIF: _data.numIF,
            numUF: _data.numUF,
            totalF: _data.totalF,
            v1: true,
            createdAt: _data.publishedAt
          }          

          _ussObject.severity = _data['severity'];
          _ussObject.domain = _data['domain'];
          _ussObject.unidentified_findings = _data.unidentified_findings;
          _ussObject.findingIds = _data.findingIds;

          // let _sus = V1SimUsersSummaryTemp.findOne({
          //   v1: true,
          //   v1UserId: _data.v1UserId,
          //   simulationId: parseInt(_data.simulationId)
          // });
// console.log(_sus, _data.v1UserId, _data.simulationId)
// if(_data.v1UserId === 2923) {
//   console.log(_data)
//   console.log(_sus)
// }
          // if(_sus) {
            _ussObject['timer_log'] = {
              timer: {
                duration: _data.duration,
                pause_time: _data.timer,
                pause_time_raw: Util.hms2seconds(_data.timer)
              }
            }
          // }

          Object.keys(_data.severity).forEach((s) => {
            let _ssObj = {
              name: s,
              // percentIdentified: _data.severity[s].percentIdentified
              percentIdentified: _data.severity[s].percent_identified
            };

            _ussObject.severitySummary.push(_ssObj);
          })

          Object.keys(_data.domain).forEach((d) => {
            let _dsObj = {
              id: _data.domain[d].id,
              name: d,
              // percentIdentified: _data.domain[d].percentIdentified
              percentIdentified: _data.domain[d].percent_identified
            };

            _ussObject.domainSummary.push(_dsObj);
          })

// if(_initObject.userId === 2923) {
//   console.log(_initObject)
//   console.log(_ussObject)
// }

          V1UsersScoreSummaryTemp.upsert(_initObject, {
            $set: _ussObject
          });

      })

      _ussDataToReturn = [];

      callback(null, {success: true, data: _scorings});
      // callback(null, {success: true, data: _ussDataToReturn});

    }) //-- let output = Meteor.wrapAsync((args, callback) => {

    let result = output('dq');

    if(result) {
      return result
    }
  },
})
