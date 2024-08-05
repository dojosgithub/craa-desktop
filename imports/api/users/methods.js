import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Promise } from 'meteor/promise'

const XLSX = require('xlsx');

import { V1Users } from '/imports/api/users/users.js'

import { UsersSummary } from '/imports/api/users-summary/users-summary.js';

Meteor.methods({
  "ETL.Users.v1.import"(data) {
    check( data, Array );

    for ( let i = 0; i < data.length; i++ ) {
      let user   = data[ i ],
          exists = V1Users.findOne( { id: data.id } );

      if ( !exists ) {
        if(data.id) {
          V1Users.insert( user );
        }
      } else {
        console.warn( 'Rejected. This user already exists.' );
      }
    }
  },
  "Users.all.names"() {
    // this.unblock()

    // let 
      // rawUsers = Meteor.users.rawCollection(),
      // aggregateQueryUsers = Meteor.wrapAsync(rawUsers.aggregate, rawUsers);

    let pipelineUsers = 
    [
      {
        // $match: { 'profile.status': 1 }
        $match: { 'profile.status': {$ne: 4} } //-- updated upon Chris' request (dqk, 03/19/2019)
      },
      {
       $group: { //-- To create and return each long array of users' firstname, lastname and email
        _id: null,
        firstnames: { $addToSet: {$toLower: '$profile.firstname' }},
        lastnames: { $addToSet: {$toLower: '$profile.lastname' }},
        // emails: { $addToSet: {  $arrayElemAt: [ "$emails.address", 0 ] } }
        emails: { $addToSet: {  $toLower: {$arrayElemAt: [ "$emails.address", 0 ] }} }        
       }
      }
    ];

    // let _users = aggregateQueryUsers(pipelineUsers)
    let _users = Promise.await(Meteor.users.rawCollection().aggregate(pipelineUsers).toArray());

    return _users

  },   
  "V1Users.all.names"() {
    this.unblock()

    // let 
      // rawUsers = V1Users.rawCollection(),
      // aggregateQueryUsers = Meteor.wrapAsync(rawUsers.aggregate, rawUsers);


    let pipelineUsers = 
    [
      {
       $group: { //-- To create and return each long array of users' firstname, lastname and email
        _id: null,
        firstnames: { $addToSet: {$toLower: '$fname' }},
        lastnames: { $addToSet: {$toLower: '$lname' }},
        emails: { $addToSet:  {$toLower: "$email" }},
       }
      }
    ];

    // let _users = aggregateQueryUsers(pipelineUsers)
    let _users = Promise.await(V1Users.rawCollection().aggregate(pipelineUsers).toArray());

    return _users
  },
  "UserEmails.export"() {

    this.unblock()

    let output = Meteor.wrapAsync((args, callback) => {
      let _emails = UsersSummary.find({
        roleKey: '6',
        status: 'Active.'
      }, {
        fields: {
          email: 1
        }
      }).fetch();

      if(_emails && _emails.length > 0) {
        
        let 
          _emailData = [],
          _emailTexts = '';

        // let data = [["Emails"]]

        _emails.forEach((e) => {
          _emailData.push(e.email);  

          // let _email = [e.email]

          // data.push(_email)
        })

        // let data = [["Emails"]]

        // _emailTexts = _emailData.join(",");

        // let email = [_emailTexts]

        // let data.push(email)

          // return wb;            
        // })

        // const ws = XLSX.utils.aoa_to_sheet(data);
        // const ws = XLSX.utils.sheet_to_csv(_emailData);
        // const wb = {SheetNames: ["Emails"], Sheets:{'Emails':ws }};
        // 
        // var ws1 = wb.Sheets[wb.SheetNames[0]];

// var wb = XLSX.read(_emailData, {type: 'binary'});
// var ws = wb.Sheets[wb.SheetNames[0]]
// var csvString = XLSX.utils.sheet_to_csv(ws);

        callback(null, {success: true, data: _emailData})


        // callback(null, {success: true, data: _emailData})
      } 
      // else {
      //   callback(null, {success: false, data: []})
      // }
    }) 

    let result = output('dk')

    if(result) {      
      return result
    }

  },
  // "Users.loginWithPassword"(obj) {
  //   check(obj, {
  //     username: String,
  //     password: String
  //   })
  //   this.unblock();

  //   let _user = Meteor.users.findOne({
  //     username: obj.username
  //   });

  //   if (_user) {
  //     //get paramter password
  //     let password = obj.password;
  //     //authenticate user
  //     let result = Accounts._checkPassword(_user, password);
  //     if (result.error) {
  //       return result.error;
  //     } else {

  //       if(result.userId) {
  //         const stampedLoginToken = Accounts._generateStampedLoginToken();
  //         Accounts._insertLoginToken(result.userId, stampedLoginToken);
  //         return {
  //           userId: result.userId,
  //           token: stampedLoginToken.token
  //         };
          
  //       }
  //     }
  //   } else {
  //     //if user is not found
  //     return {
  //       error: "User not found"
  //     }
  //   }

  // }  
  "Users.loginWithPassword"(obj) {
    check(obj, {
      username: String,
      password: String
    })
    // this.unblock();

    let _user = Meteor.users.findOne({
      username: obj.username
    });

    if (_user) {
      //get paramter password
      // let password = obj.password;
      // //authenticate user
      // let result = Accounts._checkPassword(_user, password);
      // if (result.error) {
      //   return result.error;
      // } else {

      //   if(result.userId) {
          const stampedLoginToken = Accounts._generateStampedLoginToken();
          // Accounts._insertLoginToken(_user._id, stampedLoginToken);
          return {
            userId: _user._id,
            token: stampedLoginToken.token
          };
          
        // }
      // }
    } else {
      //if user is not found
      return {
        error: "User not found"
      }
    }

  },

  //-- This is called from syncing user pasword real-time 
  //-- from App site when users reset their password.
  //-- DDP.setPassword did not work, so, we encapsulate 
  //-- Accounts.setPassword with this method.
  "Users.remoteSetPwd"(obj) {
    
      if(Meteor.isServer) {

        try { 

          check(obj, {
              uid: String,
              password: String
          })        

          return new Promise((resolve, reject) => {

              if(obj.uid && obj.password) {
                  Accounts.setPassword(obj.uid, obj.password, (err) => {
                      if(err) {
                          resolve({success: false})
                      } else {
                          resolve({success: true})
                      }
                  })
              } else {
                  resolve({success: false})
              }
          })
        } catch(e) {
            console.log( "Cannot get result data...", e )
        }  
      }
  }   


})
