const XLSX = require('xlsx');

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

Meteor.methods({
  "EmailManager.update.email"(emailObj) {
    check(emailObj, {
      source: String,
      target: String,
      sendVerificationMessage: Boolean
    })
    // this.unblock()

    let user = Meteor.users.findOne({
      'emails.address': emailObj.source
    })

    if(user && user._id) {

      let output = Meteor.wrapAsync((inputObj, callback) => {
        let emails = [
          {address: inputObj.target, verified: inputObj.verified},
          {address: inputObj.source, verified: inputObj.verified},          
        ] 

        let isUpdated = Meteor.users.update(inputObj.uid, {
          $set: {
            emails: emails,
            modifiedAt: new Date
          }
        })

        inputObj.sent = false
        if(inputObj.verified) {
          //-- do nothing?
        } else {

          if(inputObj.sendVerificationMessage) {
            if(process.env.NODE_ENV === "production") {
              Accounts.sendVerificationEmail(user._id);
            }
            inputObj.sent = true 
          }
        }

        callback(null, inputObj)
      })

      let inputObj = {
        uid: user._id,
        fullname: user.profile.fullname,
        source: emailObj.source,
        target: emailObj.target,
        verified: user.emails[0].verified,
        sendVerificationMessage: emailObj.sendVerificationMessage
      }

      let result = output(inputObj)

      if(result) {
        return result
      }       
    }
  },  
  'EmailManager.import'(bstr, name) {
    /* read the data and return the workbook object to the frontend */

    let users = Meteor.users.find({
      'profile.status': {$ne: 4}
    }, {
      fields: {
        _id: 1,
        'profile.firstname': 1,
        'profile.lastname': 1,      
        'emails': 1
      }
    }).fetch()

    // return XLSX.read(bstr, {type:'binary'});
    let excel = XLSX.read(bstr, {type:'binary'});

    return {excel: excel, users: users}
  },
//   'EmailManager.update.emails'(emailObj) {
//     check(emailObj, {
//       data: Array,
//       users: Array,
//       sendVerificationMessage: Boolean
//     })
    // this.unblock()

//     let
//       length = emailObj.data.length-1, //-- exclude the last null row data 
//       i = 0,
//       users = [],
//       updatedEmails = []

//     if(emailObj.users && emailObj.users.length > 0) {
//       emailObj.users.forEach((u) => {
//         let 
//           e = u.e,
//           v = u.v

//         users[u.e] = {_id: u._id, v: u.v}
//       })
//     }
// // console.log(emailObj, users)
//     let output = Meteor.wrapAsync((args, callback) => {
//       let 
//         emailObj = args.emailObj,
//         users = args.users

//       if(emailObj.data.length > 0) {
//         emailObj.data.forEach((e) => {
// // console.log('e', e)
//           if(e[0]) {
//             i++
//             let emails = [
//               {address: e[1], verified: false},
//               {address: e[0], verified: users[e[0]] && users[e[0]].v || false}
//             ]

//             let ___update = {
//               $set: {
//                 emails: emails,
//                 modifiedAt: new Date
//               }
//             }
//             // let _$rename = {}

//             if(emailObj.sendVerificationMessage) {
//               ___update['$rename'] = {
//                   "profile.activatedAt": "profile.activatedAt_" + new Date(),
//                   "profile.verifiedAt": "profile.verifiedAt_" + new Date(),
//                   "services.email.activatedAt": "services.email.activatedAt_"+ new Date(),
//                   "services.email.verifiedAt": "services.email.verifiedAt_"+ new Date()
//               }            
//             }

//             let uid = Meteor.users.update({
//               'emails.0.address': e[0]            
//             }, ___update) 

//             if(uid === 1) {
//               updatedEmails.push(e[1])
//             }
            
//             if(emailObj.sendVerificationMessage) {
//               if(users[e[0]]) {
//                 // console.log('id', users[e[0]]._id)
//                 Accounts.sendVerificationEmail(users[e[0]]._id);
//               }
//               // Accounts.sendVerificationEmail(users[e[0]]._id);
//             }

//             if(i === length) {
//               callback(null, updatedEmails)
//             }
//           }

//         })
//       }
//     })

//     let inputObj = {
//       emailObj: emailObj,
//       users: users
//     }
//     let result = output(inputObj)

//     if(result) {
//       return result
//     }    
//   }
})
