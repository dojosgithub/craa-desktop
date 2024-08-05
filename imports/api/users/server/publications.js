import { check } from 'meteor/check'

import '/imports/lib/server/util.js'

import { V1Users } from '../users.js';

// Meteor.publish('craa_admin_users', () => {
//   return Meteor.users.find({
//     $where: "this.profile.role < 3 && this.profile.status == 1" 
//   }, {
//     fields: {
//       "profile.fullname": 1,
//     }
//   })
// })

// Meteor.publish('craa_admin_users', () => {
//   return Meteor.users.aggregate({
//     $where: "this.profile.role < 3 && this.profile.status == 1" 
//   }, {
//     $project: {
//       // "profile.fullname": 1,
//       "fullname": "$profile.fullname"
//     }
//   })
// })

// Meteor.publish('users', function() {
//   return Meteor.users.find({
//     'profile.status': 1
//   })
// })

Meteor.publish('craa_admin_users', function() {
  // ReactiveAggregate(this, Meteor.users, [{    
  //   $match: {
  //     'profile.role': '2',
  //     'profile.status': 1
  //   }
  // }
  // , {
  //   $project: {
  //     "fullname": "$profile.fullname"
  //   }
  // }, {
  //   $sort: {
  //     fullname: 1
  //   }
  // }], { cursor: {} })
  return Meteor.users.find({
      'profile.role': '2',
      'profile.status': 1    
    }, {
      fileds: {
        'profile.fullname': 1
      },
      $sort: {
        'profile.firstname': 1
      }
    })
})

Meteor.publish('craa_scorers', function() {
  return Meteor.users.find({
    $or: [
      {'profile.role': '2'},
      {'profile.role': '7'}
    ],
    'profile.status': 1
  }, {
    fields: {
      'profile.firstname': 1,
      'profile.lastname': 1,
      'profile.fullname': 1,
      'profile.role': 1,
      'profile.status': 1,
      'profile.workload': 1
    },
    sort: { 'profile.firstname': 1 }
  })
})

Meteor.publish('all_assessee_users_fullnames0', function() {
  return Meteor.users.find({
    'profile.role': '6',
    'profile.status': {$ne: 4}
  }, {
    fields: {'profile.fullname': 1}
  })
})

Meteor.publish('all_assessee_users_fullnames', function() {
  // ReactiveAggregate(this, Meteor.users, [{    
  //   $match: {
  //     'profile.role': '6',
  //     'profile.status': {$ne: 4}
  //   }
  // }
  // , {
  //   $project: {
  //     "title": "$profile.fullname"
  //   }
  // }], {cursor:{}})
  return Meteor.users.find({
    'profile.role': '6',
    'profile.status': {$ne: 4}
  }, {
    fields: {
      'profile.fullname': 1
    }
  })  
})
