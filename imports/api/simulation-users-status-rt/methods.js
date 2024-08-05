import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { SimUsersSummary } from '/imports/api/sim-users-summary/sim-users-summary.js';
import { SimulationUsersStatusRT } from './simulation-users-status-rt.js'

Meteor.methods({
  'ETL.SimUsersStatusRT.createStatusByDate'() {
    // this.unblock()

    let output = Meteor.wrapAsync((args, callback) => {

      let _sus = SimUsersSummary.find({
        roleKey: '6',
        status: { $ne: 'Deleted'},
        clientId: { $nin: ['vSdyAWPw3karCYYci', 'KsYuWQY6XkrNYHPEX', 'bbtvfcNXoNumsQtwo'] }, //-- [Client 1, Client 2, Demo]
        simulationId: { $gt: 0 }
      }).fetch()

      if(_sus) {
        _sus.forEach((s) => {

          let
            status = null,
            statusAt = null,
            resultStage = s.resultStage,
            simStatus = s.simStatus

          let _o = {
            clientId: s.clientId,
            buId: s.buId,
            simulationId: s.simulationId,
            userId: s.userId,
            checked: s.checked || null,
            asmtId: s.assessmentId || null,
            status: status,
            statusAt: statusAt
          }

          if(resultStage && resultStage === 'Distributed') {
            _o.status = resultStage
            _o.statusAt = s.distributedAt || null

            SimulationUsersStatusRT.insert(_o)

            if(s.exportedAt) {
              _o.status = "Exported"
              _o.statusAt = s.exportedAt

              SimulationUsersStatusRT.insert(_o)
            }

            if(s.publishedAt) {
              _o.status = "Published"
              _o.statusAt = s.publishedAt

              SimulationUsersStatusRT.insert(_o)
            }

            if(s.submittedAt) {
              _o.status = "Submitted"
              _o.statusAt = s.submittedAt

              SimulationUsersStatusRT.insert(_o)
            }

            if(s.startedAt || s.oStartedAt) {
              _o.status = "Started"
              _o.statusAt = s.startedAt || s.oStartedAt

              SimulationUsersStatusRT.insert(_o)
            }

            if(s.createdAt) {
              _o.status = "Assigned"
              _o.statusAt = s.createdAt

              SimulationUsersStatusRT.insert(_o)
            }                                                

          }
          else if(resultStage && resultStage === 'Exported') {
            _o.status = resultStage
            _o.statusAt = s.exportedAt || null

            SimulationUsersStatusRT.insert(_o)

            if(s.publishedAt) {
              _o.status = "Published"
              _o.statusAt = s.publishedAt

              SimulationUsersStatusRT.insert(_o)
            }

            if(s.submittedAt) {
              _o.status = "Submitted"
              _o.statusAt = s.submittedAt

              SimulationUsersStatusRT.insert(_o)
            }

            if(s.startedAt || s.oStartedAt) {
              _o.status = "Started"
              _o.statusAt = s.startedAt || s.oStartedAt

              SimulationUsersStatusRT.insert(_o)
            }

            if(s.createdAt) {
              _o.status = "Assigned"
              _o.statusAt = s.createdAt

              SimulationUsersStatusRT.insert(_o)
            }

          }
          else if(resultStage && resultStage === 'Published') {
            _o.status = resultStage
            _o.statusAt = s.publishedAt || null

            SimulationUsersStatusRT.insert(_o)

            if(s.submittedAt) {
              _o.status = "Submitted"
              _o.statusAt = s.submittedAt

              SimulationUsersStatusRT.insert(_o)
            }

            if(s.startedAt || s.oStartedAt) {
              _o.status = "Started"
              _o.statusAt = s.startedAt || s.oStartedAt

              SimulationUsersStatusRT.insert(_o)
            }

            if(s.createdAt) {
              _o.status = "Assigned"
              _o.statusAt = s.createdAt

              SimulationUsersStatusRT.insert(_o)
            }

          }
          // else if(resultStage && resultStage === 'Scoring') {
          //   status = resultStage
          //   statusAt = s.modifiedAt || null
          // }        
          else if(simStatus && simStatus === 'Completed') {
            _o.status = 'Submitted'
            _o.statusAt = s.submittedAt || null

            SimulationUsersStatusRT.insert(_o)

            if(s.startedAt || s.oStartedAt) {
              _o.status = "Started"
              _o.statusAt = s.startedAt || s.oStartedAt

              SimulationUsersStatusRT.insert(_o)
            }

            if(s.createdAt) {
              _o.status = "Assigned"
              _o.statusAt = s.createdAt

              SimulationUsersStatusRT.insert(_o)
            }

          }
          else if(simStatus && simStatus === 'In Progress') {
            _o.status = "Started"
            _o.statusAt = s.startedAt || s.oStartedAt

            SimulationUsersStatusRT.insert(_o)

            if(s.createdAt) {
              _o.status = "Assigned"
              _o.statusAt = s.createdAt

              SimulationUsersStatusRT.insert(_o)
            }

          }
          else if(simStatus && simStatus === 'Assigned') {

            if(s.createdAt) {
              _o.status = simStatus
              _o.statusAt = s.createdAt

              SimulationUsersStatusRT.insert(_o)
            }
          }               

        })
      }

      callback(null, {success: true})

    })


    let result = output('dq')

    if(result) {
      return result
    }
  }  
})
