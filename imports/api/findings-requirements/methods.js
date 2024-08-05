import { Promise } from 'meteor/promise'

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { FindingsRequirements } from './findings-requirements.js';

// const all_behaviors = new MysqlSubscription('all_behaviors')

Meteor.methods({
	"FindingsRequirements.add"(obj) {
		check(obj, {
			sid: Number,
			name: String
		})
		// this.unblock();

    let output = Meteor.wrapAsync((args, callback) => {

      FindingsRequirements.insert({
      	simulation_id: obj.sid,
      	name: obj.name,
        findings: [],
        threshold: 0,
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
  "FindingsRequirements.finding.add"(obj) {
    check(obj, {
      _id: String,
      sid: Number,
      fid: Number
    })
    // this.unblock();

    let output = Meteor.wrapAsync((args, callback) => {

      FindingsRequirements.update(obj._id, {
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
  "FindingsRequirements.finding.delete"(obj) {
    check(obj, {
      _id: String,      
      fid: Number
    })
    // this.unblock();

    let output = Meteor.wrapAsync((args, callback) => {

      FindingsRequirements.update(obj._id, {
          $pull: { findings: obj.fid },
          $set: { 
            threshold: 0,
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
  "FindingsRequirements.threshold.update"(obj) {
    check(obj, {
      _id: String,      
      threshold: Number
    })
    // this.unblock();

    let output = Meteor.wrapAsync((args, callback) => {

      FindingsRequirements.update(obj._id, {          
          $set: { 
            threshold: obj.threshold,
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
  "FindingsRequirements.status.update"(obj) {
    check(obj, {
      _id: String,      
      status: Number
    })
    // this.unblock();

    let output = Meteor.wrapAsync((args, callback) => {

      FindingsRequirements.update(obj._id, {          
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
