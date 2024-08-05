import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Promise } from 'meteor/promise'

const XLSX = require('xlsx');

import { Util } from '/imports/lib/server/util.js'

import { Scorings } from '/imports/api/scorings/scorings.js';
import { ScoringBehaviors } from '/imports/api/scoring-behaviors/scoring-behaviors.js';
import { ScoringViewed } from '/imports/api/scoring-viewed/scoring-viewed.js';

Meteor.methods({
  'Scoring.scorer.export'(scorer) {    

    check(scorer, {
      uid: String,
      name: String,
      findings: Array      
    })

    // this.unblock()

    let output = Meteor.wrapAsync((arg, callback) => {

      let _fDict = []
      // scorer.findings.forEach((f) => {
      scorer.findings.forEach((f) => {  
        let skey = 's' + f.sid 
        _fDict[skey] = f.count        
      })
        
      // let 
        // rawScorings = Scorings.rawCollection(),
        // aggregateQueryScorings = Meteor.wrapAsync(rawScorings.aggregate, rawScorings);

      let pipelineScorings = 
      [
        {
          $match: {
            'assessor._id': scorer.uid
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
          $lookup: {
            from: "scoring_temp_timer_log",
            localField: "assessment_id",
            foreignField: "assessment_id",
            as: "stt"          
          }
        },
        {
          $unwind: "$stt"
        },
        {
          $match: {
            'stt.assessor_id': scorer.uid
          }
        },
        // {
        //   $lookup: {
        //     from: "scoring_behaviors",
        //     localField: "assessment_id",
        //     foreignField: "assessment_id",
        //     as: "sb"          
        //   }
        // },
        // {
        //   $unwind: "$sb"
        // },
        // {
        //   $unwind: {
        //     path: '$sb',
        //     preserveNullAndEmptyArrays: true
        //   }          
        // },        
        // {
        //   $match: {
        //     'sb.adjudicator': { $exists: true }
        //   }
        // },                        
        {
          $project: {
            "asmt": "$assessment_id",
            "cname": "$sus.clientName",
            "bname": "$sus.buName",
            "sname": "$sus.simulationName",
            "sid": "$sus.simulationId",
            "time": "$stt.pause_time",            
            "initial": "$sus.initial",
            "eAt": "$modifiedAt",
            // "adj": "$sb.adjudicator"
          }
        }                      
      ]

      // let _scorings = aggregateQueryScorings(pipelineScorings, {cursor: {}}) 
      let _scorings = Promise.await(Scorings.rawCollection().aggregate(pipelineScorings).toArray());

      let 
        _sb = [],
        _sbDict = [],
        _sv = [],
        _svDict = []

      if(_scorings && _scorings.length > 0) {
        _sb = ScoringBehaviors.find({
          $or: [
            { 'assessor1._id': scorer.uid },
            { 'assessor2._id': scorer.uid },
          ],
          adjudicator: { $exists: true }
        }).fetch()

        if(_sb && _sb.length > 0) {
          _sb.forEach((b) => {
            if(!_sbDict[b.assessment_id]) {
              _sbDict[b.assessment_id] = []
              _sbDict[b.assessment_id]['numf'] = 0
            }

            let j = b.adjudicator.identified
// console.log(b.assessment_id, j, b.assessor1.identified)
            if(b.assessor1 && b.assessor1._id === scorer.uid) {
              if(j !== b.assessor1.identified) {
                _sbDict[b.assessment_id].numf++
              }
            }
            if(b.assessor2 && b.assessor2._id === scorer.uid) {
              if(j !== b.assessor2.identified) {
                _sbDict[b.assessment_id].numf++
              }
            }             
          })          
        }

        // let 
          // rawSV = ScoringViewed.rawCollection(),
          // aggregateQuerySV = Meteor.wrapAsync(rawSV.aggregate, rawSV);

        let pipelineSV = [
          {
            $match: {
              $or: [
                { "assessor1._id": scorer.uid },
                { "assessor2._id": scorer.uid }
              ]
            }
          },
          {
            $group: {
              "_id": "$assessment_id",
              // "_id": {
              //   "aid": "$assessment_id",
              //   "s1": "$assessor1._id",
              //   "s2": "$assessor2._id"
              // },
              count: { $sum: 1 }
            }
          },
          {
            $project: {
              "_id": 0,
              "aid": "$_id",
              count: 1
            }
          }
        ]

        // let _sv = aggregateQuerySV(pipelineSV)
        let _sv = Promise.await(ScoringViewed.rawCollection().aggregate(pipelineSV).toArray());
// console.log(_sv)

        if(_sv && _sv.length > 0) {
          _sv.forEach((v) => {
            _svDict[v.aid] = v.count
          })
        }

        let xlData = [["Scorer Name", "Client", "User Initial", "Simulation Name", "Time to Complete Scoring", "Date Scoring submitted", "Number of Findings Scored", "Number of incorrect Findings scored", "Number of MN"]]

        _scorings.forEach((s) => {

          let 
            _client = s.cname + '-' + s.bname,
            _numf = _sbDict[s.asmt] && _sbDict[s.asmt].numf || 0,
            _skey = 's' + s.sid,
            _f = _fDict[_skey],
            _mn = _svDict[s.asmt] || 0

          let _data = [scorer.name, _client, s.initial, s.sname, s.time, Util.dateHMS2(s.eAt), _f,  _numf, _mn]
          xlData.push(_data)

        })

        const ws = XLSX.utils.aoa_to_sheet(xlData);
        const wb = {SheetNames: ["Scorer Report"], Sheets:{'Scorer Report':ws }};        

        callback(null, {success: true, data: wb, data1: _scorings})
      }
      
    })

    let result = output('dq')

    if(result) {
      return result
    }
  }
})
