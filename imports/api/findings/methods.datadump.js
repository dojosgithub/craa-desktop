import { Promise } from 'meteor/promise'

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

// import { XLSX }  from 'xlsx' //-- Not working?
const XLSX = require('xlsx');

import { Findings } from './findings.js';

// const all_behaviors = new MysqlSubscription('all_behaviors')

Meteor.methods({
    "Findings.FindingsComparison.bySimulationId"(obj) {
        check(obj, {
            simulationId: Number,
            domainIds: Match.Optional(Match.OneOf(undefined, null, Array))
        })

        let _$match = {
            simulation_id: obj.simulationId,
            status: 1
        }

        if(obj.domainIds) {
            _$match['category_id'] = {
                $in: obj.domainIds
            }
        }

        let output = Meteor.wrapAsync((args, callback) => {
      
            let _findings = Findings.find(_$match,
                {
                    sort: {
                        category_id: 1,
                        order: 1,
                        id: 1
                    }
                }).fetch();
                
            let 
                _domainIds = [],
                _simulationIds = [];

            if(!obj.domainIds) { //-- if the sim is followup sim, we need domain-ids to filter out basaeline sims that are not related to this fus domain(s) 

                _findings.forEach((f) => {
                    if(!_domainIds.includes(f.category_id)) {
                        _domainIds.push(f.category_id)
                    }
                })                

                // let _$match = {
                //     status: 1,
                //     category_id: { $in: _domainIds }
                // }

                // let _pipelineFindings = [
                //     {
                //         $match: _$match
                //     },
                //     {
                //         $group: {
                //             _id: "$simulation_id",
                //             // _sids: { $first: "$simulation_id" }
                            
                //         }
                //     },
                //     {
                //         $project: {
                //             _id: 0,
                //             // sids: "$sids"
                //             sids: "$_id"
                //         }
                //     }
                // ]

                // _simulationIds = Promise.await(Findings.rawCollection().aggregate(_pipelineFindings).toArray());

                Findings.find({
                    status: 1,
                    category_id: { $in: _domainIds }
                }).fetch().forEach((f) => {
                    if(!_simulationIds.includes(f.simulation_id)) {
                        _simulationIds.push(f.simulation_id)
                    }
                })
            }

            callback(null, { data: _findings, domainIds: _domainIds, simulationIds: _simulationIds });
        
        })
      
        let result = output('dk')
    
        if(result) {
        return result;
        } 

        // return { data: _findings, domainIds: _domainIds }

    }
})