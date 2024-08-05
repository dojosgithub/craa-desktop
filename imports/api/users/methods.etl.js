import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Promise } from 'meteor/promise'

const XLSX = require('xlsx');

import { V1Users } from '/imports/api/users/users.js'

import { UsersSummary } from '/imports/api/users-summary/users-summary.js';

Meteor.methods({
    "ETL.training.transferUserProfileTrainingModules"() {    

        import { ExtOTRDB } from '/imports/startup/server/db-config.js';

        let cLength = 0;

        let output = Meteor.wrapAsync((args, callback) => { 

            let _users = ExtOTRDB.mongo.find('users', { //-- Get simulations allotted
                'profile.status': { $ne: '4' },
                'profile.trainingModules': { $exists: true }
            }).fetch(); 
    

            if(_users.length > 0) {
                
                _users.forEach((u,i) => {
                    let 
                        _obj = {},
                        _j = 0;
                    
                    if(u.profile.trainingModules) {
                        _obj['profile.trainingModules'] = u.profile.trainingModules;
                        _j++;
                    }
                    if(u.profile.moduleProgress) {
                        _obj['profile.moduleProgress'] = u.profile.moduleProgress;
                        _j++;
                    }
                    if(u.profile.viewedTutorial) {
                        _obj['profile.viewedTutorial'] = u.profile.viewedTutorial;
                        _j++;
                    }
                    if(_j > 0) {
                        Meteor.users.update(u._id, {
                            $set: _obj
                        }, (err, res) => {
                            if(res) {
                                if(i === _users.length -1) {
                                    callback(null, {success: true, data: _users})
                                }
                            }
                        })
                    }


                })
            } else {
                callback(null, {success: false})
            }
        })

        let result = output('dk')

        return result      

    },  


})
