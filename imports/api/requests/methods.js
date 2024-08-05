import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Requests } from './requests.js'

Meteor.methods({
    "Requests.insert"(requestObj) {
        check(requestObj, {
            reviewers: Array,
            request: {
                requester: String,
                category: Number,
                simulation_id: Number,
                name: String,
                label: String                
            }
        })

        // this.unblock()

        let 
            _request = requestObj.request,
            _category = _request.category,
            _changes = {},
            _reviewers = []

        if(requestObj.reviewers && requestObj.reviewers.length > 0) {
            requestObj.reviewers.forEach(u => {
                _reviewers.push(u._id)
            })
        }

        if(_category === 1) { //-- simulation name & label
            _changes = {
                name: _request.name,
                label: _request.label
            }
        }
        else if(_category === 2) { //-- document folder

        }        
        else if(_category === 3) { //-- documment

        }
        else if(_category === 4) { //-- document file

        }
        else if(_category === 5) { //-- protocols

        }
        else if(_category === 6) { //-- findings edit

        }
        else if(_category === 7) { //-- finding add

        }

        let obj = {
            requester: _request.requester,
            simulationId: _request.simulation_id,
            reviewers: _reviewers,
            viewed: [],
            approved: [],
            category: _request.category,
            changes: _changes,
            createdAt: new Date,
            modifiedAt: new Date,
            status: 1
        }

        let output = Meteor.wrapAsync((obj, callback) => {

            Requests.insert(obj, (err, res) => {
                let _outputData

                if(err) {
                  _outputData = {success: false, data: err}
                } else {
                  _outputData = {success: true, data: res}
                }

                callback(null, _outputData)
            })

        })

        let result = output(obj)

        if(result) {
          return result
        }

    }
});

