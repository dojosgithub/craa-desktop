import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

const XLSX = require('xlsx');

import { Util } from '/imports/lib/server/util.js'

import { Assessments } from '/imports/api/assessments/assessments.js';
import { ScoringBehaviors } from '/imports/api/scoring-behaviors/scoring-behaviors.js';
import { UsersScoreSummary } from '/imports/api/users-score-summary/users-score-summary.js';

import { Findings } from '/imports/api/findings/findings.js';

Meteor.methods({
  "ScoringBehaviors.FindingsComparisonReport.export"(obj) {
    check(obj, {
      simulation_id1: String,
      simulation_id2: String,
      simulation_id_1: Number,
      simulation_id_2: Number
    })

    // this.unblock()

    let output = Meteor.wrapAsync((args, callback) => {
            
      let _baseFindingsNeedle = [1016, 1033, 1034, 1035, 1036, 1037, 1039, 1040, 1041, 1042, 1044, 1045, 1046, 1047, 1048, 1049, 1050, 1051, 1052];
      let _fuFindingsNeedle =  [608, 601, 599, 600, 598, 606, 607, 610, 611, 613, 614, 615, 612, 617, 604, 605, 616, 603, 602];

      if(obj.simulation_id1 === '9') {
        _baseFindingsNeedle = [436, 453, 454, 455, 456, 457, 459, 460, 461, 462, 464, 465, 466, 467, 468, 469, 470, 471, 472];
        _fuFindingsNeedle =   [628, 621, 619, 620, 618, 626, 627, 630, 631, 633, 634, 635, 632, 637, 624, 625, 636, 623, 622];
      }

      let 
        _baseFDict = [],
        _fuFDict = [],
        _fKeyCountDict = [];

      let _baseFindings = Findings.find({
        // simulation_id: obj.simulation_id_1,
        // status: 1
        id: {$in: _baseFindingsNeedle}
      }, {
        fields: {id: 1, finding: 1},
        sort: { id: 1}
      }).fetch();

      let _fuFindings = Findings.find({
        // simulation_id: obj.simulation_id_2,
        // status: 1
        id: {$in: _fuFindingsNeedle}
      }, {
        fields: {id: 1, finding: 1},
        sort: { id: 1}
      }).fetch();

      // console.log(_baseFindings);
      // console.log(_fuFindings);

      if(_baseFindings && _baseFindings.length > 0) {
        _baseFindings.map((f1) => {
          if(f1.id) {
            _baseFDict['f_'+f1.id] = f1
            _fKeyCountDict['f_'+f1.id] = {
              BIFI: 0,
              BIFNI: 0,
              BNIFI: 0,
              BNIFNI: 0
            };
          }
        });
      }

      if(_fuFindings && _fuFindings.length > 0) {
        _fuFindings.map((f2) => {
          if(f2.id) {
            _fuFDict['f_'+f2.id] = f2
          }
        });
      }

      // console.log(_baseFDict)
      // console.log(_fuFDict)

      let pipelineScores = 
      [
        {
          $match: {
            status: { $gte: 3 },
            $or: [
              { simulation_id: obj.simulation_id1 },
              { simulation_id: obj.simulation_id2 }
            ]
          }
        },
        {
          $lookup: {
            from: "users_score_summary",
            localField: "_id",
            foreignField: "assessment_id",
            as: "uss"
          }
        },
        {
          $unwind: "$uss"
        },             
        {
          $lookup: {
            from: "sim_users_summary",
            // localField: "_id",
            // foreignField: "assessmentId",            
            let: {
              client_id: "$client_id",
              bu_id: "$bu_id",
              assessee_id: "$assessee_id",
              // simulation_id: "$simulation_id",
              // fullname: "$fullname"
            },
            pipeline: [
              {
                $match: {
                  // status: 'Active.',
                  $or: [
                    {simulationId: obj.simulation_id_1},
                    {simulationId: obj.simulation_id_2}
                  ],
                  $expr: {
                    $and: [
                      { $eq: [ "$clientId", "$$client_id" ] },
                      { $eq: [ "$buId", "$$bu_id" ] },
                      { $eq: [ "$userId", "$$assessee_id" ] }
                    ]
                  }
                }
              },
              { $project: { _id: 0, clientId: 0, buId: 0, userId: 0 } },
            ],          
            as: "sus"
          }
        },
        {
          $unwind: "$sus"
        },
        // {
        //   $lookup: {
        //     from: "users_score_summary",
        //     localField: "_id",
        //     foreignField: "assessment_id",
        //     as: "uss"
        //   }
        // },
        // {
        //   $unwind: "$uss"
        // },        
        {
          $group: {
            _id: "$assessee_id",
            // ussData: { $addToSet: "$uss" },
            // susData: { $addToSet: "$sus" },
            fullname: { $first: "$sus.fullname" },
            client: { $first: "$sus.clientName" },
            simulations: { $addToSet: { 
              sid: "$sus.simulationId",
              sname: "$sus.simulationName"
            }},
            ussUFIDs: { $addToSet: {
              sid: "$uss.simulation_id", 
              ufids: "$uss.findingIds"
            }}
          }
        },
        {
          $project: {
            // assessment_id: "$assessmentId",
            // assessee_id: "$assessee_id",
            // client_id: "$client_id",
            // bu_id: "$bu_id",
            // simulation_id: "$simulation_id",
            // client_name: "$sus.clientName",
            // bu_name: "$sus.buName",
            // simulation_name: "$sus.simulationName",
            // fullname: "$sus.fullname",
            // country: "$sus.country",
            // uss: "$uss.findingIds"
            // ussData: "$ussData",
            fullname: "$fullname",
            client: "$client",
            simulations: "$simulations",
            ussUFIDs: "$ussUFIDs"           
          }
        },
        // { "$replaceRoot": { "newRoot": "$uss" }},
        {
          $sort: {
            "fullname": 1,
            // "simulation_id": -1
            // "uss.simulation_id": 1,
            // "sus.simulationId": 1
          }
        }
      ];
      
      let _scores = Promise.await(Assessments.rawCollection().aggregate(pipelineScores).toArray());

      // console.log(_scores.length)

      // console.log((_scores[0]))

      if(_scores && _scores.length > 0) {

      //   // let _data = ["First Last", "Client Name", ];
        let
          headData = {
            baseFIDs: ["Baseline ID", ""],
            baseFs: ["Baseline Finding", ""],
            fuFIDs: ["Followup Finding ID", ""],
            fuFs: ["Followup Finding", ""]
          },
          isHeadDataDone = false,
          excelData = [],
          _data = [],
          _baseSimName = "";
          _fuSimName = "";

        _scores.map((s, i) => {
          if(s.ussUFIDs && s.ussUFIDs.length > 1) { //-- only if the user has done both Base and FU sims

            let 
              _cpBIKey = "BI",
              _cpBNIKey = "BNI",
              _cpFIKey = "FI",
              _cpFNIKey = "FNI";

            // console.log((s))            

            let
              _dataObj = [],
              _baseUFIDs = [],
              _fuUFIDs = [];


            _dataObj.push(s.fullname);
            _dataObj.push(s.client);

            s.ussUFIDs.forEach((uf, i) => {
              if(uf.sid === obj.simulation_id_1) { //-- Baseline
                _baseSimName = uf.sname;
                _baseUFIDS = uf.ufids;
              } else { //-- Followup
                _fuSimName = uf.sname;
                _fuUFIDs = uf.ufids;
              }
            })

            _baseFindingsNeedle.forEach((bf, i) => {
              
              if(!isHeadDataDone) {

                headData.baseFIDs.push(bf);
                headData.baseFs.push(_baseFDict['f_'+bf].finding);

                headData.fuFIDs.push(_fuFindingsNeedle[i]);
                headData.fuFs.push(_fuFDict['f_'+_fuFindingsNeedle[i]].finding);

                if(i === _baseFindingsNeedle.length -1) {
                  isHeadDataDone = true;
                }                
              } 

              let _cpKey = "";

              if(_baseUFIDS.includes(bf)) {
                _cpKey += _cpBNIKey
              } else {
                _cpKey += _cpBIKey
              }

              if(_fuUFIDs.includes(_fuFindingsNeedle[i])) {
                _cpKey += _cpFNIKey
              } else {
                _cpKey += _cpFIKey
              }

              _fKeyCountDict['f_'+bf][_cpKey] += 1;

              _dataObj.push(_cpKey)
            });            

            _data.push(_dataObj)            

          }

        })

        excelData.push(headData.baseFIDs);
        excelData.push(headData.baseFs);
        excelData.push(headData.fuFIDs);
        excelData.push(headData.fuFs);

        let finalData = excelData.concat(_data);        

        // console.log(_fKeyCountDict)

        let _countData = [
          ["BIFI",""],
          ["BIFNI",""],
          ["BNIFI",""],
          ["BNIFNI",""]
        ];

        Object.entries(_fKeyCountDict).forEach(([k,v]) => {
          _countData[0].push(v.BIFI);
          _countData[1].push(v.BIFNI);
          _countData[2].push(v.BNIFI);
          _countData[3].push(v.BNIFNI);
        })

        finalData.push([]);
        finalData = finalData.concat(_countData);

        finalData.push([]);
        finalData.push(["Legend"]);
        finalData.push(["BIFI", "Baseline Identified, Followup Identified"]);
        finalData.push(["BIFNI", "Baseline Identified, Followup Not Identified"]);
        finalData.push(["BNIFI", "Baseline Not Identified, Followup Identified"]);
        finalData.push(["BNIFNI", "Baseline Not Identified, Followup Not Identified"]);        

        const ws = XLSX.utils.aoa_to_sheet(finalData);
        // const wb = {SheetNames: ["Findings Comparison"], Sheets:{Sheet1:ws }};        
        // const wb = {SheetNames: ["Sheet1"], Sheets:{Sheet1:ws }};        
        const wb = {SheetNames: ["Report"], Sheets:{"Report":ws }};        

        callback(null, {success: true, data: wb})

      } else { //-- if(_scores && _scores.length > 0) { } else 
        callback(null, {success: false, data: []})
      }

    })

    let result = output('dq')

    if(result) {
      return result
    }      
  }

})
