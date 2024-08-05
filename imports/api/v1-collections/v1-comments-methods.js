import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Promise } from 'meteor/promise'

var moment = require('moment');

import { Util } from '/imports/lib/server/util.js'

import { Documents } from '/imports/api/documents/documents.js'

import { V1UsersRaw, V1AssessmentsRaw, V1ScoringsRaw, V1DocumentsRaw, V1CommentsRaw } from './v1-raw-collections.js';
import { V1AssessmentsTemp , V1ScoringsTemp, V1V2FindingsMap, V1V2DocumentsMap, 
          V1SimUsersSummaryTemp, V1UsersScoreSummaryTemp, V1MonitoringNotesTemp,
          V1ComplianceNotesTemp } from './v12-temp-collections.js';

Meteor.methods({
  "ETL.V1CommentsRaw.V1UsersScoreSummary.addMonitoringNotes"() {
    // this.unblock();

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
        // rawComments = V1CommentsRaw.rawCollection(),
        // aggregateQueryComments = Meteor.wrapAsync(rawComments.aggregate, rawComments);

      let pipelineComments = 
      [
        {
          $match: {
            // user_id: 2923,
            // assessment_category_id: 35
            assessment_category_id: 36
          }
        },       
        {
          $lookup: {
            from: 'v1_documents_raw',
            localField: 'document_id',
            foreignField: 'id',
            as: 'v1_documents'
          }
        },
        // {
        //   $unwind: "$v1_documents"
        // },
        {
          $unwind: {
            path: '$v1_documents',
            preserveNullAndEmptyArrays: true
          }          
        },        
        {
          $lookup: {
            from: 'v1_v2_documents_map',
            localField: 'document_id',
            foreignField: 'v1_document_id',
            as: 'v1V2DocMap'
          }
        },
        // {
        //   $unwind: "$v2_documents"
        // },
        {
          $unwind: {
            path: '$v1V2DocMap',
            preserveNullAndEmptyArrays: true
          }          
        },
        {
          $lookup: {
            from: 'documents',
            localField: 'v1V2DocMap.v2_document_id',
            foreignField: 'id',
            as: 'v2_documents'
          }
        },
        {
          $unwind: {
            path: '$v2_documents',
            preserveNullAndEmptyArrays: true
          }          
        },
        {
          $lookup: {
            from: 'document_folders',
            localField: 'v2_documents.folder_id',
            foreignField: 'id',
            as: 'v2_document_folders'
          }
        },
        // {
        //   $unwind: "$v2_document_folders"
        // },
        {
          $unwind: {
            path: '$v2_document_folders',
            preserveNullAndEmptyArrays: true
          }          
        },        
        {
          $lookup: {
            from: 'document_files',
            localField: 'v2_documents.id',
            foreignField: 'document_id',
            as: 'v2_document_files'
          }
        },
        {
          $unwind: {
            path: '$v2_document_files',
            preserveNullAndEmptyArrays: true
          }          
        },
        {
          $group: {
            _id: "$_id",
            documentId: { $first: "$document_id" },
            userId: { $first: "$user_id" },
            asmtCatId: { $first: "$assessment_category_id" },
            modId: { $first: "$module_id" },
            isCompliance: { $first: "$is_compliance" },
            pillsTaken: { $first: "$pills_taken" },
            pillsGiven: { $first: "$pills_given" },
            percentCompliance: { $first: "$percent_compliance" },
            comment: { $first: "$comment" },
            v1Document: { $first: "$v1_documents" },
            v2Document: { $first: "$v2_documents" },
            v2DocumentFolder: { $first: "$v2_document_folders" },
            v2DocumentFile: { $first: "$v2_document_files" },
            created: { $first: "$created" },
            modified: { $first: "$modified" }           
          }
        },
        {
          $project: {
            documentId: "$documentId",
            userId: "$userId",
            asmtCatId: "$asmtCatId",
            modId: "$modId",
            isCompliance: "$isCompliance",
            pillsTaken: "$pillsTaken",
            pillsGiven: "$pillsGiven",
            percentCompliance: "$percentCompliance",
            comment: "$comment",
            v1Document: "$v1Document",
            v2Document: "$v2Document",
            v2DocumentFolder: "$v2DocumentFolder",
            v2DocumentFile: "$v2DocumentFile",
            created: "$created",
            modified: "$modified"
          }
        },        
        // {
        //   $project: {
        //     documentId: "$document_id",
        //     userId: "$user_id",
        //     asmtCatId: "$assessment_category_id",
        //     modId: "$module_id",
        //     isCompliance: "$is_compliance",
        //     pillsTaken: "$pills_taken",
        //     pillsGiven: "$pills_given",
        //     percentCompliance: "$percent_compliance",
        //     comment: "$comment",
        //     v1Document: "$v1_documents",
        //     v2Document: "$v2_documents",
        //     v2DocumentFolder: "$v2_document_folders",
        //     v2DocumentFile: "$v2_document_files",
        //     created: "$created",
        //     modified: "$modified"
        //   }
        // },
        {
          $sort: {
            "v2_documents.document_order": 1
          }
        }
      ];

      let
        // _comments = aggregateQueryComments(pipelineComments),
        _comments = Promise.await(V1CommentsRaw.rawCollection().aggregate(pipelineComments, {
          allowDiskUse:true //-- needed this to avoid memory issue: Exceeded memory limit for $group, but didn't allow external sort. Pass allowDiskUse:true to opt in. 
        }).toArray()),
        _commentsDict = [],
        _dataToReturn = [],
        _noteKey = 0;

      if(_comments && _comments.length > 0) {
        _comments.forEach((c) => {
        
          let 
            _key = c.userId + '-' + c.asmtCatId,
            _asmt = _allAssessmentsDict[_key];

          if(_asmt) {

            if(!_commentsDict[_key]) {

              _noteKey = 0;

              _commentsDict[_key] = {
                // userId: c.userId,
                // asmtCatId: c.asmtCatId,
                study_drug: {
                  answers: [],
                  summary: {
                    pills_taken: {
                      correct: 0,
                      incorrect: 0,
                      total: 0,
                      percent_correct: 0
                    },
                    pills_prescribed: {
                      correct: 0,
                      incorrect: 0,
                      total: 0,
                      percent_correct: 0
                    },
                    percent_compliance: {
                      correct: 0,
                      incorrect: 0,
                      total: 0,
                      percent_correct: 0              
                    }
                  }
                },
                rescue_med: {
                  answers: [],
                  summary: {
                    pills_taken: {
                      correct: 0,
                      incorrect: 0,
                      total: 0,
                      percent_correct: 0
                    }            
                  }
                },
                studyDrugSummary: [
                  {
                    name: 'pills_taken',
                    percentCorrect: 0
                  }, {
                    name: 'pills_prescribed',
                    percentCorrect: 0
                  }, {
                    name: 'percent_compliance',
                    percentCorrect: 0                
                  }
                ],
                rescueMedSummary: [{
                  name: 'pills_taken',
                  percentCorrect: 0                
                }],
                v1: true,
                cAt: new Date,
                monitoring_notes: {
                  num_notes: 0,
                  notes: []
                },
                hasComplianceCalculation: false,
                hasComplianceCalculationScore: false              
              };

            } //-- if(!_commentsDict[_key]) {

            let
              _v1Doc = c.v1Document,
              _v2Doc = c.v2Document,         
              _v2DocFolder = c.v2DocumentFolder,
              _v2DocFile = c.v2DocumentFile;
  // console.log(_v2DocFile)
            let _noteObj = {              
              creator: _asmt.assessee_id,
              client_id: _asmt.client_id,
              bu_id: _asmt.bu_id,
              simulation_id: _asmt.simulation_id,            
              document: {
                v1_document_id: _v1Doc.id,
                folder_id: _v2DocFolder && _v2DocFolder.id,
                folder_name: _v2DocFolder && _v2DocFolder.name,
                folder_order: _v2DocFolder && _v2DocFolder.folder_order,
                document_id: _v2Doc && _v2Doc.id,
                document_name: _v2Doc && _v2Doc.name || _v1Doc.name,
                // document_file: _v2DocFile.name,
                document_order: _v2Doc && _v2Doc.document_orde || _v1Doc.document_order
              },            
              viewport: c.viewport === 'l' ? 1 : 2,
              status: 1,
              createdAt: new Date(c.created),
              modifiedAt: new Date(c.modified),            
              v1: true
            };

            if(c.isCompliance === 1) { //-- if the cooments are compliance calculation notes
              // _dataToReturn.push(c);
              
              // let
              //   _v1Doc = c.v1Document,
              //   _v2Doc = c.v2Document,
              //   _studyObj = {},
              //   _rescueObj = {};

              _noteKey = 0;

              _commentsDict[_key]['hasComplianceCalculation'] = true;
              
              if(_v1Doc.medication_type === 1) { //-- Rescue
                let _rescueAnswerObj = {
                  medication_type: 2,
                  document_name: _v2Doc.name,
                  document_id: _v2Doc.id,
                  document_order: _v2Doc.document_order,
                  u_pills_taken: c.pillsTaken,
                  d_pills_taken: _v1Doc.taken,
                  j_pills_taken: c.pillsTaken === _v1Doc.taken ? 'Correct' : 'Incorrect'
                };

                // _dataToReturn.push(_rescueAnswerObj);
                // _rescue_med['answers'].push(_rescueAnswerObj);
                _commentsDict[_key]['rescue_med'].answers.push(_rescueAnswerObj);

                if(_rescueAnswerObj.j_pills_taken === 'Correct') {
                  _commentsDict[_key]['rescue_med'].summary.pills_taken.correct += 1;
                } 
                else if(_rescueAnswerObj.j_pills_taken === 'Incorrect') {
                  _commentsDict[_key]['rescue_med'].summary.pills_taken.incorrect += 1;
                }

                _commentsDict[_key]['rescue_med'].summary.pills_taken.total += 1;

                let _rescuePercentCorrect 
                  = Math.round(_commentsDict[_key]['rescue_med'].summary.pills_taken.correct 
                    / _commentsDict[_key]['rescue_med'].summary.pills_taken.total * 100)

                _commentsDict[_key]['rescue_med'].summary.pills_taken.percent_correct = _rescuePercentCorrect;

                _commentsDict[_key]['rescueMedSummary'][0].percentCorrect = _rescuePercentCorrect;

                //-- Rescue compliance note              
                _noteObj['medication_type'] = 2;              
                _noteObj['pills_taken'] = c.pillsTaken;
                _noteObj['pills_prescribed'] = '';
                _noteObj['pills_percent'] = '';              
                _noteObj['document'].has_pills = 1;
                _noteObj['document'].medication_type = 2;
                _noteObj['document'].pills = _v2Doc.pills;
                _noteObj['document'].pills_taken = _v2Doc.pills_taken;
                _noteObj['document'].pills_prescribed = _v2Doc.pills_prescribed;

                if(c.pillsTaken >= 0) {
                  _commentsDict[_key]['hasComplianceCalculationScore'] = true;
                }

              } else { //-- Study

                let
                  _uTaken = c.pillsTaken,
                  _uGiven = c.pillsGiven,
                  _uPercent = c.percentCompliance,
                  _dTaken = _v1Doc.taken,
                  _dGiven = _v1Doc.prescribed,
                  _dPercent = Math.round(_dTaken / _dGiven * 100),
                  _jTaken = _uTaken === _dTaken ? 'Correct' : 'Incorrect',
                  _jGiven = _uGiven === _dGiven ? 'Correct' : 'Incorrect',
                  _jPercent = ((_dPercent >= _uPercent-1) &&  (_dPercent <= _uPercent+1)) ? 'Correct' : 'Incorrect';

                let _studyAnswerObj = {
                  medication_type: 1,
                  document_name: _v2Doc.name,
                  document_id: _v2Doc.id,
                  document_order: _v2Doc.document_order,
                  u_pills_taken: _uTaken,
                  u_pills_prescribed: _uGiven,
                  u_pills_percent: _uPercent,
                  d_pills_taken: _dTaken,
                  d_pills_prescribed: _dGiven,
                  d_pills_percent: _dPercent,
                  j_pills_taken: _jTaken,
                  j_pills_prescribed: _jGiven,
                  j_pills_percent: _jPercent
                };

                // _dataToReturn.push(_studyAnswerObj);
                // _study_drug['answers'].push(_studyAnswerObj);
                _commentsDict[_key]['study_drug'].answers.push(_studyAnswerObj);

                if(_studyAnswerObj.j_pills_taken === 'Correct') {
                  _commentsDict[_key]['study_drug'].summary.pills_taken.correct += 1;
                } 
                else if(_studyAnswerObj.j_pills_taken === 'Incorrect') {
                  _commentsDict[_key]['study_drug'].summary.pills_taken.incorrect += 1;
                }

                if(_studyAnswerObj.j_pills_prescribed === 'Correct') {
                  _commentsDict[_key]['study_drug'].summary.pills_prescribed.correct += 1;
                } 
                else if(_studyAnswerObj.j_pills_prescribed === 'Incorrect') {
                  _commentsDict[_key]['study_drug'].summary.pills_prescribed.incorrect += 1;
                }

                if(_studyAnswerObj.j_pills_percent === 'Correct') {
                  _commentsDict[_key]['study_drug'].summary.percent_compliance.correct += 1;
                } 
                else if(_studyAnswerObj.j_pills_percent === 'Incorrect') {
                  _commentsDict[_key]['study_drug'].summary.percent_compliance.incorrect += 1;
                }              

                _commentsDict[_key]['study_drug'].summary.pills_taken.total += 1;
                _commentsDict[_key]['study_drug'].summary.pills_prescribed.total += 1;
                _commentsDict[_key]['study_drug'].summary.percent_compliance.total += 1;

                let _studyTakenPercentCorrect 
                  = Math.round(_commentsDict[_key]['study_drug'].summary.pills_taken.correct 
                    / _commentsDict[_key]['study_drug'].summary.pills_taken.total *100);

                let _studyGivenPercentCorrect 
                  = Math.round(_commentsDict[_key]['study_drug'].summary.pills_prescribed.correct 
                    / _commentsDict[_key]['study_drug'].summary.pills_prescribed.total *100);

                let _studyPCPercentCorrect 
                  = Math.round(_commentsDict[_key]['study_drug'].summary.percent_compliance.correct 
                    / _commentsDict[_key]['study_drug'].summary.percent_compliance.total *100);                

                _commentsDict[_key]['study_drug'].summary.pills_taken.percent_correct = _studyTakenPercentCorrect;
                _commentsDict[_key]['study_drug'].summary.pills_prescribed.percent_correct = _studyGivenPercentCorrect;
                _commentsDict[_key]['study_drug'].summary.percent_compliance.percent_correct = _studyPCPercentCorrect;              

                _commentsDict[_key]['studyDrugSummary'][0].percentCorrect = _studyTakenPercentCorrect;
                _commentsDict[_key]['studyDrugSummary'][1].percentCorrect = _studyGivenPercentCorrect;
                _commentsDict[_key]['studyDrugSummary'][2].percentCorrect = _studyPCPercentCorrect;

                //-- Study compliance note              
                _noteObj['medication_type'] = 1;              
                _noteObj['pills_taken'] = _uTaken;
                _noteObj['pills_prescribed'] = _uGiven;
                _noteObj['pills_percent'] = _uPercent;
                _noteObj['document'].has_pills = 1;
                _noteObj['document'].medication_type = 1;
                _noteObj['document'].pills = _v2Doc.pills;
                _noteObj['document'].pills_taken = _v2Doc.pills_taken;
                _noteObj['document'].pills_prescribed = _v2Doc.pills_prescribed;

                if(_uTaken >= 0) {
                  _commentsDict[_key]['hasComplianceCalculationScore'] = true;
                }              

              } //-- if(_v1Doc.medication_type === 1) {} else {

              V1ComplianceNotesTemp.upsert({
                creator: _asmt.assessee_id,
                client_id: _asmt.client_id,
                bu_id: _asmt.bu_id,
                simulation_id: _asmt.simulation_id,
                medication_type: _noteObj['medication_type'],
                document_id: _v2Doc.id             
              }, {
                $set: _noteObj
              });

              // V1ComplianceNotesTemp.insert(_noteObj);

            } //-- if(c.isCompliance === 1) {
            else { //-- if it's a normal monitoring notes

              if(_commentsDict[_key].monitoring_notes.num_notes === 0) {
                 _noteKey = 0;
              }

              _noteKey++;

              _noteObj['content'] = c.comment;
              _noteObj['key'] = _noteKey;
              _noteObj['document'].has_pills = null;
              _noteObj['document'].medication_type = null;
              _noteObj['document'].pills = null;
              _noteObj['document'].pills_taken = null;
              _noteObj['document'].pills_prescribed = null;

              // let _nid = V1MonitoringNotesTemp.upsert({
              //   creator: _asmt.assessee_id,
              //   client_id: _asmt.client_id,
              //   bu_id: _asmt.bu_id,
              //   simulation_id: _asmt.simulation_id,
              //   key: _noteKey
              // }, {
              //   $set: _noteObj
              // });

              _commentsDict[_key]['monitoring_notes'].num_notes += 1;

              let _res = V1MonitoringNotesTemp.findAndModify(
              {
                "query": {
                  creator: _asmt.assessee_id,
                  client_id: _asmt.client_id,
                  bu_id: _asmt.bu_id,
                  simulation_id: _asmt.simulation_id,
                  // key: _noteKey
                  key: _commentsDict[_key]['monitoring_notes'].num_notes
                },
                update: {
                  $set: _noteObj
                },
                upsert: true,
                new: true
              });

              // console.log(_res)
// if(_res.creator === 'vBrZzFmedpifwWzPC') {
  // console.log(_res);
  // console.log(_commentsDict[_key]['monitoring_notes'].num_notes);

  V1MonitoringNotesTemp.update(_res._id, {
    $set: {
      key: _commentsDict[_key]['monitoring_notes'].num_notes
    }
  })
// }
              // _commentsDict[_key]['monitoring_notes'].num_notes += 1;

              let _ussNoteObj = {
                note_id: _res._id,
                note: c.comment,
                non_error: null,
                // document_id: _noteObj['document'].document_id || _v2Doc && _v2Doc.id,
                document_id: _res.document.document_id || _v2Doc && _v2Doc.id,
                // document_name: _noteObj['document'].document_name || _v2Doc && _v2Doc.name
                document_name: _res.document.document_name || _v2Doc && _v2Doc.name
              }

              _commentsDict[_key]['monitoring_notes'].notes.push(_ussNoteObj);

              // V1MonitoringNotesTemp.insert(_noteObj);

//               _commentsDict[_key]['monitoring_notes'].num_notes += 1;
// 
//               let _ussNoteObj = {
//                 note_id: _nid,
//                 note: c.comment,
//                 non_error: null,
//                 document_id: _noteObj.document.document_id,
//                 document_name: _noteObj.document.document_name
//               }
// 
//               _commentsDict[_key]['monitoring_notes'].notes.push(_ussNoteObj);

            } //-- else { for non-complinacce monitoring notes          

          } //-- if(_asmt) {

        }) //-- _comments.forEach((c) => {
// console.log(_commentsDict)
        Object.keys(_commentsDict).forEach((key) => {

          let 
            _asmt = _allAssessmentsDict[key],
            _obj = _commentsDict[key];
// console.log(_asmt)
// console.log(_obj)
          V1UsersScoreSummaryTemp.upsert({
            assessee_id: _asmt.assessee_id,
            bu_id: _asmt.bu_id,
            assessment_id: _asmt._id
          }, {
            $set: _commentsDict[key]          
          });

          _dataToReturn.push(_commentsDict[key]);
        })

        callback(null, {success: true, data: _dataToReturn});   

      } //-- if(_comments && _comments.length > 0) {

      // callback(null, {success: true, data: _comments});      

    }) //-- let output = Meteor.wrapAsync((args, callback) => {

    let result = output('dq');

    if(result) {
      return result
    }
  }
})
