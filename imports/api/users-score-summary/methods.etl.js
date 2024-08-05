import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Promise } from 'meteor/promise'

const XLSX = require('xlsx');

import { Util } from '/imports/lib/server/util.js'

import { UsersScoreSummary } from './users-score-summary.js';
import { Assessments } from  '/imports/api/assessments/assessments.js';
import { ScoringBehaviors } from '/imports/api/scoring-behaviors/scoring-behaviors.js';
import { SimUsersSummary } from '/imports/api/sim-users-summary/sim-users-summary.js';

Meteor.methods({
  "ETL.UsersScoreSummary.addIdentifiedFindings"() {
    let _allUSS = UsersScoreSummary.find({v1: { $ne: true}}).fetch();

    if(_allUSS && _allUSS.length > 0) {

        let _idfed = [];

        _allUSS.forEach((us) => {
            let 
                _uid = us.assessee_id,
                _sid = us.simulation_id,
                _sid2 = _sid && _sid.toString();

            let _asmt = Assessments.findOne({
                assessee_id: _uid,
                simulation_id: _sid2
            });

            if(_asmt) {
                let _asmtId = _asmt._id;
                _idfed[_asmtId] = [];

                // if(_asmtId === 'gDurrHkDNTbLq8KYa') {

                    let _sbs = ScoringBehaviors.find({
                        assessment_id: _asmtId
                    }).fetch();
    
                    if(_sbs && _sbs.length > 0) {                    
    
                        _sbs.forEach((sb) => {
    
                            // let _did = 'd'+sb.behavior.id; //-- domain id key
                            let _did = sb.behavior.category_id && sb.behavior.category_id.toString(); //-- domain id key

                            if(!_idfed[_asmtId][_did]) {
                                _idfed[_asmtId][_did] = [];
                            }

                            if(sb.adjudicator && sb.adjudication) {
                                if(sb.adjudicator.identified === true) {
                                    _idfed[_asmtId][_did].push(sb.behavior.id)
                                } 
                            } else {
                                if(sb.assessor1 && sb.assessor2) {
                                    if(sb.assessor1.identified && sb.assessor2.identified) {
                                        _idfed[_asmtId][_did].push(sb.behavior.id)
                                    }
                                }
                            }
                        })
                    }

                // }

            } else {
                console.log("Check => ", _uid, _sid)
            }
        }) //-- _allUSS.forEach((us) => {

        // Object.keys(_idfed).forEach((f) => {
        // })

        for (const [_k, _v] of Object.entries(_idfed)) {
            let _asmtId = _k;

            for (const [k, v] of Object.entries(_idfed[_asmtId])) {
                let _dkey = parseInt(k);

                // console.log(_dkey, " => ", v);

                UsersScoreSummary.update({
                    assessment_id: _asmtId,                    
                    domainSummary: { $elemMatch : { id: _dkey }}
                }, {
                    $set: {
                        'domainSummary.$.idfs': v
                    },
                    $unset: {
                        'domainSummary.$.identifiedFindings': 1
                    }
                })
            }
        }

        for (const [_k, _v] of Object.entries(_idfed)) {
            let _asmtId = _k;

            for (const [k, v] of Object.entries(_idfed[_asmtId])) {
                let _dkey = parseInt(k);

                let _uss = UsersScoreSummary.findOne({
                    assessment_id: _asmtId
                })

                if(_uss) {
                    let _domain = _uss.domain;

                    if(_domain) {                        
                        Object.entries(_domain).forEach(([__k,__v]) => {
                            if(__v.id === _dkey) {
                                __v['idfs'] = v;
                            }
                            _domain[__k] = __v;
                        })

                        UsersScoreSummary.update({
                            assessment_id: _asmtId
                        }, {
                            $set: {
                                domain: _domain
                            }
                        })
                        
                    }
                }
            }
        }        

        return {res: true}
    } //-- if(_allUSS && _allUSS.length > 0) {
    else {
        return {res: false}
    }
  }
});
