import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Promise } from 'meteor/promise'

import { Util } from '/imports/lib/server/util.js'

import { UsersSummary } from './users-summary.js';
import { SimUsersSummary } from '/imports/api/sim-users-summary/sim-users-summary.js';

Meteor.methods({
  "ETL.UsersSummary.quintilesToIqviaEmail"() {

    this.unblock()

    let output = Meteor.wrapAsync((args, callback) => {

      let 
        _users = Meteor.users.find({
          'emails.address': {$regex: /quintiles/, $options: "i"},
          'profile.status': { $ne: 4}
        }).fetch(),
        _userIds = [],
        _userEmailDict = [];

      // let _bulk = Meteor.users.initializeUnorderedBulkOp();
      // _bulk.find( {} ).update()

      // Meteor.users.find({'emails.address': {$regex: /quintiles.com/}}).forEach((u, i) => {
      //   console.log(u)
      //   u.emails[0].address = u.emails[0].address.replace("//quintiles","//iqvia");
      //   Meteor.users.save(u);
      // })

      // Meteor.users.aggregate([
      //     {
      //         $addFields: {
      //             'emails.address': {
      //                 $map: {
      //                     input: "$images",
      //                     as: "image",
      //                     in: {
      //                         $concat: [ "D:/data/db/images", { $substr: [ "$$image", 8, { $strLenBytes: "$$image" } ] } ]
      //                     }
      //                 }
      //             }
      //         }
      //     },
      //     { $out: "Users" } //replaces existing collection
      // ])      

      if(_users && _users.length > 0) {
        // console.log(_users.length)
        let
          _usersBulk = Meteor.users.rawCollection().initializeUnorderedBulkOp(),
          _usBulk = UsersSummary.rawCollection().initializeUnorderedBulkOp(),
          _susBulk = SimUsersSummary.rawCollection().initializeUnorderedBulkOp();

        _users.map((u) => {
          let _uEmail = u.emails[0].address;

          // console.log(_uEmail);

          if(u._id) {

            _userIds.push(u._id);

            if(_uEmail.includes("quintiles")) {
              _userEmailDict[u._id] = u.emails[0].address.replace("quintiles", "iqvia");
            }
            else if(_uEmail.includes("Quintiles")) {
              _userEmailDict[u._id] = u.emails[0].address.replace("Quintiles", "iqvia");
            }
            else if(_uEmail.includes("quintilesims")) {
              _userEmailDict[u._id] = u.emails[0].address.replace("quintilesims", "iqvia");
            }            
            // _userEmailDict[u._id] = u.emails[0].address.replace("quintilesims", "iqvia");

            _usersBulk.find( { _id: u._id } ).update( {
              $set: { 'emails.0.address': _userEmailDict[u._id] }
            })           

            _usBulk.find( { userId: u._id } ).update( {
              $set: { email: _userEmailDict[u._id] }
            }) 

            _susBulk.find( { userId: u._id } ).update( {
              $set: { email: _userEmailDict[u._id] }
            })            
          }
        })

        _usersBulk.execute();
        _usBulk.execute();
        _susBulk.execute();

        callback(null, {success: true, data: []})
      } else {
        callback(null, {success: false, data: []})
      }
    	
    });


    let result = output('dq')

    if(result) {
      return result
    }       	
  }
});
