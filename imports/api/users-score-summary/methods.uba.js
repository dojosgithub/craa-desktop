import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Promise } from 'meteor/promise'

const XLSX = require('xlsx');

import { Util } from '/imports/lib/server/util.js'

import { UsersScoreSummary } from './users-score-summary.js';

import { Findings } from '/imports/api/findings/findings.js';

import { ScoringBehaviors } from '/imports/api/scoring-behaviors/scoring-behaviors.js';
import { MonitoringNotes } from '/imports/api/monitoring-notes/monitoring-notes.js';
import { ComplianceNotes } from '/imports/api/compliance-notes/compliance-notes.js';

import { SimUsersSummary } from '/imports/api/sim-users-summary/sim-users-summary.js';

import { CollaborationAudit } from '/imports/api/collaboration-audit/collaboration-audit.js';
import { FindingsSelected } from '/imports/api/findings-selected/findings-selected.js';
import { exists } from 'original-fs';

Meteor.methods({
  "UBA.FindingsIndividual.compare"(obj) {
    check(obj, {
      sourceUser: String,
      targetUser: String,
      sid: Number,
      findings: Array
    })
    // this.unblock()    

    let output = Meteor.wrapAsync((args, callback) => {    

      // console.log(obj.findings.length)
      // console.log(obj.findings)

      //-- added FindingsSelected, W/o this, unidentified findings can be evaled as identified (08/23/2021)
      let
        _selectedFindingIds = [], 
        _findingsSelected = FindingsSelected.findOne({
        simulation_id: obj.sid,
        status: 1
      });

      let _objFindings = obj.findings; //-- to include only findings selected in case FindingsSelected has some (08/23/2021)

      let _findingsDict = [];

      let findings = Findings.find({
        simulation_id: obj.sid,
        status: 1
      }).fetch()

      let 
        _findingIds = [];          

      if(findings && findings.length > 0) {
        findings.forEach((f) => {
          _findingIds.push(f.id),
          _findingsDict['b'+f.id] = f.finding;
        })
      }

      if(_findingsSelected) {
        if(_findingsSelected.findings && _findingsSelected.findings.length > 0) {
          _findingsSelected.findings.forEach((f) => {
            _selectedFindingIds.push(f);
          })

          _objFindings = _selectedFindingIds;

        } else {
          _selectedFindingIds = null;
        }
      } else {

        // let findings = Findings.find({
        //   simulation_id: obj.sid,
        //   status: 1
        // }).fetch()

        // let 
        //   _findingIds = [];          

        // if(findings && findings.length > 0) {
        //   findings.forEach((f) => {
        //     _findingIds.push(f.id),
        //     _findingsDict['b'+f.id] = f.finding;
        //   })
        // }
        _objFindings = _findingIds;

      }

      // let _findingsDict = [];

      // if(obj.findings.length === 0) {

        // let findings = Findings.find({
        //   simulation_id: obj.sid,
        //   status: 1
        // }).fetch()

        // let 
        //   _findingIds = [];          

        // if(findings && findings.length > 0) {
        //   findings.forEach((f) => {
        //     _findingIds.push(f.id),
        //     _findingsDict['b'+f.id] = f.finding;
        //   })
        // }
        // obj.findings = _findingIds;

        // console.log(_findingsDict)
      // }      

      let sus = SimUsersSummary.find({
        simulationId: obj.sid,
        userId: {$in: [ obj.sourceUser, obj.targetUser ]}        
      }, {
        fields: {
          submittedAt: 1
        }
      }).fetch()

      let diffDates = "0"
      if(sus && sus.length > 1) {
        diffDates = Util.diffDates(sus[0].submittedAt, sus[1].submittedAt)
        // console.log(diffDates)        
      }

      let uss = UsersScoreSummary.find({
        simulation_id: obj.sid,
        assessee_id: {$in: [ obj.sourceUser, obj.targetUser ]}
      }, {
        fields: {
          findingIds: 1,
          unidentified_findings: 1,
          assessee_id: 1,
          studyDrugSummary: 1,
          assessment_id: 1,
          domainSummary: 1          
        }
      }).fetch()

      if(uss) {

        let
          sUSS = [], //-- source user's unidentified finding ids
          tUSS = [],
          sAsmt = null,
          tAsmt = null,
          hasStudy = false

        // uss.forEach((u, i) => {
        //   if(u.unidentified_findings.findings) {
        //     if(u.assessee_id === obj.sourceUser) {
        //       u.unidentified_findings.findings.forEach((f1) => {
        //         if(_selectedFindingIds && _selectedFindingIds.includes(f1.id)) { //-- to avoid unidentifed to be identified (08/23/2021)
        //           sUSS.push(f1.id)
        //         } else {
        //           sUSS.push(f1.id)
        //         }
        //       })
        //       sAsmt = u.assessment_id              
        //     }
        //     if(u.assessee_id === obj.targetUser) { //-- this(if) works better than 'else if' esp. when sourceUser is targetUser
        //       u.unidentified_findings.findings.forEach((f2) => {
        //         if(_selectedFindingIds && _selectedFindingIds.includes(f2.id)) { //-- to avoid unidentifed to be identified (08/23/2021)
        //           tUSS.push(f2.id)
        //         } else {
        //           tUSS.push(f2.id)
        //         }
        //       })
        //       tAsmt = u.assessment_id              
        //     }            
        //   }

        //   if(u.studyDrugSummary && u.studyDrugSummary.length > 0) {
        //     hasStudy = true
        //   }

        // }) //-- uss.forEach((u, i) => {
        
          // uss.forEach((u, i) => {
          //   if(u.findingIds) {
          //     let _findingIds = [...new Set(u.findingIds)];

          //     if(u.assessee_id === obj.sourceUser) {
          //       _findingIds.forEach((f1) => {
          //         if(_selectedFindingIds && _selectedFindingIds.includes(f1)) { //-- to avoid unidentifed to be identified (08/23/2021)
          //           sUSS.push(f1)
          //         } else {
          //           sUSS.push(f1)
          //         }
          //       })
          //       sAsmt = u.assessment_id              
          //     }
          //     if(u.assessee_id === obj.targetUser) { //-- this(if) works better than 'else if' esp. when sourceUser is targetUser
          //       _findingIds.forEach((f2) => {
          //         if(_selectedFindingIds && _selectedFindingIds.includes(f2)) { //-- to avoid unidentifed to be identified (08/23/2021)
          //           tUSS.push(f2)
          //         } else {
          //           tUSS.push(f2)
          //         }
          //       })
          //       tAsmt = u.assessment_id              
          //     }            
          //   }
  
          //   if(u.studyDrugSummary && u.studyDrugSummary.length > 0) {
          //     hasStudy = true
          //   }
  
          // }) //-- uss.forEach((u, i) => {

            uss.forEach((u, i) => {
              if(u.domainSummary) {

                let _ufFindings = [];
                u.domainSummary.forEach((d) => {
                  if(d.idfs) {
                    _ufFindings = _ufFindings.concat(d.idfs);
                  }
                })

                _ufFindings = [...new Set(_ufFindings)];
  
                if(u.assessee_id === obj.sourceUser) {
                  _ufFindings.forEach((f1) => {
                    if(_selectedFindingIds && _selectedFindingIds.includes(f1)) { //-- to avoid unidentifed to be identified (08/23/2021)
                      sUSS.push(f1)
                    } else {
                      sUSS.push(f1)
                    }
                  })
                  sAsmt = u.assessment_id              
                }
                if(u.assessee_id === obj.targetUser) { //-- this(if) works better than 'else if' esp. when sourceUser is targetUser
                  _ufFindings.forEach((f2) => {
                    if(_selectedFindingIds && _selectedFindingIds.includes(f2)) { //-- to avoid unidentifed to be identified (08/23/2021)
                      tUSS.push(f2)
                    } else {
                      tUSS.push(f2)
                    }
                  })
                  tAsmt = u.assessment_id              
                }            
              }
    
              if(u.studyDrugSummary && u.studyDrugSummary.length > 0) {
                hasStudy = true
              }
    
            }) //-- uss.forEach((u, i) => {

        sUSS = [...new Set(sUSS)];
        tUSS = [...new Set(tUSS)];

// console.log(sUSS);
// console.log(_objFindings);

        let
          sSBsDict = [],
          tSBsDict = [],
          sMNsDict = [],
          tMNsDict = []

        let sSBs = ScoringBehaviors.find({
          assessment_id: sAsmt,
          status: 1,
          qa: { $ne: 1 }
        }, {
          fields: {
            'behavior.id': 1,
            'assessor1.mnid': 1,
            'assessor2.mnid': 1
          }
        }).fetch()

        sSBs.forEach((s) => {
          let key = 'b'+s.behavior.id
          // sSBsDict[key] = s.assessor1.mnid || s.assessor2.mnid
          sSBsDict[key] = (s.assessor1 && s.assessor1.mnid) || (s.assessor2 && s.assessor2.mnid) || null
        })

        let tSBs = ScoringBehaviors.find({
          assessment_id: tAsmt,
          status: 1,
          qa: { $ne: 1 }
        }, {
          fields: {
            'behavior.id': 1,
            'assessor1.mnid': 1,
            'assessor2.mnid': 1
          }
        }).fetch()

        tSBs.forEach((s) => {
          let key = 'b'+s.behavior.id
          // tSBsDict[key] = s.assessor1.mnid || s.assessor2.mnid
          tSBsDict[key] = (s.assessor1 && s.assessor1.mnid) || (s.assessor2 && s.assessor2.mnid) || null
        })

        let sMNs = MonitoringNotes.find({
          creator: obj.sourceUser,
          simulation_id: obj.sid.toString(),
          status: 1,
          key: {$exists: true}
        }, {
          fields: {
            content: 1,
            creator: 1,
            createdAt: 1,
            modifiedAt: 1,
            key: 1
          }
        }).fetch()

        sMNs.forEach((n) => {
          let key = 'n'+n.key
          sMNsDict[key] = n
        })        

        let tMNs = MonitoringNotes.find({
          creator: obj.targetUser,
          simulation_id: obj.sid.toString(),
          status: 1,
          key: {$exists: true}
        }, {
          fields: {
            content: 1,
            creator: 1,
            createdAt: 1,
            modifiedAt: 1,
            key: 1
          }
        }).fetch()

        tMNs.forEach((n) => {
          let key = 'n'+n.key
          tMNsDict[key] = n
        }) 

        let 
          _cpFindings = [],
          _total = 0,
          _tDupTotal = 0,
          _tDup5m = 0,
          _tDup1m = 0          

        // obj.findings.forEach((fid) => {
        _objFindings.forEach((fid) => { //-- to deal with only the selected findings in case FindingsSelected has some (08/23/2021)
          // console.log(fid)
          let
            // sVal = !sUSS.includes(fid),
            // tVal = !tUSS.includes(fid),
            sVal = sUSS.includes(fid),
            tVal = tUSS.includes(fid),
            match = sVal === tVal ? true : false,
            sNote = null,
            tNote = null;

          let _finding = _findingsDict['b'+fid] || null; //-- finding text

          // console.log(_findingsDict);
          // console.log(_finding, fid);

          if(sVal) {
            let 
              fkey = 'b'+fid,
              nkey = 'n'+ sSBsDict[fkey]; //-- note key: nb{fid}
            
            sNote = sMNsDict[nkey] || null                      
          }

          if(tVal) {
            let 
              fkey = 'b'+fid,
              nkey = 'n'+ tSBsDict[fkey]
            
            tNote = tMNsDict[nkey] || null           
          }

          if(sVal && tVal) {
            _tDupTotal++
            // console.log(fid, _tDupTotal)
          }

          let 
            simil = null, //-- similarity on full notes
            similF = null, //-- on first text of the notes
            cAtClass = null;

          let 
            _similF1 = null, //-- similarity between source user's note and finding
            _similF2 = null; //-- similarity between target user's note and finding

          if(sNote && sNote.content && tNote && tNote.content) {            

            let
              _aSF = sNote.content.split('.'), //-- array of note texts to extract the first sentence
              _aTF = tNote.content.split('.'),
              sF = _aSF[0],
              tF = _aTF[0]

            if(sF.length < 30) { //-- if the text to compare is too short
              if(_aSF[1]) {
                sF += _aSF[1] //-- concatenate the second text to the first one if any
              }
            }
            if(tF.length < 30) {
              if(_aTF[1]) {
                tF += _aTF[1]
              }
            }

            let 
              _sNoteContentTrimmed = sNote.content.trim(),
              _tNoteContentTrimmed = tNote.content.trim(),
              _sFTrimmed = sF.trim(),
              _tFTrimmed = tF.trim(),
              _findingTrimmed = _finding && _finding.trim() || null;
// console.log(_sNoteContentTrimmed);
// console.log(_tNoteContentTrimmed);
// console.log(_findingTrimmed);
            let _similRaw = _sNoteContentTrimmed === _tNoteContentTrimmed ? 1 : textCosineSimilarity(_sNoteContentTrimmed, _tNoteContentTrimmed);            
            simil = _similRaw.toFixed(3);

            let _similFRaw = _sFTrimmed === _tFTrimmed ? 1 : textCosineSimilarity(_sFTrimmed, _tFTrimmed);
            similF = _similFRaw.toFixed(3);

            let _similF1Raw = _sNoteContentTrimmed === _findingTrimmed ? 1 : textCosineSimilarity(_sNoteContentTrimmed, _findingTrimmed);
            _similF1 = _similF1Raw.toFixed(3);

            let _similF2Raw = _tNoteContentTrimmed === _findingTrimmed ? 1 : textCosineSimilarity(_tNoteContentTrimmed, _findingTrimmed);
            _similF2 = _similF2Raw.toFixed(3);            

            if(Util.diffDatesRawS(sNote.modifiedAt, tNote.modifiedAt) <= 300) {
              cAtClass = 'high-time'

              _tDup5m++

              if(Util.diffDatesRawS(sNote.modifiedAt, tNote.modifiedAt) <= 60) {
                cAtClass = 'highest-time'

                _tDup1m++
                // _tDup5m--                
              }              
            }

          }

          // let fObj = [fid, sVal, tVal, match, sNote, tNote, simil, similF, cAtClass, _similF1, _similF2];
          
          let fObj = [fid, sVal, tVal, match, sNote, tNote, simil, similF, cAtClass, _similF1, _similF2];
// console.log(fObj)
          _cpFindings.push(fObj)

          if(match) {
            _total++
          }
        })

        let
          // matchPercent = (_total/obj.findings.length *100).toFixed(1),
          matchPercent = (_total/_objFindings.length *100).toFixed(1),
          tDup5mPercent = _tDupTotal > 0 ? (_tDup5m/_tDupTotal *100).toFixed(1) : 0,
          tDup1mPercent = _tDupTotal > 0 ?  (_tDup1m/_tDupTotal *100).toFixed(1) : 0

        // let _totalObj = [null, obj.findings.length, _total, matchPercent, hasStudy, diffDates, _tDup1m, _tDup5m, tDup1mPercent, tDup5mPercent, _tDupTotal]
        let _totalObj = [null, _objFindings.length, _total, matchPercent, hasStudy, diffDates, _tDup1m, _tDup5m, tDup1mPercent, tDup5mPercent, _tDupTotal]

        _cpFindings.push(_totalObj)
// console.log(_cpFindings)
        callback(null, {success: true, data: _cpFindings})
      }

    })

    let result = output('dk')

    if(result) {
      return result
    }
  },
  "UBA.ComplianceCalculationIndividual.compare"(obj) {
    check(obj, {
      sourceUser: String,
      targetUser: String,
      sid: Number      
    })
    this.unblock()

    let output = Meteor.wrapAsync((args, callback) => {

      let $_in = obj.sourceUser === obj.targetUser ? [ obj.sourceUser ] : [ obj.sourceUser, obj.targetUser ]

      let uss = UsersScoreSummary.find({
        simulation_id: obj.sid,
        assessee_id: {$in: $_in}
      }, {
        fields: {          
          assessee_id: 1,
          study_drug: 1,
          rescue_med: 1,
          studyDrugSummary: 1,
          rescueMedSummary: 1
        }
      }).fetch()

      let
        _cpCC = [], 
        _sourceDict = [],
        _targetDict = []

      if(uss && uss.length >0) {

        // uss.forEach((u) => {

        //   if(u.assessee_id === obj.sourceUser) {
        //     if(u.study_drug && u.study_drug.answers) {
            
        //       u.study_drug.answers.forEach((a) => {
        //         let obj = {
        //           docName: a.document_name,
        //           docId: a.document_id,
        //           docOrder: a.document_order,
        //           source: [u_pills_taken,u_pills_prescribed,u_pills_percent],
        //           target: [],
        //           result: [],
        //           comp: []
        //         }

        //         let key = 'd'+a.document_id
        //         _sourceDict[key] = {
        //           docName: a.document_name,
        //           docId: a.document_id,
        //           docOrder: a.document_order,

        //         }
                
        //       })
              
        //     }
        //   }
        // })

        let
          sU = {},
          tU = {}

        if(obj.sourceUser === obj.targetUser) {
          sU = uss[0]
          tU = uss[0]
        } else {
          uss.forEach((u) => {
            if(u.assessee_id === obj.sourceUser) {
              sU = u
            } else {
              tU = u
            }
          })
        }

        let
          _total = 0,
          _match = 0
          _errorMatch = 0,
          _errorBoth = 0,
          _tDup5m = 0 //-- Time Overlapped within 5 minutes,
          _tDup1m = 0 //-- Time Overlapped within 1 minute

        let _cNotes = ComplianceNotes.find({
          creator:  {$in: $_in},
          simulation_id: obj.sid.toString()
        }).fetch()

        let _cNoteDict = []

        if(_cNotes && _cNotes.length > 0) {
          _cNotes.forEach((c) => {
            let _key = c.creator + c.simulation_id + '_' + c.document.document_id
            
            // console.log(c.createdAt, c.modifiedAt, new Date(c.createdAt) - new Date(c.modifiedAt), new Date(c.createdAt).getTime(), new Date(c.modifiedAt).getTime(), new Date(c.createdAt).getTime() === new Date(c.modifiedAt).getTime())

            let _mAt = c.modifiedAt
            if(Math.abs(c.createdAt-c.modifiedAt) <2) {
              _mAt = null
            }

            _cNoteDict[_key] = {
              cAt: c.createdAt,
              // mAt: new Date(c.createdAt).getTime() === new Date(c.modifiedAt).getTime() ? null : c.modifiedAt
              mAt: _mAt
            }
          })
        }
// console.log(_cNoteDict)
        let 
          suKey = sU.assessee_id + obj.sid,
          tuKey = tU.assessee_id + obj.sid,
          _suDict = [], //-- to get cAtClass only per document
          _tDupTotal = 0

        if(sU.study_drug && sU.study_drug.answers && sU.study_drug.answers.length > 0 
            && tU.study_drug && tU.study_drug.answers && tU.study_drug.answers.length > 0) {          

          sU.study_drug.answers.forEach((a, i) => {            

            let 
              _suKey = suKey + '_' + a.document_id,
              _tuKey = tuKey + '_' + a.document_id
// console.log(_suKey, _tuKey)
            let tUa = tU.study_drug.answers[i]

            let
              cAtClass = null,
              mAtClass = null

            if(!_suDict[_suKey]) {

              _suDict[_suKey] = a.document_id

              if(_cNoteDict[_suKey].mAt && _cNoteDict[_tuKey].mAt) {
                _tDupTotal += 4
              }
              else if(_cNoteDict[_suKey].mAt || _cNoteDict[_tuKey].mAt) {
                _tDupTotal += 2
              } else {
                _tDupTotal++
              }

              if(Util.diffDatesRawS(_cNoteDict[_suKey].cAt, _cNoteDict[_tuKey].cAt) <= 300 
                || (_cNoteDict[_tuKey].mAt 
                  && Util.diffDatesRawS(_cNoteDict[_suKey].cAt, _cNoteDict[_tuKey].mAt) <= 300)) {
                cAtClass = 'high-time'

                _tDup5m++

                if(Util.diffDatesRawS(_cNoteDict[_suKey].cAt, _cNoteDict[_tuKey].cAt) <= 60 
                  || (_cNoteDict[_tuKey].mAt 
                    && Util.diffDatesRawS(_cNoteDict[_suKey].cAt, _cNoteDict[_tuKey].mAt) <= 60)) {
                  cAtClass = 'highest-time'

                  _tDup1m++
                  // _tDup5m--
                }
              }

              if(Util.diffDatesRawS(_cNoteDict[_suKey].mAt, _cNoteDict[_tuKey].cAt) <= 300 
                || (_cNoteDict[_tuKey].mAt 
                  && Util.diffDatesRawS(_cNoteDict[_suKey].mAt, _cNoteDict[_tuKey].mAt) <= 300)) {
                mAtClass = 'high-time'

                if(cAtClass !== 'high-time') {
                  _tDup5m++
                }

                if(Util.diffDatesRawS(_cNoteDict[_suKey].mAt, _cNoteDict[_tuKey].cAt) <= 60 
                  || (_cNoteDict[_tuKey].mAt 
                    && Util.diffDatesRawS(_cNoteDict[_suKey].mAt, _cNoteDict[_tuKey].mAt) <= 60)) {
                  mAtClass = 'highest-time'

                  // if(mAtClass !== 'highest-time') {
                    _tDup1m++
                    // _tDup5m--
                  // }             
                }
              }
            }

            let obj = {
              docName: a.document_name,
              docId: a.document_id,
              docOrder: a.document_order,
              source: [a.u_pills_taken, a.u_pills_prescribed, a.u_pills_percent],
              target: [tUa.u_pills_taken, tUa.u_pills_prescribed, tUa.u_pills_percent],
              answer: [a.d_pills_taken, a.d_pills_prescribed, a.d_pills_percent],
              sourceResult: [a.j_pills_taken, a.j_pills_prescribed, a.j_pills_percent],
              targetResult: [tUa.j_pills_taken, tUa.j_pills_prescribed, tUa.j_pills_percent],
              comp: [a.u_pills_taken===tUa.u_pills_taken, a.u_pills_prescribed===tUa.u_pills_prescribed, a.u_pills_percent===tUa.u_pills_percent],
              suCAt: _cNoteDict[_suKey].cAt,
              suMAt: _cNoteDict[_suKey].mAt,
              tuCAt: _cNoteDict[_tuKey].cAt,
              tuMAt: _cNoteDict[_tuKey].mAt,
              cAtClass: cAtClass,
              mAtClass: mAtClass
            }

            _cpCC.push(obj)

            if(a.u_pills_taken && a.u_pills_taken === tUa.u_pills_taken) {
              _match++
              if(a.j_pills_taken === 'Incorrect') {
                _errorMatch++
              }
            }

            if(a.j_pills_taken === 'Incorrect' && tUa.j_pills_taken === 'Incorrect') {
              _errorBoth++
            }

            if(a.u_pills_prescribed && a.u_pills_prescribed===tUa.u_pills_prescribed) {
              _match++
              if(a.j_pills_prescribed === 'Incorrect') {
                _errorMatch++
              }              
            }

            if(a.j_pills_prescribed === 'Incorrect' && tUa.j_pills_prescribed === 'Incorrect') {
              _errorBoth++
            }

            if(a.u_pills_percent && a.u_pills_percent===tUa.u_pills_percent) {
              _match++
              if(a.j_pills_percent === 'Incorrect') {
                _errorMatch++
              }               
            }

            if(a.j_pills_percent === 'Incorrect' && tUa.j_pills_percent === 'Incorrect') {
              _errorBoth++
            }

          })

        _total += sU.study_drug.answers.length * sU.studyDrugSummary.length
        }

        if(sU.rescue_med && sU.rescue_med.answers && sU.rescue_med.answers.length > 0 
            && tU.rescue_med && tU.rescue_med.answers && tU.rescue_med.answers.length > 0) {          

          sU.rescue_med.answers.forEach((a, i) => {

            let 
              _suKey = suKey + '_' + a.document_id,
              _tuKey = tuKey + '_' + a.document_id            

            let tUa = tU.rescue_med.answers[i]

            let
              cAtClass = null,
              mAtClass = null

            if(!_suDict[_suKey]) {

              _suDict[_suKey] = a.document_id
              
              if(_cNoteDict[_suKey].mAt && _cNoteDict[_tuKey].mAt) {
                _tDupTotal += 4
              }
              else if(_cNoteDict[_suKey].mAt || _cNoteDict[_tuKey].mAt) {
                _tDupTotal += 2
              } else {
                _tDupTotal++
              }              

              if(Util.diffDatesRawS(_cNoteDict[_suKey].cAt, _cNoteDict[_tuKey].cAt) <= 300 
                || (_cNoteDict[_tuKey].mAt 
                  && Util.diffDatesRawS(_cNoteDict[_suKey].cAt, _cNoteDict[_tuKey].mAt) <= 300)) {
                cAtClass = 'high-time'

                _tDup5m++

                if(Util.diffDatesRawS(_cNoteDict[_suKey].cAt, _cNoteDict[_tuKey].cAt) <= 60 
                  || (_cNoteDict[_tuKey].mAt 
                    && Util.diffDatesRawS(_cNoteDict[_suKey].cAt, _cNoteDict[_tuKey].mAt) <= 60)) {
                  cAtClass = 'highest-time'

                  _tDup1m++
                  // _tDup5m--
                }
              }
  // console.log(_cNoteDict[_suKey].cAt, _cNoteDict[_tuKey].cAt, Util.diffDatesRawS(_cNoteDict[_suKey].cAt, _cNoteDict[_tuKey].cAt), cAtClass)
              if(Util.diffDatesRawS(_cNoteDict[_suKey].mAt, _cNoteDict[_tuKey].cAt) <= 300 
                || (_cNoteDict[_tuKey].mAt 
                  && Util.diffDatesRawS(_cNoteDict[_suKey].mAt, _cNoteDict[_tuKey].mAt) <= 300)) {
                mAtClass = 'high-time'

                if(cAtClass !== 'high-time') {
                  _tDup5m++
                }

                if(Util.diffDatesRawS(_cNoteDict[_suKey].mAt, _cNoteDict[_tuKey].cAt) <= 60 
                  || (_cNoteDict[_tuKey].mAt 
                    && Util.diffDatesRawS(_cNoteDict[_suKey].mAt, _cNoteDict[_tuKey].mAt) <= 60)) {
                  mAtClass = 'highest-time'

                  // if(cAtClass !== 'highest-time') {
                    _tDup1m++
                    // _tDup5m--
                  // }              
                }
              }
            }

            let obj = {
              docName: a.document_name,
              docId: a.document_id,
              docOrder: a.document_order,
              source: [a.u_pills_taken, a.u_pills_prescribed, a.u_pills_percent],
              target: [tUa.u_pills_taken, tUa.u_pills_prescribed, tUa.u_pills_percent],
              answer: [a.d_pills_taken, a.d_pills_prescribed, a.d_pills_percent],
              sourceResult: [a.j_pills_taken, a.j_pills_prescribed, a.j_pills_percent],
              targetResult: [tUa.j_pills_taken, tUa.j_pills_prescribed, tUa.j_pills_percent],
              comp: [a.u_pills_taken===tUa.u_pills_taken, a.u_pills_prescribed===tUa.u_pills_prescribed, a.u_pills_percent===tUa.u_pills_percent],
              suCAt: _cNoteDict[_suKey].cAt,
              suMAt: _cNoteDict[_suKey].mAt,
              tuCAt: _cNoteDict[_tuKey].cAt,
              tuMAt: _cNoteDict[_tuKey].mAt,
              cAtClass: cAtClass,
              mAtClass: mAtClass                          
            }
// console.log(obj)
            _cpCC.push(obj)

            if(a.u_pills_taken && a.u_pills_taken===tUa.u_pills_taken) {
              _match++
              if(a.j_pills_taken === 'Incorrect') {
                _errorMatch++
              }              
            }

            if(a.j_pills_taken === 'Incorrect' && tUa.j_pills_taken === 'Incorrect') {
              _errorBoth++
            }

            if(a.u_pills_prescribed && a.u_pills_prescribed===tUa.u_pills_prescribed) {
              _match++
              if(a.j_pills_prescribed === 'Incorrect') {
                _errorMatch++
              }              
            }

            if(a.j_pills_prescribed === 'Incorrect' && tUa.j_pills_prescribed === 'Incorrect') {
              _errorBoth++
            }

            if(a.u_pills_percent && a.u_pills_percent===tUa.u_pills_percent) {
              _match++
              if(a.j_pills_percent === 'Incorrect') {
                _errorMatch++
              }              
            }

            if(a.j_pills_percent === 'Incorrect' && tUa.j_pills_percent === 'Incorrect') {
              _errorBoth++
            }
          })

          _total += sU.rescue_med.answers.length * sU.rescueMedSummary.length
        }

        let 
          matchPercent = (_match/_total *100).toFixed(1),
          // errorMatchPercent = (_errorMatch/_match * 100).toFixed(1)
          errorMatchPercent = _errorBoth > 0 ? (_errorMatch/_errorBoth * 100).toFixed(1) : 0

        let _totalObj = {
          total: _total,
          match: _match,
          errorMatch: _errorMatch,
          matchPercent: matchPercent,
          errorMatchPercent: errorMatchPercent,
          errorBoth: _errorBoth,
          tDup5m: _tDup5m,
          tDup1m: _tDup1m,
          tDupTotal: _tDupTotal,
          tDup5mPercent: _match > 0 ? (_tDup5m/_tDupTotal *100).toFixed(1) : 0,
          tDup1mPercent: _match > 0 ? (_tDup1m/_tDupTotal *100).toFixed(1) : 0,
        }

        _cpCC.push(_totalObj)

        callback(null, {success: true, data: _cpCC})
      }

    })

    let result = output('dk')

    if(result) {
      return result
    }
  },
  "UBA.FindingsBU.compute"(obj) {
    check(obj, {
      cid: String,
      buid: String,
      sid: Number
    })
    this.unblock()

    let output = Meteor.wrapAsync((args, callback) => {

      let numFindings = Findings.find({
        simulation_id: obj.sid,
        status: 1
      }).count()

      //-- added FindingsSelected, W/o this, unidentified findings can be evaled as identified (08/23/2021)
      let        
        _findingsSelected = FindingsSelected.findOne({
          simulation_id: obj.sid,
          status: 1
        }); 

      if(_findingsSelected) {
        if(_findingsSelected.findings && _findingsSelected.findings.length > 0) {
          numFindings = _findingsSelected.findings.length;
        }
      }

      // let 
        // rawScores = UsersScoreSummary.rawCollection(),
        // aggregateQueryScores = Meteor.wrapAsync(rawScores.aggregate, rawScores);

      let pipelineScores = 
      [
        {
          $match: {
            client_id: obj.cid,
            bu_id: obj.buid,
            simulation_id: obj.sid
          }
        },
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
        {
          $project: {            
            assessee_id: "$assessee_id",
            client_id: "$client_id",
            bu_id: "$bu_id",
            simulation_id: "$simulation_id",
            // firstname: "$sus.firstname",
            lastname: "$sus.lastname",
            fullname: "$sus.fullname",
            findings: "$findingIds" ,
            country: "$sus.country"
          }
        },
        {
          $sort: {
            "fullname": 1
          }
        }
      ];

      // let _scores = aggregateQueryScores(pipelineScores)        
      let _scores = Promise.await(UsersScoreSummary.rawCollection().aggregate(pipelineScores).toArray());

      let 
        _diff = [],
        // _names = [],
        _topCases = [],
        _totalCases = 0,
        _totalScores = 0,
        _meanScore = 0        

      if(_scores && _scores.length > 0) {

        _scores.forEach((s1, i) => {
          
          // _names.push(s1.firstname)
          
          let _subDiff = [];

          _scores.forEach((s2, j) => {
            if(j < i+1) {
            // for( var j =0;j<i+1;j++) { //-- this one is slower than forEach with if(j < i+1) condition
              // let s2 = _scores[j]

              if(s1.assessee_id === s2.assessee_id) {

                _subDiff.push([s1.lastname])              
                // continue; //-- with for(...) loop
                j = 0 //-- this is critical with forEach loop
                return; //-- with forEach loop
              }              
              else {
                let 
                  sizeOfDiff = Util.findingsDiff(s1.findings, s2.findings).length,
                  sizeOfMatch = numFindings - sizeOfDiff,
                  percent = Math.round(sizeOfMatch/numFindings *100),
                  _class = ''

                if(percent >= 90) {
                  _class = 'highest'
                  
                  let _aU = [s1.assessee_id, s2.assessee_id]
                  _aU.sort()
                  let _cpKey = _aU[0] + obj.sid + _aU[1]

                  _topCases.push([s1.fullname, s2.fullname, s1.assessee_id, s2.assessee_id, percent, _class, s1.country, s2.country, _cpKey])                
                }
                else if(percent >= 80 && percent < 90) {
                  _class = 'high'

                  let _aU = [s1.assessee_id, s2.assessee_id]
                  _aU.sort()
                  let _cpKey = _aU[0] + obj.sid + _aU[1]
                  
                  _topCases.push([s1.fullname, s2.fullname, s1.assessee_id, s2.assessee_id, percent, _class, s1.country, s2.country, _cpKey])
                }
                else if(percent >= 70 && percent < 80) {
                  _class = 'mid-high'
                }
                else if(percent >= 50 && percent < 70) {
                  _class = 'medium'
                }
                else {
                  _class = 'low'
                }              

                _subDiff.push([s1.fullname, s2.fullname, s1.assessee_id, s2.assessee_id, percent, _class, s1.country, s2.country])

                _totalCases++
                _totalScores += percent
              } 
            }
          })

          _diff.push(_subDiff)
        })
      }

      if(_topCases.length > 0) {
        _topCases.sort((a, b) => {
          return b[4] - a[4]
        })
      }

      if(_totalCases > 0) {
        _meanScore = (_totalScores / _totalCases).toFixed(1)
      }

      callback(null, {success: true, data: {diff: _diff, top: _topCases, mean: _meanScore }})
    })

    let result = output('dk')

    if(result) {
      return result
    }
  },
  "UBA.CollaborationAudit.compute"(obj) {
    check(obj, {
      cid: Match.Optional(Match.OneOf(undefined, null, String)),
      buid: Match.Optional(Match.OneOf(undefined, null, String))
      // sid: Number
    });

    this.unblock()

    let _ussData = [];

    let 
      _findingsCountDict = [],
      _allSUS = [];

    let output = Meteor.wrapAsync((args, callback) => {

      // let 
      //   _findingsCountDict = [],
      //   _allSUS = [];
      // let numFindings = Findings.find({
      //   simulation_id: obj.sid,
      //   status: 1
      // }).count()

      let dateRange = 28; //-- for 4 week data only (08/23/2021)

      let $_match = { client_id: 'dummy' };

      if(obj.cid) {
        $_match['client_id'] = obj.cid;
      }
      if(obj.buid) {
        $_match['bu_id'] = obj.buid;
      }      

      let pipelineFindings = 
      [
        {
          $match: {
            status: 1
          }
        },
        {
          $group: {
            _id: "$simulation_id",
            count: { $sum: 1 }            
          }
        },
        {
          $project: {
            _id: 0,
            sid: "$_id",
            count: "$count"
          }
        },
        {
          $sort: {
            sid: 1
          }
        }
      ];

      let _findings = Promise.await(Findings.rawCollection().aggregate(pipelineFindings).toArray());

      // console.log(_findings);

      //-- added for FindingsSelected (08/23/2021)
      let
        _selectedFindingsDict = [],            
        _findingsSelected = FindingsSelected.find({           
          status: 1
        }).fetch();

      if(_findingsSelected && _findingsSelected.length > 0) {
        _findingsSelected.forEach((f) => {
          let _sKey = 's' + f.simulation_id;

          if(!_selectedFindingsDict[_sKey]) {
            _selectedFindingsDict[_sKey] = f;
          }
        })
      }      

      if(_findings && _findings.length > 0) {
        _findings.forEach((f,i) => {
          let _sKey = 's'+ f.sid;

          if(!_findingsCountDict[_sKey]) {
            // _findingsCountDict[_sKey] = f.count;
            _findingsCountDict[_sKey] = //-- added for FindingsSelected (08/23/2021)
              (_selectedFindingsDict[_sKey] && _selectedFindingsDict[_sKey].findings && _selectedFindingsDict[_sKey].findings.length) || f.count;            
          }
        });
      }

      $_match['createdAt'] = { //-- (08/23/2021)
        $gte: new Date(Date.now() - 24* dateRange *60*60 * 1000)                
      }

      let pipelineScores = 
      [
        // {
        //   $match: {
        //     client_id: obj.cid,
        //     bu_id: obj.buid,
        //     simulation_id: obj.sid
        //   }
        // },
        {
          $match: $_match
        },
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
        {
          $group: {
            _id: {
              "clientId": "$client_id",
              "buId": "$bu_id",
              "simulationId": "$simulation_id"
            },
            // sus: { $addToSet: "$sus" }
            sus: { $addToSet: {
              _id: "$sus._id",              
              userId: "$sus.userId",
              firstname: "$sus.firstname",
              lastname: "$sus.lastname",
              fullname: "$sus.fullname",
              clientName: "$sus.clientName",
              buName: "$sus.buName",
              simulationName: "$sus.simulationName",
              country: "$sus.country",
              findings: "$findingIds",
              domainSummary: "$domainSummary",
              subAt: "$sus.submittedAt",
              pubAt: "$sus.publishedAt",
              asmtId: "$sus.assessmentId"
            } }
          }
        },
        {
          $project: {            
            // assessee_id: "$assessee_id",
            client_id: "$_id.clientId",
            bu_id: "$_id.buId",
            simulation_id: "$_id.simulationId",
            sus: "$sus"
          }
        },
        {
          $sort: {
            "createdAt": -1,
            "sus.publishedAt": -1
          }
        },
        {
          $limit: 10
        }

      ];

      // let _scores = aggregateQueryScores(pipelineScores)        
      _ussData = Promise.await(UsersScoreSummary.rawCollection().aggregate(pipelineScores).toArray());    

      callback(null, {success: true, data: _ussData })

    });

    let _uss = output('dk').data;

    let 
      _diff = [],
      // _names = [],
      _allCases = [],
      _topCases = [],        
      _totalCases = 0,
      _totalScores = 0,
      _meanScore = 0;

    let _totalCount = 0; 

    if(_uss && _uss.length > 0) {

      // let bulk = CollaborationAudit.rawCollection().initializeUnorderedBulkOp();

      _uss.forEach((s,k) => {

        if(s.sus && s.sus.length > 0) {    

          let             
            _cid = s.client_id,
            _buid = s.bu_id,
            _sid = s.simulation_id,
            _sKey = 's' + _sid,
            _sus = s.sus, //-- sim_users_summary data
            numFindings = _findingsCountDict[_sKey];        

          let 
            _susObj = _sus[0],
            _cName = _susObj.clientName,
            _bName = _susObj.buName,
            _sName = _susObj.simulationName;            

          _sus.forEach((s1, i) => {

            let       
              _s1PubAt = s1.pubAt,
              _s1Date = new Date(_s1PubAt),
              _s1Time = _s1Date.getTime();

            SimUsersSummary.update(s1._id, {
              $set: {
                collAudit: true
              }
            });

            UsersScoreSummary.update({
              assessment_id: s1.asmtId
            }, {
              $set: {
                collAudit: true
              }
            });              

            _sus.forEach((s2, j) => {
              if(j < i+1) { //-- to compare s1-s2 pair only once, otherwise, there'll be s2-s1 pair

                if(s1.userId !== s2.userId) {

                  let 
                    sizeOfDiff = Util.findingsDiff(s1.findings, s2.findings).length,
                    sizeOfMatch = numFindings - sizeOfDiff,
                    percent = Math.round(sizeOfMatch/numFindings *100),
                    _class = '';

                  // if(percent >= 80) {

                    let      
                      _s2PubAt = s2.pubAt,                 
                      _s2Date = new Date(_s2PubAt),
                      _s2Time = _s2Date.getTime();

                    let 
                      _isS1First = _s2Time > _s1Time, //-- check if s1's results got published first
                      _compTime = _isS1First ? _s2Time : _s1Time,
                      _compDate = _isS1First ? _s2PubAt : _s1PubAt; //-- whoever's date that comes later becomes comparision date 

                    if(percent >= 90) {
                      _class = 'highest'

                      if(s1.country !== s2.country) {
                        _class = "highest-dark"
                      }
                    }
                    else if(percent >= 80 && percent < 90) {
                      _class = 'high'
                    }
                    else if(percent >= 70 && percent < 80) {
                      _class = 'mid-high'
                    }
                    else if(percent >= 50 && percent < 70) {
                      _class = 'medium'
                    }
                    else {
                      _class = 'low'
                      // _class = 'high'
                    }

                    // _allCases.push([_compDate, _compTime, _cName, _bName, _sName, _cid, _buid, _sid, s1.fullname, s2.fullname, s1.userId, s2.userId, s1.subAt, s2.subAt, percent, _class, s1.country, s2.country ])

                    let _collabAuditObject = {
                      compDate: _compDate,
                      compTime: _compTime,
                      cName: _cName,
                      buName: _bName,
                      simName: _sName,
                      cid: _cid,
                      buid: _buid,
                      sid: _sid,
                      u1Id: s1.userId,
                      u2Id: s2.userId,
                      u1SubAt: s1.subAt,
                      u2SubAt: s2.subAt,
                      u1Country: s1.country,
                      u2Country: s2.country,
                      u1fname: s1.firstname,
                      u1lname: s1.lastname,
                      u2fname: s2.firstname,
                      u2lname: s2.lastname,                        
                      percent: percent,
                      class: _class,
                      status: 1,
                      cAt: new Date
                    }


                    let $_setOnInsert = {
                      // _id: new Mongo.ObjectID()._str,
                      cid: _cid,
                      buid: _buid,
                      sid: _sid,
                      u1Id: s1.userId,
                      u2Id: s2.userId,
                      cAt: new Date
                    }

                    let $_set = {
                      compDate: _compDate,
                      compTime: _compTime,
                      cName: _cName,
                      buName: _bName,
                      simName: _sName,
                      u1SubAt: s1.subAt,
                      u2SubAt: s2.subAt,
                      u1Country: s1.country,
                      u2Country: s2.country,
                      u1fname: s1.firstname,
                      u1lname: s1.lastname,
                      u2fname: s2.firstname,
                      u2lname: s2.lastname,                         
                      percent: percent,
                      class: _class,
                      status: 1,
                      mAt: new Date
                    }
                    
                    _allCases.push(_collabAuditObject);

                    // bulk.insert(_collabAuditObject);                    
                    // bulk.find({
                    //   cid: _cid,
                    //   buid: _buid,
                    //   sid: _sid,
                    //   u1Id: s1.userId,
                    //   u2Id: s2.userId                        
                    // }).upsert().replaceOne(_collabAuditObject);
                    // bulk.find({
                    //   cid: _cid,
                    //   buid: _buid,
                    //   sid: _sid,
                    //   u1Id: s1.userId,
                    //   u2Id: s2.userId
                    // // }).upsert().replaceOne(_collabAuditObject);
                    // // }).upsert().updateOne({
                    // }).upsert().update({  
                    //   $setOnInsert: $_setOnInsert,
                    //   $set: $_set                        
                    // });

                    _totalCases++;

                  // } //-- if(percent >= 80) {
                }
              } //-- if(j < i+1) {
            }) //-- _sus.forEach((s2, j) => {

            // bulk.execute();              
          })
        }
      }); //-- _uss.forEach((s,i) => {

      // bulk.execute();

      if(_allCases.length > 0) {
        // let bulk = CollaborationAudit.rawCollection().initializeUnorderedBulkOp();
        // _allCases.forEach((s) => {
        //   bulk.insert(s).batchSize;
        // })
        // bulk.execute();
        CollaborationAudit.batchInsert(_allCases);
      }

    } //-- if(_uss && _uss.length > 20) {

    // })

    // let result = output('dk')
    let result = { data: _ussData };

    if(result) {
      return result
    }
  },
  "UBA.CollaborationAudit.ETL.update.all"(obj) {
    check(obj, {
      userId: Match.Optional(Match.OneOf(undefined, null, String))
    });

    this.unblock()

    let _dateRange = 31;
    // let _dateRange = 62;
    // let _dateRange = 93;

    let _oldKeys = [];

    let _$match = {};

    _$match['createdAt'] = {
      $gte: new Date(Date.now() - 24* _dateRange *60*60 * 1000)
    };

    let _buId = null;

    if(obj.userId) {
      let _sus = SimUsersSummary.find({
        userId: obj.userId
      }).fetch();
  
      if(_sus.length > 0) {
  
        let 
          _sDates = [],
          _eDates = [];
  
        _sus.forEach((s) => {
          _sDates.push(s.oStartedAt || s.startedAt || s.createdAt);
          _eDates.push(s.submittedAt || s.oSubmittedAt || s.lastLogin);
        });
  
        _sDates.sort((a,b) => {
          return new Date(a) - new Date(b);
        });
        _eDates.sort((a,b) => {
          return new Date(b) - new Date(a);
        });  
        
        _buId = s.buId;
      }
      
      _$match['createdAt'] = {
        $gte: new Date(_sDates[0]),
        $lt: new Date(__eDates[0])
      };
      
      _$match['buId'] = _buId;
    }

    let output = Meteor.wrapAsync((args, callback) => {

      // let 
      //   rawScoresLatest = UsersScoreSummary.rawCollection(),
      //   aggregateQueryScoresLatest = Meteor.wrapAsync(rawScoresLatest.aggregate, rawScoresLatest);
      // let _oldData = CollaborationAudit.find({
      //   compDate: { $exists: true},
      //   reviewed: true
      // }).fetch();

      // if(_oldData && _oldData.length > 0) {
      //   _oldData.forEach((od) => {
      //     let 
      //       _oldKey1 = od.sid+od.u1Id+od.u2Id,
      //       _oldKey2 = od.sid+od.u2Id+od.u1Id;
            
      //     if(!_oldKeys.includes(_oldKey1) && !_oldKeys.includes(_oldKey2) ) {
      //       _oldKeys.push(_oldKey1);
      //       _oldKeys.push(_oldKey2);
      //     }
      //   })
      // }

      let pipelineScoresLatest = 
      [
        {
          $match: _$match
        },
        {
            $group: {
                "_id": {
                    simulationId: "$simulation_id"                        
                }
            }
        },
        {
            $project: {
                _id: 0,
                simulation_id: "$_id.simulationId"
            }
        }
      ];

      // let _scoresLatest = aggregateQueryScoresLatest(pipelineScoresLatest)
      let _scoresLatest = Promise.await(UsersScoreSummary.rawCollection().aggregate(pipelineScoresLatest).toArray());

      let _allResults = []     

      if(_scoresLatest && _scoresLatest.length > 0) {
                  
            _scoresLatest.forEach((s) => {
                s.dateRange = _dateRange
                let results = findingsMatchScore(s);

                let obj = {
                    diff: results.diff,
                    simulation: results.simName
                }
                _allResults.push(obj)
            })
            callback(null, {success: true, data: _allResults})
        }
    })

    let result = output('dk')

    if(result) {

      if(result && result.data && result.data.length > 0) {
        let _data = result.data;

        
        _data.forEach((s) => {

          let _diff = s.diff;

          if(_diff && _diff.length > 0) {

            let _bulkUpsert = CollaborationAudit.rawCollection().initializeUnorderedBulkOp();

            _diff.forEach((df,i) => {
              if(df.length > 1) {
                df.forEach((d,i) => {
                  if(d.length > 1) {

                    //-- d = [0:obj.simulation_id, 1:s1.assessee_id, 2:s2.assessee_id, 3:s1.fullname, 4:s2.fullname, 5:percent, 6:_class, 7:s1.country, 8:s2.country, 9:s1.sAt, 10:s2.sAt, 
                    //--      11:s1.client_id, 12:s1.bu_id, 13:s1.cName, 14:s1.buName, 15:s1.sName, 16:s1.fname, 17:s1.lname, 18:s2.fname, 19:s2.lname]);
                    let 
                      _key1 = d[0]+d[1]+d[2], //-- 0: sim id, 1: u1 id, 2: u2 id
                      _key2 = d[0]+d[2]+d[1];
  
                    let
                      _key = _key1,
                      sid = parseInt(d[0]),
                      u1id = d[1],
                      u2id = d[2],                    
                      u1name = d[3],
                      u2name = d[4],
                      _percent = d[5],
                      _class = d[6],
                      u1country = d[7],
                      u2country = d[8],
                      u1sAt = d[9],
                      u2sAt = d[10],
                      cid = d[11],
                      buid = d[12],
                      cName = d[13],
                      buName = d[14],                    
                      sName = d[15],
                      u1fname = d[16],
                      u1lname = d[17],
                      u2fname = d[18],
                      u2lname = d[19];                   
                    
                  // console.log(d);

                    _$set = {                                     
                      cName: cName,
                      buName: buName, 
                      simName: sName,
                      u1Name: u1name,
                      u2Name: u2name,
                      u1fname: u1fname,
                      u1lname: u1lname,
                      u2fname: u2fname,
                      u2lname: u2lname,
                      u1Country: u1country,
                      u2Country: u2country,
                      u1SubAt: u1sAt,
                      u2SubAt: u2sAt,                      
                      percent: _percent,
                      class: _class,
                      status: 1,

                      key: _key,
                      cid: cid,
                      buid: buid,                      
                      sid: sid,
                      u1Id: u1id,
                      u2Id: u2id,
                      cAt: new Date                    
                    } 
                  
                    if(_percent < 80) {
                      _$set['status'] = 2;
                    }
                    // if(_oldKeys.includes(_key1) || _oldKeys.includes(_key2)) {
                    //   _$set['reviewed'] = true;
                    // }
  
                    let _numCA = CollaborationAudit.find({
                      $or: [
                        { key: _key1 },
                        { key: _key2 }
                      ],
                      // compDate: { $exists: false }                    
                    },{
                      limit: 1
                    }).count();

                    // CollaborationAudit.update({
                    //   $or: [
                    //     { key: _key1 },
                    //     { key: _key2 }
                    //   ],
                    //   compDate: { $exists: false }
                    // },{
                    //   $setOnInsert: {
                    //     key: _key,
                    //     cid: cid,
                    //     buid: buid,                      
                    //     sid: sid,
                    //     u1Id: u1id,
                    //     u2Id: u2id,
                    //     cAt: new Date
                    //   },
                    //   $set: _$set 
                    // },{
                    //   upsert: true
                    // });

                    if(_numCA > 0) {
                      _bulkUpsert.find({
                        $or: [
                          { key: _key1 },
                          { key: _key2 }
                        ],
                        // compDate: { $exists: false }
                      }).updateOne({
                        $set: _$set
                      });             
                    } else {
                      if(_percent >= 80) {
                        _bulkUpsert.insert(_$set);
                      }
                    }     

                  }
                })
              }

            }) //-- _diff.forEach((df,i) => {

            _bulkUpsert.execute();

          } //-- if(_diff && _diff.length > 0) {

        })

      }
      return result
    }
  } 
});

function termFreqMap(str) {
  var words = str.split(' ');
  var termFreq = {};
  words.forEach(function(w) {
    termFreq[w] = (termFreq[w] || 0) + 1;
  });
  return termFreq;
}

function addKeysToDict(map, dict) {
  for (var key in map) {
    dict[key] = true;
  }
}

function termFreqMapToVector(map, dict) {
  var termFreqVector = [];
  for (var term in dict) {
    termFreqVector.push(map[term] || 0);
  }
  return termFreqVector;
}

function vecDotProduct(vecA, vecB) {
  var product = 0;
  for (var i = 0; i < vecA.length; i++) {
    product += vecA[i] * vecB[i];
  }
  return product;
}

function vecMagnitude(vec) {
  var sum = 0;
  for (var i = 0; i < vec.length; i++) {
    sum += vec[i] * vec[i];
  }
  return Math.sqrt(sum);
}

function cosineSimilarity(vecA, vecB) {
  return vecDotProduct(vecA, vecB) / (vecMagnitude(vecA) * vecMagnitude(vecB));
}

function textCosineSimilarity(strA, strB) {
  // var termFreqA = termFreqMap(strA);
  // var termFreqB = termFreqMap(strB);  
  var termFreqA = termFreqMap(strA.toLowerCase());
  var termFreqB = termFreqMap(strB.toLowerCase());

  var dict = {};
  addKeysToDict(termFreqA, dict);
  addKeysToDict(termFreqB, dict);

  var termFreqVecA = termFreqMapToVector(termFreqA, dict);
  var termFreqVecB = termFreqMapToVector(termFreqB, dict);

  return cosineSimilarity(termFreqVecA, termFreqVecB);
}


function findingsMatchScore(obj) {
  // console.log(obj)
      let numFindings = Findings.find({
          simulation_id: parseInt(obj.simulation_id),
          status: 1
      }).count()
  
      //-- added FindingsSelected, W/o this, unidentified findings can be evaled as identified (08/23/2021)
      let        
          _findingsSelected = FindingsSelected.findOne({
              simulation_id: parseInt(obj.simulation_id),
              status: 1
          }); 
  
      if(_findingsSelected) {
          if(_findingsSelected.findings && _findingsSelected.findings.length > 0) {
              numFindings = _findingsSelected.findings.length;
          }
      }
  
      let dateRange = obj.dateRange || 7;
  
      // let 
      //     rawScores = UsersScoreSummary.rawCollection(),
      //     aggregateQueryScores = Meteor.wrapAsync(rawScores.aggregate, rawScores);
  
      let pipelineScores = 
      [
      {
        $match: {
          // client_id: obj.client_id,
          // bu_id: obj.bu_id,
          simulation_id: parseInt(obj.simulation_id),
          createdAt: {
              // $lte: new Date(), 
              // $gte: new Date(new Date().setDate(new Date().getDate()-3))
              $gte: new Date(Date.now() - 24* dateRange *60*60 * 1000)
              // $gte: new Date(Date.now() - 24*21*60*60 * 1000)
          }
        }
      },
      {
        $lookup: {
          from: "sim_users_summary",
          localField: "assessment_id",
          foreignField: "assessmentId",
          as: "sus"          
        }
      },
      // {
      //     $lookup: {
      //         from: 'sim_users_summary',
      //         // localField: "assessment_id",
      //         // foreignField: "assessmentId",
      //         let: {
      //             asmtId: "$assessment_id"
      //         },
      //         pipeline: [
      //             {
      //                 $match: {                        
      //                     $expr: {
      //                         $and: [
      //                             { $eq: ["$assessmentId", "$$asmtId"] },
      //                             {$or: [                                
      //                                 { $eq: ["$resultStage", "Published"] },
      //                                  { $eq: ["$resultStage", "Exported"] },
      //                                 { $eq: ["$resultStage", "Distributed"] }
      //                             ]}                                
      //                         ],
      //                     }
      //                 }
      //             },
      //             // {}
      //             // { $project: { id: 0, _id: 0 } }
      //         ],
      //         as: 'sus'
      //     }
      // },
      {
        $unwind: "$sus"
      },
      {
        $project: {            
          assessee_id: "$assessee_id",
          client_id: "$client_id",
          bu_id: "$bu_id",
          simulation_id: "$simulation_id",
          fname: "$sus.firstname",
          lname: "$sus.lastname",
          fullname: "$sus.fullname",
          sName: "$sus.simulationName",
          country: "$sus.country",
          findings: "$findingIds",
          domainSummary: "$domainSummary",
          sAt: "$sus.submittedAt",
          rS: "$sus.resultStage",
          cName: "$sus.clientName",            
          buName: "$sus.buName"            
        }
      },
      {
          $sort: {
              fullname: 1
          }
      }
      ];
  
      // let _scores = aggregateQueryScores(pipelineScores, { cursor: {}})     
      let _scores = Promise.await(UsersScoreSummary.rawCollection().aggregate(pipelineScores).toArray());
  
      // console.log(_scores)
  
      let 
          _diff = [],
          _names = [],
          _simName = '';
          
      // let _diff2 = [];
  
      if(_scores && _scores.length > 0) {
      
          _simName = _scores[0].simulationName
  
          _scores.forEach((s1, i) => {
        
            // _names.push(s1.firstname)
            
              let _subDiff = []
  
              _scores.forEach((s2, j) => {
                  if(j < i+1) {
                  // for( var j =0;j<i+1;j++) { //-- this one is slower than forEach with if(j < i+1) condition
                    // let s2 = _scores[j]
          
                    // console.log(s1.assesse_id, s2.assesse_id);

                    if(s1.assessee_id === s2.assessee_id) {
  
                      _subDiff.push([s1.fullname])              
                      // continue; //-- with for(...) loop
                      j = 0 //-- this is critical with forEach loop
                      return; //-- with forEach loop
                    }
                    else {
  
                      // if(s2.assesse_id === 'C7yxJXe76YCfwDLXG') {
                      //   console.log(s1, s2);
                      // }                      
                      // if(s1.assessee_id === 'oTt7ipRntaqxcDyAL' && s2.assessee_id === 'C7yxJXe76YCfwDLXG') {
                      //   console.log(s1, s2);
                      // }

                      if((s1.rS === 'Published' || s1.rS === 'Exported' || s1.rS === 'Distributed') && 
                        (s2.rS === 'Published' || s2.rS === 'Exported' || s2.rS === 'Distributed') && 
                        s1.bu_id === s2.bu_id) {

                        let 
                          _ufFindingsS1 = [],
                          _ufFindingsS2 = [];
    
                        s1.domainSummary.forEach((d) => {
                          if(d.idfs) {
                            _ufFindingsS1 = _ufFindingsS1.concat(d.idfs);
                          }
                        })
        
                        _ufFindingsS1 = [...new Set(_ufFindingsS1)];
    
                        s2.domainSummary.forEach((d) => {
                          if(d.idfs) {
                            _ufFindingsS2 = _ufFindingsS2.concat(d.idfs);
                          }
                        })
        
                        _ufFindingsS2 = [...new Set(_ufFindingsS2)];
    
                        let 
                        //   sizeOfDiff = Util.findingsDiff(s1.findings, s2.findings).length,
                          sizeOfDiff = Util.findingsDiff(_ufFindingsS1, _ufFindingsS2).length,
                          sizeOfMatch = numFindings - sizeOfDiff,
                          percent = Math.round(sizeOfMatch/numFindings *100),
                          _class = '';
    // if(percent === -11) {
    //     console.log(s1, s2);
    // }
                        if(percent >= 90) {
                          _class = 'highest'
                          if(s1.country !== s2.country) {
                            _class = "highest-dark"
                          }
                        }
                        else if(percent >= 80 && percent < 90) {
                          _class = 'high'
                        }
                        // else if(percent >= 70 && percent < 80) {
                        //   _class = 'mid-high'
                        // }
                        // else if(percent >= 50 && percent < 70) {
                        //   _class = 'medium'
                        // }
                        // else {
                        //   _class = 'low'
                        // }              
    
                        // if(s1.assessee_id === 'oTt7ipRntaqxcDyAL' && s2.assessee_id === 'C7yxJXe76YCfwDLXG') {
                        //   console.log(s1, s2, percent);
                        // }

                        if(percent >= 80) {
                          _subDiff.push([obj.simulation_id, s1.assessee_id, s2.assessee_id, s1.fullname, s2.fullname, percent, _class, s1.country, s2.country, s1.sAt, s2.sAt,s1.client_id,s1.bu_id,s1.cName,s1.buName,s1.sName,s1.fname,s1.lname,s2.fname,s2.lname]);
                        } else {

                          let _numCA = CollaborationAudit.find({
                            status: 1,
                            $or: [
                              { u1Id: s1.assessee_id, u2Id: s2.assessee_id},
                              { u1Id: s2.assessee_id, u2Id: s1.assessee_id}
                            ]                                             
                          },{
                            limit: 1
                          }).count();
                          
                          if(_numCA > 0) {
                            _subDiff.push([obj.simulation_id, s1.assessee_id, s2.assessee_id, s1.fullname, s2.fullname, percent, _class, s1.country, s2.country, s1.sAt, s2.sAt,s1.client_id,s1.bu_id,s1.cName,s1.buName,s1.sName,s1.fname,s1.lname,s2.fname,s2.lname]);
                          }
                          // if(s1.assessee_id === 'oTt7ipRntaqxcDyAL' && s2.assessee_id === 'C7yxJXe76YCfwDLXG') {
                          //   console.log(s1, s2, percent);
                          // }

                          // CollaborationAudit.update({
                          //   $or: [
                          //     { u1Id: s1.assessee_id, u2Id: s2.assessee_id},
                          //     { u1Id: s2.assessee_id, u2Id: s1.assessee_id}
                          //   ]
                          // },{
                          //   $set: {
                          //     percent: percent,
                          //     status: 2
                          //   }
                          // })
                        }

                      } 

                    } //-- if(s1.assessee_id === s2.assessee_id) {} else {

                  }
              })
  
              _diff.push(_subDiff)
          })    
      }
  // console.log(_simName, _diff)
      return {simName: _simName, diff: _diff}
  
  }

