import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Promise } from 'meteor/promise'

import { Util } from '/imports/lib/server/util.js'

import { UsersScoreSummary } from './users-score-summary.js';
import { UserReportSummary } from '../user-report-summary/user-report-summary.js';

import { Findings } from '/imports/api/findings/findings.js';

import { ScoringBehaviors } from '/imports/api/scoring-behaviors/scoring-behaviors.js';
import { MonitoringNotes } from '/imports/api/monitoring-notes/monitoring-notes.js';
import { ComplianceNotes } from '/imports/api/compliance-notes/compliance-notes.js';

import { SimUsersSummary } from '/imports/api/sim-users-summary/sim-users-summary.js';

let _remedNamesDict = [];
_remedNamesDict["Delegation of Authority"] = "Potential Fraud, Scientific Misconduct and Delegation of Authority";
_remedNamesDict["Delegation of Authority and Training"] = "Potential Fraud, Scientific Misconduct and Delegation of Authority";
_remedNamesDict["EC Reporting"] = null;
_remedNamesDict["ICF Process"] = "The Informed Consent Process";
_remedNamesDict["IEC Reporting"] = null;
_remedNamesDict["IEC Submission/Approval"] = "IRB/IEC Submission and Approval";
_remedNamesDict["IRB Reporting"] = null;
_remedNamesDict["IRB Submission/Approval"] = "IRB/IEC Submission and Approval";
_remedNamesDict["Potential Fraud"] = "Potential Fraud, Scientific Misconduct and Delegation of Authority";
_remedNamesDict["Potential Fraud/Scientific Misconduct"] = "Potential Fraud, Scientific Misconduct and Delegation of Authority";
_remedNamesDict["Protocol Requirement"] = "Protocol Review";
_remedNamesDict["Source Documentation"] = "Source Documentaion, CRF, Source-to-CRF Review";
_remedNamesDict["Source Documentation/Source to EDC/EDC"] = "Source Documentaion, CRF, Source-to-CRF Review";
_remedNamesDict["Source to EDC/EDC"] = "Source Documentaion, CRF, Source-to-CRF Review";

import './methods.uba.js';

Meteor.methods({
  "ETL.UsersScoreSummary.datadump.init"() {
    this.unblock()

    let output = Meteor.wrapAsync((args, callback) => {

      // let 
        // rawScores = UsersScoreSummary.rawCollection(),
        // aggregateQueryScores = Meteor.wrapAsync(rawScores.aggregate, rawScores);

      let pipelineScores = 
      [
        // {
        //   $lookup: {
        //     from: "assessments",
        //     localField: "assessment_id",
        //     foreignField: "_id",
        //     as: "assessment"          
        //   }
        // },
        // {
        //   $unwind: "$assessment"
        // },
        // {
        //   $unwind: "$unidentified_findings.findings"
        // },
        // {
        //   $project: {
        //     unidentifiedFindings: "$unidentified_findings.findings.id"
        //   }
        // },      
        {
          $lookup: {
            from: "sim_users_summary",
            localField: "assessment_id",
            foreignField: "assessmentId",
            as: "sus"          
          }
        },
        {
          $unwind: "$sus"
        },
        // {
        //   $group: {
        //     _id: "$_id",
        //     unidentifiedFindings: { "$addToSet": "$unidentified_findings.findings.id" }
        //   }
        // },
        {
          $project: {
            assessment_id: "$assessment_id",
            assessee_id: "$assessee_id",
            client_id: "$client_id",
            bu_id: "$bu_id",
            simulation_id: "$simulation_id",
            firstname: "$sus.firstname",
            lastname: "$sus.lastname",
            manager: "$sus.managerName",
            domain: "$domain",
            severity: "$severity",
            study_drug: "$study_drug",
            rescue_med: "$rescue_med",
            timer: "$timer_log",
            hasComp: "$hasComplianceCalculation",
            hasCompScore: "$hasComplianceCalculationScore",
            processIssues: "$process_issues",
            monitoring_notes: "$monitoring_notes.num_notes"
            // unidentifiedFindings: "$unidentified_findings.findings.id"
            // unidentifiedFindings: {
            //   $map: {
            //     input: "$unidentified_findings.findings",
            //     as: "test",
            //     in: "$$test.id"
            //   }
            // }
            // unidentifiedFindings: "$_id.unidentified_findings"
            
          }
        }
      ];

      // let _scores = aggregateQueryScores(pipelineScores)
      let _scores = Promise.await(UsersScoreSummary.rawCollection().aggregate(pipelineScores).toArray());

      if(_scores && _scores.length > 0) {
        _scores.forEach((s, i) => {
          
            let obj = {
              assessmentId: s.assessment_id,
              assesseeId: s.assessee_id,
              clientId: s.client_id,
              buId: s.bu_id,
              simulationId: s.simulation_id,
              firstname: s.firstname,
              lastname: s.lastname,
              timer: s.timer,
              hasComp: s.hasComp,
              hasCompScore: s.hasCompScore,
              severity: [],
              domain: [],
              studyDrugSummary: [],
              rescueMedSummary: [],
              notes: s.monitoring_notes || 0,
              unidentifiedFindings: []
            }

            let 
              _severity = s.severity || null,
              _domain = s.domain || null,
              _sds = s.study_drug && s.study_drug.summary || null,
              _rms = s.rescue_med && s.rescue_med.summary || null,
              _ufs = s.unidentified_findings && s.unidentified_findings.findings || null             

            if(_severity) {
              Object.keys(_severity).forEach((k) => {
                let severityObj = {
                  name: _severity[k].severity,
                  percentIdentified: _severity[k].percent_identified
                }

                obj.severity.push(severityObj)
              })
            }

            if(_domain) {
              Object.keys(_domain).forEach((k) => {
                let domainObj = {
                  name: _domain[k].name,
                  percentIdentified: _domain[k].percent_identified
                }

                obj.domain.push(domainObj)
              })
            }

            if(_sds) {
              Object.keys(_sds).forEach((k) => {
                let sdsObj = {
                  name: k,
                  percentCorrect: _sds[k].percent_correct
                }

                obj.studyDrugSummary.push(sdsObj)
              })
            }

            if(_rms) {
              Object.keys(_rms).forEach((k) => {
                let rmsObj = {
                  name: k,
                  percentCorrect: _rms[k].percent_correct
                }

                obj.rescueMedSummary.push(rmsObj)
              })
            }

            if(_ufs) {
              _ufs.forEach((f) => {
                obj.unidentifiedFindings.push(f.id)
              })
            }  

            UserReportSummary.upsert({
              userId: obj.assesseeId,
              clientId: obj.clientId,
              buId: obj.buId,
              simulationId: obj.simulationId,            
              assessmentId: obj.assessmentId,            
            }, {
              $set: {
                firstname: obj.firstname,
                lastname: obj.lastname,
                timer: obj.timer,
                hasComp: obj.hasComp,
                hasCompScore: obj.hasCompScore,
                severity: obj.severity,
                domain: obj.domain,
                studyDrugSummary: obj.studyDrugSummary,
                rescueMedSummary: obj.rescueMedSummary,
                notes: obj.notes,
                // unidentifiedFindings: obj.unidentifiedFindings
              }
            })

            if(i === _scores.length -1) {
              callback(null, {success: true})
            }
        })
      } //-- if(_scores && _scores.length > 0) {

    })

    let result = output('dk')

    if(result) {
      return result
    }
  },
  "ETL.UsersScoreSummary.datadump.combine"() {
    this.unblock()

    let output = Meteor.wrapAsync((args, callback) => {
      
      let _scores = UsersScoreSummary.find().fetch() 

      if(_scores && _scores.length > 0) {
        _scores.forEach((s, i) => {

          let
            assessmentId = s.assessment_id,
            assesseeId = s.assessee_id,
            clientId = s.client_id,
            buId = s.bu_id,
            simulationId = s.simulation_id,
            severity = [],                         
            domain = [],
            studyDrugSummary = [],
            rescueMedSummary = [],
            findingIds = []

          let
            _severity = s.severity || null,               
            _domain = s.domain || null,
            _sds = s.study_drug && s.study_drug.summary || null,
            _rms = s.rescue_med && s.rescue_med.summary || null,
            _ufs = s.unidentified_findings && s.unidentified_findings.findings || null             

          if(_severity) {
            Object.keys(_severity).forEach((k) => {
              let severityObj = {
                name: _severity[k].severity,
                percentIdentified: _severity[k].percent_identified
              }

              severity.push(severityObj)
            })
          }

          if(_domain) {
            Object.keys(_domain).forEach((k) => {
              let domainObj = {
                id: _domain[k].id,
                name: _domain[k].name,
                percentIdentified: _domain[k].percent_identified
              }

              domain.push(domainObj)
            })
          }

          if(_sds) {
            Object.keys(_sds).forEach((k) => {
              let sdsObj = {
                name: k,
                percentCorrect: _sds[k].percent_correct
              }

              studyDrugSummary.push(sdsObj)
            })
          }

          if(_rms) {
            Object.keys(_rms).forEach((k) => {
              let rmsObj = {
                name: k,
                percentCorrect: _rms[k].percent_correct
              }

              rescueMedSummary.push(rmsObj)
            })
          }

          if(_ufs) {
            _ufs.forEach((uf) => {
              // uf.forEach((f) => {
                findingIds.push(uf.id)
              // })
            })
          }  

          UsersScoreSummary.update(s._id, {
            $set: {
              severitySummary: severity,
              domainSummary: domain,
              studyDrugSummary: studyDrugSummary,
              rescueMedSummary: rescueMedSummary,
              findingIds: findingIds
              
              // unidentifiedFindings: obj.unidentifiedFindings
            }
          })

          UserReportSummary.update({
            assessmentId: assessmentId
          }, {
            $set: {
              findingIds: findingIds
            }
          })

          if(i === _scores.length -1) {
            callback(null, {success: true})
          }
        })
      } //-- if(_scores && _scores.length > 0) {

    })

    let result = output('dk')

    if(result) {
      return result
    }
  },
  "ETL.UsersScoreSummary.cast"() {
    this.unblock()

    let output = Meteor.wrapAsync((args, callback) => {

      let _uss = UsersScoreSummary.find().fetch()

      if(_uss && _uss.length > 0) {
        _uss.forEach((u, i) => {

          let 
            _ss = [],
            _ds = [],
            _sds = [],
            _rms = []

          if(u.domainSummary) {
            u.domainSummary.forEach((d) => {
              let objD = {
                id: d.id,
                name: d.name,
                percentIdentified: parseInt(d.percentIdentified)
              }

              _ds.push(objD)
            })

            UsersScoreSummary.update(u._id, {
              $set: {
                "domainSummary": _ds
              }
            })
          }

          if(u.severitySummary) {
            u.severitySummary.forEach((s) => {
              let objS = {
                name: s.name,
                percentIdentified: parseInt(s.percentIdentified)
              }

              _ss.push(objS)
            })

            UsersScoreSummary.update(u._id, {
              $set: {
                "severitySummary": _ss
              }
            })
          }

          if(u.studyDrugSummary) {
            u.studyDrugSummary.forEach((sd) => {
              let objSD = {
                name: sd.name,
                percentCorrect: parseInt(sd.percentCorrect)
              }

              _sds.push(objSD)
            })

            UsersScoreSummary.update(u._id, {
              $set: {
                "studyDrugSummary": _sds
              }
            })
          }
          
          if(u.rescueMedSummary) {
            u.rescueMedSummary.forEach((rm) => {
              let objRM = {
                name: rm.name,
                percentCorrect: parseInt(rm.percentCorrect)
              }

              _rms.push(objRM)
            })

            UsersScoreSummary.update(u._id, {
              $set: {
                "rescueMedSummary": _rms
              }
            })
          }


          if(i === _uss.length -1) {
            callback(null, {success: true})
          }

        })
      }

    })

    let result = output('dk')

    if(result) {
      return result
    }
  },
  "ETL.UsersScoreSummary.domain.total"() {
    this.unblock()

    let output = Meteor.wrapAsync((args, callback) => {

      let _uss = UsersScoreSummary.find().fetch()

      if(_uss && _uss.length > 0) {
        _uss.forEach((u, i) => {

          let 
            dTotal = 0,
            dIdentified = 0,
            dPercent = 0

          if(u.domain) {

            Object.entries(u.domain).forEach(([k, v]) => {
              dTotal += v.total
              dIdentified += v.identified
            })

            dPercent = Math.round(dIdentified/dTotal*100)

            UsersScoreSummary.update(u._id, {
              $set: {
                domainScore: dPercent
              }
            })
          }


          if(i === _uss.length -1) {
            callback(null, {success: true})
          }

        }) //-- _uss.forEach((u, i) => {
      }

    })

    let result = output('dk')

    if(result) {
      return result
    }
  },
//   "UBA.FindingsIndividual.compare"(obj) {
//     check(obj, {
//       sourceUser: String,
//       targetUser: String,
//       sid: Number,
//       findings: Array
//     })
//     this.unblock()    

//     let output = Meteor.wrapAsync((args, callback) => {    

//       // console.log(obj.findings.length)
//       // console.log(obj.findings)

//       let _findingsDict = [];

//       // if(obj.findings.length === 0) {

//         let findings = Findings.find({
//           simulation_id: obj.sid,
//           status: 1
//         }).fetch()

//         let 
//           _findingIds = [];          

//         if(findings && findings.length > 0) {
//           findings.forEach((f) => {
//             _findingIds.push(f.id),
//             _findingsDict['b'+f.id] = f.finding;
//           })
//         }
//         obj.findings = _findingIds;

//         // console.log(_findingsDict)
//       // }      

//       let sus = SimUsersSummary.find({
//         simulationId: obj.sid,
//         userId: {$in: [ obj.sourceUser, obj.targetUser ]}        
//       }, {
//         fields: {
//           submittedAt: 1
//         }
//       }).fetch()

//       let diffDates = "0"
//       if(sus && sus.length > 1) {
//         diffDates = Util.diffDates(sus[0].submittedAt, sus[1].submittedAt)
//         // console.log(diffDates)        
//       }

//       let uss = UsersScoreSummary.find({
//         simulation_id: obj.sid,
//         assessee_id: {$in: [ obj.sourceUser, obj.targetUser ]}
//       }, {
//         fields: {
//           unidentified_findings: 1,
//           assessee_id: 1,
//           studyDrugSummary: 1,
//           assessment_id: 1
//         }
//       }).fetch()

//       if(uss) {

//         let
//           sUSS = [], //-- source user's unidentified finding ids
//           tUSS = [],
//           sAsmt = null,
//           tAsmt = null,
//           hasStudy = false

//         uss.forEach((u, i) => {
//           if(u.unidentified_findings.findings) {
//             if(u.assessee_id === obj.sourceUser) {
//               u.unidentified_findings.findings.forEach((f1) => {
//                 sUSS.push(f1.id)
//               })
//               sAsmt = u.assessment_id              
//             }
//             if(u.assessee_id === obj.targetUser) { //-- this(if) works better than 'else if' esp. when sourceUser is targetUser
//               u.unidentified_findings.findings.forEach((f2) => {
//                 tUSS.push(f2.id)
//               })
//               tAsmt = u.assessment_id              
//             }            
//           }

//           if(u.studyDrugSummary && u.studyDrugSummary.length > 0) {
//             hasStudy = true
//           }

//         })

//         let
//           sSBsDict = [],
//           tSBsDict = [],
//           sMNsDict = [],
//           tMNsDict = []

//         let sSBs = ScoringBehaviors.find({
//           assessment_id: sAsmt,
//           status: 1
//         }, {
//           fields: {
//             'behavior.id': 1,
//             'assessor1.mnid': 1,
//             'assessor2.mnid': 1
//           }
//         }).fetch()

//         sSBs.forEach((s) => {
//           let key = 'b'+s.behavior.id
//           sSBsDict[key] = s.assessor1.mnid || s.assessor2.mnid
//         })

//         let tSBs = ScoringBehaviors.find({
//           assessment_id: tAsmt,
//           status: 1
//         }, {
//           fields: {
//             'behavior.id': 1,
//             'assessor1.mnid': 1,
//             'assessor2.mnid': 1
//           }
//         }).fetch()

//         tSBs.forEach((s) => {
//           let key = 'b'+s.behavior.id
//           tSBsDict[key] = s.assessor1.mnid || s.assessor2.mnid
//         })

//         let sMNs = MonitoringNotes.find({
//           creator: obj.sourceUser,
//           simulation_id: obj.sid.toString(),
//           status: 1,
//           key: {$exists: true}
//         }, {
//           fields: {
//             content: 1,
//             creator: 1,
//             createdAt: 1,
//             modifiedAt: 1,
//             key: 1
//           }
//         }).fetch()

//         sMNs.forEach((n) => {
//           let key = 'n'+n.key
//           sMNsDict[key] = n
//         })        

//         let tMNs = MonitoringNotes.find({
//           creator: obj.targetUser,
//           simulation_id: obj.sid.toString(),
//           status: 1,
//           key: {$exists: true}
//         }, {
//           fields: {
//             content: 1,
//             creator: 1,
//             createdAt: 1,
//             modifiedAt: 1,
//             key: 1
//           }
//         }).fetch()

//         tMNs.forEach((n) => {
//           let key = 'n'+n.key
//           tMNsDict[key] = n
//         }) 

//         let 
//           _cpFindings = [],
//           _total = 0,
//           _tDupTotal = 0,
//           _tDup5m = 0,
//           _tDup1m = 0          

//         obj.findings.forEach((fid) => {
//           // console.log(fid)
//           let
//             sVal = !sUSS.includes(fid),
//             tVal = !tUSS.includes(fid),
//             match = sVal === tVal ? true : false,
//             sNote = null,
//             tNote = null;

//           let _finding = _findingsDict['b'+fid] || null; //-- finding text

//           // console.log(_findingsDict);
//           // console.log(_finding, fid);

//           if(sVal) {
//             let 
//               fkey = 'b'+fid,
//               nkey = 'n'+ sSBsDict[fkey]; //-- note key: nb{fid}
            
//             sNote = sMNsDict[nkey] || null                      
//           }

//           if(tVal) {
//             let 
//               fkey = 'b'+fid,
//               nkey = 'n'+ tSBsDict[fkey]
            
//             tNote = tMNsDict[nkey] || null           
//           }

//           if(sVal && tVal) {
//             _tDupTotal++
//             // console.log(fid, _tDupTotal)
//           }

//           let 
//             simil = null, //-- similarity on full notes
//             similF = null, //-- on first text of the notes
//             cAtClass = null;

//           let 
//             _similF1 = null, //-- similarity between source user's note and finding
//             _similF2 = null; //-- similarity between target user's note and finding

//           if(sNote && sNote.content && tNote && tNote.content) {            

//             let
//               _aSF = sNote.content.split('.'), //-- array of note texts to extract the first sentence
//               _aTF = tNote.content.split('.'),
//               sF = _aSF[0],
//               tF = _aTF[0]

//             if(sF.length < 30) { //-- if the text to compare is too short
//               if(_aSF[1]) {
//                 sF += _aSF[1] //-- concatenate the second text to the first one if any
//               }
//             }
//             if(tF.length < 30) {
//               if(_aTF[1]) {
//                 tF += _aTF[1]
//               }
//             }

//             let 
//               _sNoteContentTrimmed = sNote.content.trim(),
//               _tNoteContentTrimmed = tNote.content.trim(),
//               _sFTrimmed = sF.trim(),
//               _tFTrimmed = tF.trim(),
//               _findingTrimmed = _finding && _finding.trim() || null;
// // console.log(_sNoteContentTrimmed);
// // console.log(_tNoteContentTrimmed);
// // console.log(_findingTrimmed);
//             let _similRaw = _sNoteContentTrimmed === _tNoteContentTrimmed ? 1 : textCosineSimilarity(_sNoteContentTrimmed, _tNoteContentTrimmed);            
//             simil = _similRaw.toFixed(3);

//             let _similFRaw = _sFTrimmed === _tFTrimmed ? 1 : textCosineSimilarity(_sFTrimmed, _tFTrimmed);
//             similF = _similFRaw.toFixed(3);

//             let _similF1Raw = _sNoteContentTrimmed === _findingTrimmed ? 1 : textCosineSimilarity(_sNoteContentTrimmed, _findingTrimmed);
//             _similF1 = _similF1Raw.toFixed(3);

//             let _similF2Raw = _tNoteContentTrimmed === _findingTrimmed ? 1 : textCosineSimilarity(_tNoteContentTrimmed, _findingTrimmed);
//             _similF2 = _similF2Raw.toFixed(3);            

//             if(Util.diffDatesRawS(sNote.modifiedAt, tNote.modifiedAt) <= 300) {
//               cAtClass = 'high-time'

//               _tDup5m++

//               if(Util.diffDatesRawS(sNote.modifiedAt, tNote.modifiedAt) <= 60) {
//                 cAtClass = 'highest-time'

//                 _tDup1m++
//                 // _tDup5m--                
//               }              
//             }

//           }

//           // let fObj = [fid, sVal, tVal, match, sNote, tNote, simil, similF, cAtClass, _similF1, _similF2];
//           let fObj = [fid, sVal, tVal, match, sNote, tNote, simil, similF, cAtClass, _similF1, _similF2];
// // console.log(fObj)
//           _cpFindings.push(fObj)

//           if(match) {
//             _total++
//           }
//         })

//         let
//           matchPercent = (_total/obj.findings.length *100).toFixed(1),
//           tDup5mPercent = _tDupTotal > 0 ? (_tDup5m/_tDupTotal *100).toFixed(1) : 0,
//           tDup1mPercent = _tDupTotal > 0 ?  (_tDup1m/_tDupTotal *100).toFixed(1) : 0

//         let _totalObj = [null, obj.findings.length, _total, matchPercent, hasStudy, diffDates, _tDup1m, _tDup5m, tDup1mPercent, tDup5mPercent, _tDupTotal]

//         _cpFindings.push(_totalObj)
// // console.log(_cpFindings)
//         callback(null, {success: true, data: _cpFindings})
//       }

//     })

//     let result = output('dk')

//     if(result) {
//       return result
//     }
//   },
//   "UBA.ComplianceCalculationIndividual.compare"(obj) {
//     check(obj, {
//       sourceUser: String,
//       targetUser: String,
//       sid: Number      
//     })
//     this.unblock()

//     let output = Meteor.wrapAsync((args, callback) => {

//       let $_in = obj.sourceUser === obj.targetUser ? [ obj.sourceUser ] : [ obj.sourceUser, obj.targetUser ]

//       let uss = UsersScoreSummary.find({
//         simulation_id: obj.sid,
//         assessee_id: {$in: $_in}
//       }, {
//         fields: {          
//           assessee_id: 1,
//           study_drug: 1,
//           rescue_med: 1,
//           studyDrugSummary: 1,
//           rescueMedSummary: 1
//         }
//       }).fetch()

//       let
//         _cpCC = [], 
//         _sourceDict = [],
//         _targetDict = []

//       if(uss && uss.length >0) {

//         // uss.forEach((u) => {

//         //   if(u.assessee_id === obj.sourceUser) {
//         //     if(u.study_drug && u.study_drug.answers) {
            
//         //       u.study_drug.answers.forEach((a) => {
//         //         let obj = {
//         //           docName: a.document_name,
//         //           docId: a.document_id,
//         //           docOrder: a.document_order,
//         //           source: [u_pills_taken,u_pills_prescribed,u_pills_percent],
//         //           target: [],
//         //           result: [],
//         //           comp: []
//         //         }

//         //         let key = 'd'+a.document_id
//         //         _sourceDict[key] = {
//         //           docName: a.document_name,
//         //           docId: a.document_id,
//         //           docOrder: a.document_order,

//         //         }
                
//         //       })
              
//         //     }
//         //   }
//         // })

//         let
//           sU = {},
//           tU = {}

//         if(obj.sourceUser === obj.targetUser) {
//           sU = uss[0]
//           tU = uss[0]
//         } else {
//           uss.forEach((u) => {
//             if(u.assessee_id === obj.sourceUser) {
//               sU = u
//             } else {
//               tU = u
//             }
//           })
//         }

//         let
//           _total = 0,
//           _match = 0
//           _errorMatch = 0,
//           _errorBoth = 0,
//           _tDup5m = 0 //-- Time Overlapped within 5 minutes,
//           _tDup1m = 0 //-- Time Overlapped within 1 minute

//         let _cNotes = ComplianceNotes.find({
//           creator:  {$in: $_in},
//           simulation_id: obj.sid.toString()
//         }).fetch()

//         let _cNoteDict = []

//         if(_cNotes && _cNotes.length > 0) {
//           _cNotes.forEach((c) => {
//             let _key = c.creator + c.simulation_id + '_' + c.document.document_id
            
//             // console.log(c.createdAt, c.modifiedAt, new Date(c.createdAt) - new Date(c.modifiedAt), new Date(c.createdAt).getTime(), new Date(c.modifiedAt).getTime(), new Date(c.createdAt).getTime() === new Date(c.modifiedAt).getTime())

//             let _mAt = c.modifiedAt
//             if(Math.abs(c.createdAt-c.modifiedAt) <2) {
//               _mAt = null
//             }

//             _cNoteDict[_key] = {
//               cAt: c.createdAt,
//               // mAt: new Date(c.createdAt).getTime() === new Date(c.modifiedAt).getTime() ? null : c.modifiedAt
//               mAt: _mAt
//             }
//           })
//         }
// // console.log(_cNoteDict)
//         let 
//           suKey = sU.assessee_id + obj.sid,
//           tuKey = tU.assessee_id + obj.sid,
//           _suDict = [], //-- to get cAtClass only per document
//           _tDupTotal = 0

//         if(sU.study_drug && sU.study_drug.answers && sU.study_drug.answers.length > 0 
//             && tU.study_drug && tU.study_drug.answers && tU.study_drug.answers.length > 0) {          

//           sU.study_drug.answers.forEach((a, i) => {            

//             let 
//               _suKey = suKey + '_' + a.document_id,
//               _tuKey = tuKey + '_' + a.document_id
// // console.log(_suKey, _tuKey)
//             let tUa = tU.study_drug.answers[i]

//             let
//               cAtClass = null,
//               mAtClass = null

//             if(!_suDict[_suKey]) {

//               _suDict[_suKey] = a.document_id

//               if(_cNoteDict[_suKey].mAt && _cNoteDict[_tuKey].mAt) {
//                 _tDupTotal += 4
//               }
//               else if(_cNoteDict[_suKey].mAt || _cNoteDict[_tuKey].mAt) {
//                 _tDupTotal += 2
//               } else {
//                 _tDupTotal++
//               }

//               if(Util.diffDatesRawS(_cNoteDict[_suKey].cAt, _cNoteDict[_tuKey].cAt) <= 300 
//                 || (_cNoteDict[_tuKey].mAt 
//                   && Util.diffDatesRawS(_cNoteDict[_suKey].cAt, _cNoteDict[_tuKey].mAt) <= 300)) {
//                 cAtClass = 'high-time'

//                 _tDup5m++

//                 if(Util.diffDatesRawS(_cNoteDict[_suKey].cAt, _cNoteDict[_tuKey].cAt) <= 60 
//                   || (_cNoteDict[_tuKey].mAt 
//                     && Util.diffDatesRawS(_cNoteDict[_suKey].cAt, _cNoteDict[_tuKey].mAt) <= 60)) {
//                   cAtClass = 'highest-time'

//                   _tDup1m++
//                   // _tDup5m--
//                 }
//               }

//               if(Util.diffDatesRawS(_cNoteDict[_suKey].mAt, _cNoteDict[_tuKey].cAt) <= 300 
//                 || (_cNoteDict[_tuKey].mAt 
//                   && Util.diffDatesRawS(_cNoteDict[_suKey].mAt, _cNoteDict[_tuKey].mAt) <= 300)) {
//                 mAtClass = 'high-time'

//                 if(cAtClass !== 'high-time') {
//                   _tDup5m++
//                 }

//                 if(Util.diffDatesRawS(_cNoteDict[_suKey].mAt, _cNoteDict[_tuKey].cAt) <= 60 
//                   || (_cNoteDict[_tuKey].mAt 
//                     && Util.diffDatesRawS(_cNoteDict[_suKey].mAt, _cNoteDict[_tuKey].mAt) <= 60)) {
//                   mAtClass = 'highest-time'

//                   // if(mAtClass !== 'highest-time') {
//                     _tDup1m++
//                     // _tDup5m--
//                   // }             
//                 }
//               }
//             }

//             let obj = {
//               docName: a.document_name,
//               docId: a.document_id,
//               docOrder: a.document_order,
//               source: [a.u_pills_taken, a.u_pills_prescribed, a.u_pills_percent],
//               target: [tUa.u_pills_taken, tUa.u_pills_prescribed, tUa.u_pills_percent],
//               answer: [a.d_pills_taken, a.d_pills_prescribed, a.d_pills_percent],
//               sourceResult: [a.j_pills_taken, a.j_pills_prescribed, a.j_pills_percent],
//               targetResult: [tUa.j_pills_taken, tUa.j_pills_prescribed, tUa.j_pills_percent],
//               comp: [a.u_pills_taken===tUa.u_pills_taken, a.u_pills_prescribed===tUa.u_pills_prescribed, a.u_pills_percent===tUa.u_pills_percent],
//               suCAt: _cNoteDict[_suKey].cAt,
//               suMAt: _cNoteDict[_suKey].mAt,
//               tuCAt: _cNoteDict[_tuKey].cAt,
//               tuMAt: _cNoteDict[_tuKey].mAt,
//               cAtClass: cAtClass,
//               mAtClass: mAtClass
//             }

//             _cpCC.push(obj)

//             if(a.u_pills_taken && a.u_pills_taken === tUa.u_pills_taken) {
//               _match++
//               if(a.j_pills_taken === 'Incorrect') {
//                 _errorMatch++
//               }
//             }

//             if(a.j_pills_taken === 'Incorrect' && tUa.j_pills_taken === 'Incorrect') {
//               _errorBoth++
//             }

//             if(a.u_pills_prescribed && a.u_pills_prescribed===tUa.u_pills_prescribed) {
//               _match++
//               if(a.j_pills_prescribed === 'Incorrect') {
//                 _errorMatch++
//               }              
//             }

//             if(a.j_pills_prescribed === 'Incorrect' && tUa.j_pills_prescribed === 'Incorrect') {
//               _errorBoth++
//             }

//             if(a.u_pills_percent && a.u_pills_percent===tUa.u_pills_percent) {
//               _match++
//               if(a.j_pills_percent === 'Incorrect') {
//                 _errorMatch++
//               }               
//             }

//             if(a.j_pills_percent === 'Incorrect' && tUa.j_pills_percent === 'Incorrect') {
//               _errorBoth++
//             }

//           })

//         _total += sU.study_drug.answers.length * sU.studyDrugSummary.length
//         }

//         if(sU.rescue_med && sU.rescue_med.answers && sU.rescue_med.answers.length > 0 
//             && tU.rescue_med && tU.rescue_med.answers && tU.rescue_med.answers.length > 0) {          

//           sU.rescue_med.answers.forEach((a, i) => {

//             let 
//               _suKey = suKey + '_' + a.document_id,
//               _tuKey = tuKey + '_' + a.document_id            

//             let tUa = tU.rescue_med.answers[i]

//             let
//               cAtClass = null,
//               mAtClass = null

//             if(!_suDict[_suKey]) {

//               _suDict[_suKey] = a.document_id
              
//               if(_cNoteDict[_suKey].mAt && _cNoteDict[_tuKey].mAt) {
//                 _tDupTotal += 4
//               }
//               else if(_cNoteDict[_suKey].mAt || _cNoteDict[_tuKey].mAt) {
//                 _tDupTotal += 2
//               } else {
//                 _tDupTotal++
//               }              

//               if(Util.diffDatesRawS(_cNoteDict[_suKey].cAt, _cNoteDict[_tuKey].cAt) <= 300 
//                 || (_cNoteDict[_tuKey].mAt 
//                   && Util.diffDatesRawS(_cNoteDict[_suKey].cAt, _cNoteDict[_tuKey].mAt) <= 300)) {
//                 cAtClass = 'high-time'

//                 _tDup5m++

//                 if(Util.diffDatesRawS(_cNoteDict[_suKey].cAt, _cNoteDict[_tuKey].cAt) <= 60 
//                   || (_cNoteDict[_tuKey].mAt 
//                     && Util.diffDatesRawS(_cNoteDict[_suKey].cAt, _cNoteDict[_tuKey].mAt) <= 60)) {
//                   cAtClass = 'highest-time'

//                   _tDup1m++
//                   // _tDup5m--
//                 }
//               }
//   // console.log(_cNoteDict[_suKey].cAt, _cNoteDict[_tuKey].cAt, Util.diffDatesRawS(_cNoteDict[_suKey].cAt, _cNoteDict[_tuKey].cAt), cAtClass)
//               if(Util.diffDatesRawS(_cNoteDict[_suKey].mAt, _cNoteDict[_tuKey].cAt) <= 300 
//                 || (_cNoteDict[_tuKey].mAt 
//                   && Util.diffDatesRawS(_cNoteDict[_suKey].mAt, _cNoteDict[_tuKey].mAt) <= 300)) {
//                 mAtClass = 'high-time'

//                 if(cAtClass !== 'high-time') {
//                   _tDup5m++
//                 }

//                 if(Util.diffDatesRawS(_cNoteDict[_suKey].mAt, _cNoteDict[_tuKey].cAt) <= 60 
//                   || (_cNoteDict[_tuKey].mAt 
//                     && Util.diffDatesRawS(_cNoteDict[_suKey].mAt, _cNoteDict[_tuKey].mAt) <= 60)) {
//                   mAtClass = 'highest-time'

//                   // if(cAtClass !== 'highest-time') {
//                     _tDup1m++
//                     // _tDup5m--
//                   // }              
//                 }
//               }
//             }

//             let obj = {
//               docName: a.document_name,
//               docId: a.document_id,
//               docOrder: a.document_order,
//               source: [a.u_pills_taken, a.u_pills_prescribed, a.u_pills_percent],
//               target: [tUa.u_pills_taken, tUa.u_pills_prescribed, tUa.u_pills_percent],
//               answer: [a.d_pills_taken, a.d_pills_prescribed, a.d_pills_percent],
//               sourceResult: [a.j_pills_taken, a.j_pills_prescribed, a.j_pills_percent],
//               targetResult: [tUa.j_pills_taken, tUa.j_pills_prescribed, tUa.j_pills_percent],
//               comp: [a.u_pills_taken===tUa.u_pills_taken, a.u_pills_prescribed===tUa.u_pills_prescribed, a.u_pills_percent===tUa.u_pills_percent],
//               suCAt: _cNoteDict[_suKey].cAt,
//               suMAt: _cNoteDict[_suKey].mAt,
//               tuCAt: _cNoteDict[_tuKey].cAt,
//               tuMAt: _cNoteDict[_tuKey].mAt,
//               cAtClass: cAtClass,
//               mAtClass: mAtClass                          
//             }
// // console.log(obj)
//             _cpCC.push(obj)

//             if(a.u_pills_taken && a.u_pills_taken===tUa.u_pills_taken) {
//               _match++
//               if(a.j_pills_taken === 'Incorrect') {
//                 _errorMatch++
//               }              
//             }

//             if(a.j_pills_taken === 'Incorrect' && tUa.j_pills_taken === 'Incorrect') {
//               _errorBoth++
//             }

//             if(a.u_pills_prescribed && a.u_pills_prescribed===tUa.u_pills_prescribed) {
//               _match++
//               if(a.j_pills_prescribed === 'Incorrect') {
//                 _errorMatch++
//               }              
//             }

//             if(a.j_pills_prescribed === 'Incorrect' && tUa.j_pills_prescribed === 'Incorrect') {
//               _errorBoth++
//             }

//             if(a.u_pills_percent && a.u_pills_percent===tUa.u_pills_percent) {
//               _match++
//               if(a.j_pills_percent === 'Incorrect') {
//                 _errorMatch++
//               }              
//             }

//             if(a.j_pills_percent === 'Incorrect' && tUa.j_pills_percent === 'Incorrect') {
//               _errorBoth++
//             }
//           })

//           _total += sU.rescue_med.answers.length * sU.rescueMedSummary.length
//         }

//         let 
//           matchPercent = (_match/_total *100).toFixed(1),
//           // errorMatchPercent = (_errorMatch/_match * 100).toFixed(1)
//           errorMatchPercent = _errorBoth > 0 ? (_errorMatch/_errorBoth * 100).toFixed(1) : 0

//         let _totalObj = {
//           total: _total,
//           match: _match,
//           errorMatch: _errorMatch,
//           matchPercent: matchPercent,
//           errorMatchPercent: errorMatchPercent,
//           errorBoth: _errorBoth,
//           tDup5m: _tDup5m,
//           tDup1m: _tDup1m,
//           tDupTotal: _tDupTotal,
//           tDup5mPercent: _match > 0 ? (_tDup5m/_tDupTotal *100).toFixed(1) : 0,
//           tDup1mPercent: _match > 0 ? (_tDup1m/_tDupTotal *100).toFixed(1) : 0,
//         }

//         _cpCC.push(_totalObj)

//         callback(null, {success: true, data: _cpCC})
//       }

//     })

//     let result = output('dk')

//     if(result) {
//       return result
//     }
//   },
  // "UBA.FindingsBU.compute1"(obj) {
  //   check(obj, {
  //     cid: String,
  //     buid: String,
  //     sid: Number
  //   })
  //   this.unblock()

  //   let output = Meteor.wrapAsync((args, callback) => {

  //     let numFindings = Findings.find({
  //       simulation_id: obj.sid,
  //       status: 1
  //     }).count()

  //     let _u = UsersScoreSummary.find({
  //       client_id: obj.cid,
  //       bu_id: obj.buid,
  //       simulation_id: obj.sid        
  //     }, {
  //       fields: {
  //         assessment_id: 1,
  //         assessee_id: 1,            
  //         client_id: 1,
  //         bu_id: 1,
  //         simulation_id: 1,
  //         findingIds: 1       
  //       }
  //     }).fetch()

  //     let 
  //       _uDict = [],
  //       _aAsmtIds = [],
  //       _allPairs = [],
  //       _allAsmtPairs = [],
  //       _susD = []

  //     if(_u && _u.length > 0) {

  //       let _sus = SimUsersSummary.find({
  //         // assessmentId: { $in: _aAsmtIds }
  //         clientId: obj.cid,
  //         buId: obj.buid,
  //         simulationId: obj.sid,
  //         assessmentId: { $exists: true }
  //       }, {
  //         fields: {
  //           assessmentId: 1,
  //           userId: 1,
  //           lastname: 1,
  //           fullname: 1,
  //           country: 1
  //         }
  //       }).fetch()

  //       if(_sus && _sus.length > 0) {
  //         _sus.forEach((s) => {
  //           _susD[s.assessmentId] = {
  //             name: s.fullname,
  //             uid: s.userId,
  //             country: s.country
  //           }
  //         })
  //       }

  //       let 
  //         _len = _u.length,
  //         k = 0

  //       // _uss.forEach((u, i) => {
  //       for(let i=0, len=_len;i < len;i++) {
  //         k++
  //         _u[_u[i].assessment_id] = _u[i]
  //         _aAsmtIds.push(_u[i].assessment_id)

  //         let 
  //           _pairs = [],
  //           _pairsAsmt = []

  //         for(let j=0;j < k;j++) {
  //           let 
  //             _pair = [_u[i].findingIds, _u[j].findingIds],
  //             _pairAsmt = [_u[i].assessment_id, _u[j].assessment_id]

  //           _pairs.push(_pair)
  //           _pairsAsmt.push(_pairAsmt)
  //         }

  //         _allPairs.push(_pairs)
  //         _allAsmtPairs.push(_pairsAsmt)

  //       }

  //       let _sid = obj.sid

  //       let 
  //         _diff = [],
  //         // _names = [],
  //         _topCases = [],
  //         _totalCases = 0,
  //         _totalScores = 0,
  //         _meanScore = 0

  //       _allPairs.forEach((a, i) => {

  //         let _subDiff = []

  //         a.forEach((_a, j) => {

  //           if(j === 0) {
  //             _subDiff.push([null])
  //           } else {

  //             let 
  //               sizeOfDiff = Util.findingsDiff(_a[0], _a[1]).length,
  //               sizeOfMatch = numFindings - sizeOfDiff,
  //               percent = Math.round(sizeOfMatch/numFindings *100),
  //               _class = ''

  //             let
  //               a1id = _allAsmtPairs[i][j][0],
  //               a2id = _allAsmtPairs[i][j][1],
  //               u1id = _susD[a1id].uid,
  //               u2id = _susD[a2id].uid,
  //               u1name = _susD[a1id].name,
  //               u2name = _susD[a2id].name,
  //               u1country = _susD[a1id].country,
  //               u2country = _susD[a2id].country

  //             if(percent >= 90) {
  //               _class = 'highest'
                
  //               let _aU = [u1id, u2id]
  //               _aU.sort()
  //               let _cpKey = _aU[0] + _sid + _aU[1]

  //               _topCases.push([u1name, u2name, u1id, u2id, percent, _class, u1country, u2country, _cpKey])
  //             }
  //             else if(percent >= 80 && percent < 90) {
  //               _class = 'high'

  //               let _aU = [u1id, u2id]
  //               _aU.sort()
  //               let _cpKey = _aU[0] + _sid + _aU[1]
                
  //               _topCases.push([u1name, u2name, u1id, u2id, percent, _class, u1country, u2country, _cpKey])
  //             }              
  //             else if(percent >= 70 && percent < 80) {
  //               _class = 'mid-high'
  //             }
  //             else if(percent >= 50 && percent < 70) {
  //               _class = 'medium'
  //             }
  //             else {
  //               _class = 'low'
  //             }              
              
  //             _subDiff.push([u1name, u2name, u1id, u2id, percent, _class, u1country, u2country])

  //             _totalCases++
  //             _totalScores += percent
  //           }

  //         })

  //         _diff.push(_subDiff)

  //       })

  //       if(_topCases.length > 0) {
  //         _topCases.sort((a, b) => {
  //           return b[4] - a[4]
  //         })
  //       }

  //       if(_totalCases > 0) {
  //         _meanScore = (_totalScores / _totalCases).toFixed(1)
  //       }

  //       callback(null, {success: true, data: {diff: _diff, top: _topCases, mean: _meanScore }})
  //     } else {
  //       callback(null, {success: true, data: []})
  //     }
  //   })

  //   let result = output('dk')

  //   if(result) {
  //     return result
  //   }
  // },        
  // "UBA.FindingsBU.compute"(obj) {
  //   check(obj, {
  //     cid: String,
  //     buid: String,
  //     sid: Number
  //   })
  //   this.unblock()

  //   let output = Meteor.wrapAsync((args, callback) => {

  //     let numFindings = Findings.find({
  //       simulation_id: obj.sid,
  //       status: 1
  //     }).count()

  //     // let 
  //       // rawScores = UsersScoreSummary.rawCollection(),
  //       // aggregateQueryScores = Meteor.wrapAsync(rawScores.aggregate, rawScores);

  //     let pipelineScores = 
  //     [
  //       {
  //         $match: {
  //           client_id: obj.cid,
  //           bu_id: obj.buid,
  //           simulation_id: obj.sid
  //         }
  //       },
  //       {
  //         $lookup: {
  //           from: "sim_users_summary",
  //           localField: "assessment_id",
  //           foreignField: "assessmentId",
  //           as: "sus"          
  //         }
  //       },
  //       {
  //         $unwind: "$sus"
  //       },
  //       {
  //         $project: {            
  //           assessee_id: "$assessee_id",
  //           client_id: "$client_id",
  //           bu_id: "$bu_id",
  //           simulation_id: "$simulation_id",
  //           // firstname: "$sus.firstname",
  //           lastname: "$sus.lastname",
  //           fullname: "$sus.fullname",
  //           findings: "$findingIds" ,
  //           country: "$sus.country"
  //         }
  //       },
  //       {
  //         $sort: {
  //           "fullname": 1
  //         }
  //       }
  //     ];

  //     // let _scores = aggregateQueryScores(pipelineScores)        
  //     let _scores = Promise.await(UsersScoreSummary.rawCollection().aggregate(pipelineScores).toArray());

  //     let 
  //       _diff = [],
  //       // _names = [],
  //       _topCases = [],
  //       _totalCases = 0,
  //       _totalScores = 0,
  //       _meanScore = 0        

  //     if(_scores && _scores.length > 0) {

  //       _scores.forEach((s1, i) => {
          
  //         // _names.push(s1.firstname)
          
  //         let _subDiff = []

  //         _scores.forEach((s2, j) => {
  //           if(j < i+1) {
  //           // for( var j =0;j<i+1;j++) { //-- this one is slower than forEach with if(j < i+1) condition
  //             // let s2 = _scores[j]

  //             if(s1.assessee_id === s2.assessee_id) {

  //               _subDiff.push([s1.lastname])              
  //               // continue; //-- with for(...) loop
  //               j = 0 //-- this is critical with forEach loop
  //               return; //-- with forEach loop
  //             }              
  //             else {
  //               let 
  //                 sizeOfDiff = Util.findingsDiff(s1.findings, s2.findings).length,
  //                 sizeOfMatch = numFindings - sizeOfDiff,
  //                 percent = Math.round(sizeOfMatch/numFindings *100),
  //                 _class = ''

  //               if(percent >= 90) {
  //                 _class = 'highest'
                  
  //                 let _aU = [s1.assessee_id, s2.assessee_id]
  //                 _aU.sort()
  //                 let _cpKey = _aU[0] + obj.sid + _aU[1]

  //                 _topCases.push([s1.fullname, s2.fullname, s1.assessee_id, s2.assessee_id, percent, _class, s1.country, s2.country, _cpKey])                
  //               }
  //               else if(percent >= 80 && percent < 90) {
  //                 _class = 'high'

  //                 let _aU = [s1.assessee_id, s2.assessee_id]
  //                 _aU.sort()
  //                 let _cpKey = _aU[0] + obj.sid + _aU[1]
                  
  //                 _topCases.push([s1.fullname, s2.fullname, s1.assessee_id, s2.assessee_id, percent, _class, s1.country, s2.country, _cpKey])
  //               }
  //               else if(percent >= 70 && percent < 80) {
  //                 _class = 'mid-high'
  //               }
  //               else if(percent >= 50 && percent < 70) {
  //                 _class = 'medium'
  //               }
  //               else {
  //                 _class = 'low'
  //               }              

  //               _subDiff.push([s1.fullname, s2.fullname, s1.assessee_id, s2.assessee_id, percent, _class, s1.country, s2.country])

  //               _totalCases++
  //               _totalScores += percent
  //             } 
  //           }
  //         })

  //         _diff.push(_subDiff)
  //       })
  //     }

  //     if(_topCases.length > 0) {
  //       _topCases.sort((a, b) => {
  //         return b[4] - a[4]
  //       })
  //     }

  //     if(_totalCases > 0) {
  //       _meanScore = (_totalScores / _totalCases).toFixed(1)
  //     }

  //     callback(null, {success: true, data: {diff: _diff, top: _topCases, mean: _meanScore }})
  //   })

  //   let result = output('dk')

  //   if(result) {
  //     return result
  //   }
  // },
  "ETL.UsersScoreSummary.findingsTotal"() {
    this.unblock()

    let output = Meteor.wrapAsync((args, callback) => {

      let _fData = Findings.aggregate({
        $match: {
          status: 1
        }
      }, {
        $group: {
          _id:  "$simulation_id",
          // _id: {
          //   sid: "$simulation_id"
          // },
          count: { $sum : 1}
        }
      }, {
        $project: {
          _id: 1,
          // sid: "$_id.sid",
          count: 1
        }
      })

      if(_fData && _fData.length > 0) {
      
        let _fDict = []

        _fData.forEach((f) => {
          let _fSKey = 's' + f._id
          _fDict[_fSKey] = f.count
        })

        let _uss = UsersScoreSummary.find().fetch()

        if(_uss && _uss.length > 0) {
          _uss.forEach((u, i) => {
            if(u.unidentified_findings) {
              let 
                _uSKey = 's' + u.simulation_id,
                _numUF = u.unidentified_findings.num_findings || 0,
                _total = _fDict[_uSKey],
                _numIF = _total - _numUF

              UsersScoreSummary.update(u._id, {
                $set: {
                  numIF: _numIF, 
                  numUF: _numUF,
                  totalF: _total
                }
              })

            }

            if(i === _uss.length-1) {
              callback(null, {success: true })
            }
          })
        }        
      }

    })

    let result = output('dq')

    if(result) {
      return result
    }
  },
  "ETL.UsersScoreSummary.addIdentifiedNTotal"() {
    this.unblock()

    let output = Meteor.wrapAsync((args, callback) => {

      let _uss = UsersScoreSummary.find({}, {
        fields: {
          domain: 1,
          domainSummary: 1
        },
        // limit: 1
      }).fetch();

      if(_uss && _uss.length > 0) {
        _uss.forEach((u,i) => {
          if(u.domain) {
            // if(i === 0) {
            let _newDomainSummary = [];
            Object.keys(u.domain).forEach((k,j) => {
              // console.log(u._id,j,u.domain[k],u.domainSummary[j])

              let
                _d = u.domain[k], 
                _obj = {
                  id: _d.id,
                  name: _d.name,
                  identified: _d.identified,
                  total: _d.total,
                  percentIdentified: parseInt(_d.percent_identified),
                  remed: _remedNamesDict[_d.name] || null
                };

              _newDomainSummary.push(_obj);
            })
            
            UsersScoreSummary.update(u._id, {
              $set: {
                "domainSummary": _newDomainSummary
              }
            })            
            // }
          }

          if(i === _uss.length-1) {
            callback(null, {success: true })
          }          
        })
      }

    })

    let result = output('dq')

    if(result) {
      return result
    }
  },
  "ETL.UsersScoreSummary.addNewDomainTotal"() {
    this.unblock()

    let output = Meteor.wrapAsync((args, callback) => {

      let _uss = UsersScoreSummary.find({}, {
        fields: {
          domain: 1,
          domainSummary: 1
        },
        // limit: 1
      }).fetch();

      if(_uss && _uss.length > 0) {
        _uss.forEach((u,i) => {
          if(u.domainSummary) {
            
            let
              _domainScore2 = 0,
              _numIF2 = 0,
              _numUF2 = 0,
              _totalF2 = 0;

            u.domainSummary.forEach((d) => {
              if(d.id !== 2) {                
                _numIF2 += d.identified;
                _numUF2 += (d.total-d.identified);
                _totalF2 += d.total;
              }
            })

            _domainScore2 = Math.round(_numIF2/_totalF2*100);
            
            UsersScoreSummary.update(u._id, {
              $set: {
                numIF2: _numIF2,
                numUF2: _numUF2,
                totalF2: _totalF2,
                domainScore2: _domainScore2
              }
            })            
          }        

          if(i === _uss.length-1) {
            callback(null, {success: true })
          }          
        })
      }

    })

    let result = output('dq')

    if(result) {
      return result
    }
  }  
});




