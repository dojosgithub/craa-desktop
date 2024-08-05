import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

const XLSX = require('xlsx');

import { Util } from '/imports/lib/server/util.js'

import { TrainingModules } from '/imports/api/training/training-modules/training-modules.js'
import { TrainingModuleUserLogs } from '/imports/api/training/training-module-user-logs/training-module-user-logs.js';

Meteor.methods({
  'TraineeLog.export'(user) {
    check(user, {
      uid: String,
      sid: Number,
      cid: String,
      buid: String,
      client: String
    })

    let _modules = TrainingModules.find({
      status: 1
    }).fetch()

    let _modulesHash = []

    if(_modules && _modules.length > 0) {
      _modules.forEach((m) => {
        _modulesHash[m._id] = m.name
      })
    }

    let log = TrainingModuleUserLogs.find({
      'uid': user.uid
    }, {
      sort: {
        cAt: 1        
      }
    }).fetch()

    if(log && log.length > 0) {

      let fullname = ''

      let output = Meteor.wrapAsync((args, callback) => {

        let data = [["Lastname", "Fistname", "Email", "Client", "Module", "Venue", "Item/Action", "Page", "IP", "Date [UTC]"]]

        log.forEach((l) => {

          if(l.firstname) {
            fullname = l.firstname + ' ' + l.lastname
          } 

          let module = _modulesHash[l.mid]

          let _log = [l.lastname, l.firstname, l.email,l.client+'-'+l.bu, module, l.venue, l.msg, l.page, l.ip, Util.dateHMS2(l.cAt)]

          data.push(_log)

        })

        const ws = XLSX.utils.aoa_to_sheet(data);
        // const wb = {SheetNames: ["Trainee: " + fullname], Sheets:{"Trainee Log":ws }};
        const wb = {SheetNames: ["Trainee Log"], Sheets:{"Trainee Log": ws }};

        callback(null, {success: true, data: wb})
      })

      let result = output('dk')

      if(result) {
        return result
      }       
    } else {
      return {success: false}
    }

  },
})
