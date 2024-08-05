import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Promise } from 'meteor/promise'

Meteor.methods({
  "Users.workload.status.update"(obj) {
    check( obj, {
      _id: String,
      status: String,
      score: Match.Optional(Match.OneOf(undefined, null, Number))
    });
    // this.unblock();

    let output = Meteor.wrapAsync((simObj, callback) => {

      let $_set = {
        'profile.workload.status': obj.status
      };

      let _assessorUsers = Meteor.users.find({
        'profile.status': 1,
        'profile.role': '7'
      }).fetch();

      if(_assessorUsers && _assessorUsers.length > 0) {

          let 
              _count = 0,
              _osaat = false;
          if(_assessorUsers && _assessorUsers.length > 0) {
              _assessorUsers.forEach((s) => {
                  if(s.profile.workload) {
                      if(s.profile.workload.osaat) {
                          _count++;
                      }
                  }
              });
          };

          if(_count > 1) {
              _osaat = true;
          }

          $_set['profile.workload.osaat'] = _osaat;

          if(obj.score > 0) {

          } else {
            $_set['profile.workload.score'] = 0;
          }
      }

      let _updated = Meteor.users.update(obj._id, {
        $set: $_set
      }, (err) => {
        
        if(err) {
          callback(null, {success: false, data: 0 });  
        } else {
          callback(null, {success: true, data: 1 });
        }
        
      });      

    });

    let result = output('dq');

    if(result) {
      // console.log(result);
      return result;
    }    
  },
  "Users.workload.waivedSims.update"(obj) {
    check( obj , {
      uid: String,
      waivedSims: Array
    });
    // this.unblock();

    let output = Meteor.wrapAsync((simObj, callback) => {
      let _updated = Meteor.users.update(obj.uid, {
        $set: {
          'profile.workload.waived': obj.waivedSims
        }
      }, (err) => {
        
        if(err) {
          callback(null, {success: false, data: 0 });  
        } else {
          callback(null, {success: true, data: 1 });
        }
        
      });      

    });

    let result = output('dq');

    if(result) {
      // console.log(result);
      return result;
    }

  },
  "Users.workload.lastScored.update"(obj) {
    check( obj , {
      uid: String,
      lastScored: {
        assessmentId: String,
        simulationId: Number,
        simulationName: String,
        scoredAt: Date
      }
    });
    // this.unblock();

    let output = Meteor.wrapAsync((simObj, callback) => {
      let _updated = Meteor.users.update(obj.uid, {
        $set: {
          'profile.workload.lastScored': obj.lastScored
        }
      }, (err) => {
        
        if(err) {
          callback(null, {success: false, data: 0 });  
        } else {
          callback(null, {success: true, data: 1 });
        }
        
      });      

    });

    let result = output('dq');

    if(result) {
      // console.log(result);
      return result;
    }
  },
  "Users.workload.buffer.update"(obj) {
    check( obj , {
      uid: String,
      buffer: String,
      score: String
    });
    // this.unblock();    

    // let _buffer = Math.round(obj.buffer * 100) / 100;
    let 
      _buffer = parseFloat(obj.buffer),
      _score = parseFloat(obj.score),
      _nScore = _buffer * _score;

    // console.log(_buffer)
    let output = Meteor.wrapAsync((simObj, callback) => {
      let _updated = Meteor.users.update(obj.uid, {
        $set: {
          'profile.workload.buffer': _buffer
          // 'profile.workload.score': _nScore //-- let's apply buffer for the newly assigned sims
        }
      }, (err) => {
        
        if(err) {
          callback(null, {success: false, data: 0 });  
        } else {
          callback(null, {success: true, data: 1 });
        }
        
      });      

    });

    let result = output('dq');

    if(result) {
      // console.log(result);
      return result;
    }
  },
  "Users.workload.reset.update"(obj) {
    check( obj , {
      uid: String,
      workload: String
    });
    // this.unblock();    
    
    let 
      _workloadScore = parseFloat(obj.workload);
    
    let output = Meteor.wrapAsync((simObj, callback) => {
      let _updated = Meteor.users.update(obj.uid, {
        $set: {          
          'profile.workload.score': _workloadScore
        }
      }, (err) => {
        
        if(err) {
          callback(null, {success: false, data: 0 });  
        } else {
          callback(null, {success: true, data: 1 });
        }
        
      });      

    });

    let result = output('dq');

    if(result) {
      // console.log(result);
      return result;
    }
  },
  "Users.workload.oneSimAtATime.update"(obj) {
    check( obj, {
      osaat: Boolean
    });
    // this.unblock();

    let output = Meteor.wrapAsync((simObj, callback) => {
      let _updated = Meteor.users.update({
        'profile.role': '7'
      }, {
        $set: {          
          'profile.workload.osaat': obj.osaat
        }
      }, { multi: true }, (err) => {
        
        if(err) {
          callback(null, {success: false, data: 0 });  
        } else {
          callback(null, {success: true, data: 1 });
        }
        
      });      

    });

    let result = output('dq');

    if(result) {
      // console.log(result);
      return result;
    }    
  }    
})
