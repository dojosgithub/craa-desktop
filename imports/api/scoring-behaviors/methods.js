import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Util } from '/imports/lib/server/util.js'

import { ScoringBehaviors } from '/imports/api/scoring-behaviors/scoring-behaviors.js';

import { UsersScoreSummary } from '/imports/api/users-score-summary/users-score-summary.js';

Meteor.methods({
  "ETL.ScroingBehaviors.severity"() {
    // check(sid, Number)

    // this.unblock()

    let output = Meteor.wrapAsync((args, callback) => {

      let
        sid = 9,
        fid = 447

      let _sb = ScoringBehaviors.update({ //-- 02/25/2018 Upon Chris' request, severity of finding 447 got updated from 'Major' to 'Critical'
        'behavior.id': fid,
        // 'behavior.severity': 'Major'
      }, {
        $set: {
          'behavior.severity': 'Critical'
        }
      }, {
        multi: true
      })

      if(_sb) {

        let _uss = UsersScoreSummary.update({ //-- 02/25/2018 Upon Chris' request, severity of finding 447 got updated from 'Major' to 'Critical'
          'unidentified_findings.findings.id': fid          
        }, {
          $set: {
            'unidentified_findings.findings.$.severity': 'Critical'
          }
        }, {
          multi: true
        })

        if(_uss) {
          callback(null, {success: true})
        }
      }

    })

    let result = output('dq')

    if(result) {
      return result
    }      
  },
  "ETL.UsersScoreSummary.severity"() {
    // check(sid, Number)

    // this.unblock()

    let output = Meteor.wrapAsync((args, callback) => {

      let
        sid = 9,
        fid = 447,
        asmts = []

      // let _asmts = Assessments.find({
      //   simulation_id: '9'
      // }).fetch()

      let _asmts = UsersScoreSummary.find({ //-- UsersScoreSummary (compared to Assessments collection) will get only scored assessments
        simulation_id: 9
      }).fetch()

      if(_asmts && _asmts.length > 0) {
        _asmts.forEach((a) => {

          let 
            isPRAHS_EAPA = (a.bu_id === "KvfDbTLZLHTfJWyq8-1468790546004") ? true : false,
            thisSimulationId = a.simulation_id.toString()

          if(!asmts[a.assessment_id]) {
            asmts[a.assessment_id] = {
              ussId: a._id,
              assessment_id: a.assessment_id,
              client_id: a.client_id,
              bu_id: a.bu_id,
              assessee_id: a.assessee_id,
              simulation_id: a.simulation_id
            }
          }

          asmts[a.assessment_id]['severity'] = {
            Critical: {
              severity: 'Critical',
              identified: 0,
              not_identified: 0,
              percent_identified: 0,
              total: 0
            },
            Major: {
              severity: 'Major',
              identified: 0,
              not_identified: 0,
              percent_identified: 0,
              total: 0
            },
            Minor: {
              severity: 'Minor',
              identified: 0,
              not_identified: 0,
              percent_identified: 0,
              total: 0
            },                    
          }

          let sbs = ScoringBehaviors.find({
            assessment_id: a.assessment_id,
            simulation_id: a.simulation_id.toString(),          
          }, {
            sort: {
              "behavior.severity": 1,
              "behavior.category": 1
            }
          }).fetch()

          if(sbs.length > 0) {
            
            let hasCFR = false;

            sbs.forEach(function(sb) {

              //- This one's covered inisde assessee-result-2 now
              //- as this creates duplicated Finding data by filling 
              //- up the old behavior filed with the new finding filed data. 
              // if(sb.behavior.finding) { 
              //  sb.behavior.behavior = sb.behavior.finding;
              // }

              var mySeverity = sb.behavior.severity,
                  myDomain = sb.behavior.category,
                  myDomainId = sb.behavior.category_id,
                  myIdentified = false;

              hasCFR = (sb.behavior.cfr !== '') ? true : false;
              
              // if(sb.adjudicator && a.adjudication) { //-- when with Assessments
              if(sb.adjudicator) { //-- when with UsersScoreSummary
                if(sb.adjudicator.identified === true) {
                  myIdentified = true;
                } 
              } else {
                if(sb.assessor1 && sb.assessor2) {
                  myIdentified = sb.assessor1.identified && sb.assessor2.identified;
                }
              }
// if(a.assessment_id === 'oEu6RD6zhHuZnbwSu') {
// if(a.assessment_id === '5ebeyixztxrz5MGuS') {
  // console.log(sb.behavior.id, mySeverity, myIdentified)
// }
              if(myIdentified === true) {

                if(!(isPRAHS_EAPA && thisSimulationId === '10' && myDomainId === 2)) {
                  asmts[a.assessment_id]['severity'][mySeverity]['identified']++;
                }

              } else {

                if(!(isPRAHS_EAPA && thisSimulationId === '10' && myDomainId === 2)) {
                  asmts[a.assessment_id]['severity'][mySeverity]['not_identified']++;
                }

              } // if(myIdentified === true) { else                

              if(!(isPRAHS_EAPA && thisSimulationId === '10' && myDomainId === 2)) {
                asmts[a.assessment_id]['severity'][mySeverity]['total']++;

                asmts[a.assessment_id]['severity'][mySeverity]['percent_identified'] = 
                  // (asmts[a.assessment_id]['severity'][mySeverity]['identified'] / asmts[a.assessment_id]['severity'][mySeverity]['total'] * 100).toFixed(0);
                  Math.round(asmts[a.assessment_id]['severity'][mySeverity]['identified'] / asmts[a.assessment_id]['severity'][mySeverity]['total'] * 100);
              }
              
            }); // sbs.forEach(function(sb) {                  
            
          } // if(sbs.length > 0) {

        }) //-- _asmts.forEach((a) => {

        let _idx = 0
        for( var k in asmts ) {
          var assessment_id = k;

  /*========BEGIN: Score Summary ==========*/

          let
            severity = [],
            _severity = asmts[k]['severity'] || null          

          if(_severity) {
            Object.keys(_severity).forEach((d) => {
              let severityObj = {
                name: _severity[d].severity,
                percentIdentified: parseInt(_severity[d].percent_identified)
              }

              severity.push(severityObj)
            })
          }

  /*========END: Score Summary ==========*/
// if(assessment_id === 'oEu6RD6zhHuZnbwSu') {
// if(assessment_id === '5ebeyixztxrz5MGuS') {
  

          UsersScoreSummary.update({
            // assessment_id: k,
            // client_id: asmts[k].client_id,
            // bu_id: asmts[k].bu_id,
            // simulation_id: asmts[k].simulation_id
            _id: asmts[k].ussId
          }, {
            $set: {
              severity: asmts[k]['severity'],
              severitySummary: severity
            }
          });               
// }
          // UserReportSummary.update({
          //   assessmentId: assessment_id
          // }, {
          //   $set: {
          //     findingIds: findingIds
          //   }
          // })
          // console.log(_idx, _asmts.length)
          if(_idx === _asmts.length -1) {
            callback(null, {success: true})
          }

          _idx++

        } // for( var k in asmts ) {  


      } //-- if(_asmts && _asmts.length > 0) {

    })

    let result = output('dq')

    if(result) {
      return result
    }      
  },  
})
