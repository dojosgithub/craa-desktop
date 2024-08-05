import { check } from 'meteor/check';

import { UserComparison } from './user-comparison.js';

Meteor.methods({
  "UserComparison.upsert"(users) {
    check(users, {
      user1: String,
      user2: String,
      sid: Number,
      cpKey: String,
      cpValue: Boolean,
      admin: String 
    })

    // this.unblock()

    // let cpObj = {
    //   source: users.user1,
    //   target: users.user2,
    //   simulationId: users.sid,
    //   cpKey: users.cpKey,
    //   cpValue: users.cpValue,
    //   createdAt: new Date,
    //   modifiedAt: new Date
    // }

    return UserComparison.upsert({
      cpKey: users.cpKey
    }, {
      $setOnInsert: {
        source: users.user1,
        target: users.user2,
        simulationId: users.sid,
        cpKey: users.cpKey,
        createdAt: new Date        
      },
      $set: {
        cpValue: users.cpValue,        
        modifiedAt: new Date
      },
      $addToSet: { admins: users.admin }
    })
  }
})
