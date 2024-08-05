import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Logs } from './logs.js'

Meteor.methods({
    logger: function(log) {
      check(log, Object);
      
        // this.unblock();
        
        // if(log.user && log.user._id !== "RhCKr4BuKdt3f3GTs") {
        if(log.user && log.user.profile.role !== "1") {
          log.ip = this.connection.clientAddress;
            log.appPath = "desktop";
            log.createdAt = new Date();   

            if(log.user._id) { //-- Let's reduce the size of user data to store (dk, 04/27/2017)
                log.user = log.user._id;      
            }
            return Logs.insert(log);
        }        
    },
    "ETL.Logs.reduceUserFiled"() {
        // this.unblock()

        let output = Meteor.wrapAsync((args, callback) => {
            // var mapFn = function () {

            //     if (this.user && this.user._id) {
            //         emit(this.user, this.user._id);
            //     }
            // };

            // var reduceFn = function (key, value) {
            //     // return geoip.lookup(value)
            //     // return _geoip(value)
            //     this.user = value 

            //     return this.user
            // };

            // let _logsUpdate = Logs.mapReduce(mapFn, reduceFn, query: {
            //     "user._id": { $exists: true}
            // }, {
            //     out: 
            // })

            let _logs = Logs.find({
                "user._id": { $exists: true}
            }).fetch()

            if(_logs && _logs.length > 0) {

                _logs.forEach((m, i) => {

                    let _logsUpdate = Logs.update(m._id, {
                        $set: {
                            user: m.user._id
                        }
                    })

                    if(i === _logs.length -1) {
                        callback(null, {success: true})
                    }

                })
            }

            // let _logsUpdate = Logs.update({
            //     "user._id": { $exists: true}
            // }, {
            //     $set: 
            // })


        })

        let result = output('dq')

        if(result) {
          return result
        }
        
    }
});

