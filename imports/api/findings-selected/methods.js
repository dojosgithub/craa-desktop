import { Promise } from 'meteor/promise'

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { FindingsSelected } from './findings-selected.js';

Meteor.methods({
	"FindingsSelected.add"(obj) {
		check(obj, {
			sid: Number,
			name: String
		})
		// this.unblock();

    let output = Meteor.wrapAsync((args, callback) => {

      FindingsSelected.insert({
      	simulation_id: obj.sid,
      	name: obj.name,
        findings: [],        
      	status: 1,
      	author: Meteor.userId(),
      	createdAt: new Date}, (err, res) => {
        if(err) {
          _outputData = {success: false, data: err}
        } else {            
          _outputData = {success: true, data: res}
        }
        callback(null, _outputData)           
      })
    })

    let result = output('dk')

    if(result) {
      return result
    }		
	},
  "FindingsSelected.finding.add"(obj) {
    check(obj, {
      _id: String,
      sid: Number,
      fid: Number
    })
    // this.unblock();

    let output = Meteor.wrapAsync((args, callback) => {

      FindingsSelected.update(obj._id, {
          $addToSet: { findings: obj.fid },
          $set: { modifiedAt: new Date }
        }, (err, res) => {
        if(err) {
          _outputData = {success: false, data: err}
        } else {            
          _outputData = {success: true, data: res}
        }
        callback(null, _outputData)           
      })
    })

    let result = output('dk')

    if(result) {
      return result
    }    
  },
  "FindingsSelected.finding.delete"(obj) {
    check(obj, {
      _id: String,      
      fid: Number
    })
    // this.unblock();

    let output = Meteor.wrapAsync((args, callback) => {

      FindingsSelected.update(obj._id, {
          $pull: { findings: obj.fid },
          $set: {             
            modifiedAt: new Date
          }
        }, (err, res) => {
        if(err) {
          _outputData = {success: false, data: err}
        } else {            
          _outputData = {success: true, data: res}
        }
        callback(null, _outputData)           
      });

    })

    let result = output('dk')

    if(result) {
      return result
    }    
  },
  "FindingsSelected.status.update"(obj) {
    check(obj, {
      _id: String,      
      status: Number
    })
    // this.unblock();

    let output = Meteor.wrapAsync((args, callback) => {

      FindingsSelected.update(obj._id, {          
          $set: { 
            status: obj.status,
            modifiedAt: new Date 
          }
        }, (err, res) => {
        if(err) {
          _outputData = {success: false, data: err}
        } else {            
          _outputData = {success: true, data: res}
        }
        callback(null, _outputData)           
      });

    })

    let result = output('dk')

    if(result) {
      return result
    }    
  },      
});
