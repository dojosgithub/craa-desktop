import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { SimUsersSummary } from '/imports/api/sim-users-summary/sim-users-summary.js';
import { SimulationUsersStatus } from './simulation-users-status.js'

Meteor.methods({
  'ETL.SimUsersStatus.createStatusByDate'() {
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

            SimulationUsersStatus.insert(_o)

            if(s.exportedAt) {
              _o.status = "Exported"
              _o.statusAt = s.exportedAt

              SimulationUsersStatus.insert(_o)
            }

            if(s.publishedAt) {
              _o.status = "Published"
              _o.statusAt = s.publishedAt

              SimulationUsersStatus.insert(_o)
            }

            if(s.submittedAt) {
              _o.status = "Submitted"
              _o.statusAt = s.submittedAt

              SimulationUsersStatus.insert(_o)
            }

            if(s.startedAt || s.oStartedAt) {
              _o.status = "Started"
              _o.statusAt = s.startedAt || s.oStartedAt

              SimulationUsersStatus.insert(_o)
            }

            if(s.createdAt) {
              _o.status = "Assigned"
              _o.statusAt = s.createdAt

              SimulationUsersStatus.insert(_o)
            }                                                

          }
          else if(resultStage && resultStage === 'Exported') {
            _o.status = resultStage
            _o.statusAt = s.exportedAt || null

            SimulationUsersStatus.insert(_o)

            if(s.publishedAt) {
              _o.status = "Published"
              _o.statusAt = s.publishedAt

              SimulationUsersStatus.insert(_o)
            }

            if(s.submittedAt) {
              _o.status = "Submitted"
              _o.statusAt = s.submittedAt

              SimulationUsersStatus.insert(_o)
            }

            if(s.startedAt || s.oStartedAt) {
              _o.status = "Started"
              _o.statusAt = s.startedAt || s.oStartedAt

              SimulationUsersStatus.insert(_o)
            }

            if(s.createdAt) {
              _o.status = "Assigned"
              _o.statusAt = s.createdAt

              SimulationUsersStatus.insert(_o)
            }

          }
          else if(resultStage && resultStage === 'Published') {
            _o.status = resultStage
            _o.statusAt = s.publishedAt || null

            SimulationUsersStatus.insert(_o)

            if(s.submittedAt) {
              _o.status = "Submitted"
              _o.statusAt = s.submittedAt

              SimulationUsersStatus.insert(_o)
            }

            if(s.startedAt || s.oStartedAt) {
              _o.status = "Started"
              _o.statusAt = s.startedAt || s.oStartedAt

              SimulationUsersStatus.insert(_o)
            }

            if(s.createdAt) {
              _o.status = "Assigned"
              _o.statusAt = s.createdAt

              SimulationUsersStatus.insert(_o)
            }

          }
          // else if(resultStage && resultStage === 'Scoring') {
          //   status = resultStage
          //   statusAt = s.modifiedAt || null
          // }        
          else if(simStatus && simStatus === 'Completed') {
            _o.status = 'Submitted'
            _o.statusAt = s.submittedAt || null

            SimulationUsersStatus.insert(_o)

            if(s.startedAt || s.oStartedAt) {
              _o.status = "Started"
              _o.statusAt = s.startedAt || s.oStartedAt

              SimulationUsersStatus.insert(_o)
            }

            if(s.createdAt) {
              _o.status = "Assigned"
              _o.statusAt = s.createdAt

              SimulationUsersStatus.insert(_o)
            }

          }
          else if(simStatus && simStatus === 'In Progress') {
            _o.status = "Started"
            _o.statusAt = s.startedAt || s.oStartedAt

            SimulationUsersStatus.insert(_o)

            if(s.createdAt) {
              _o.status = "Assigned"
              _o.statusAt = s.createdAt

              SimulationUsersStatus.insert(_o)
            }

          }
          else if(simStatus && simStatus === 'Assigned') {

            if(s.createdAt) {
              _o.status = simStatus
              _o.statusAt = s.createdAt

              SimulationUsersStatus.insert(_o)
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
  },
  'ETL.SimUsersStatus.updateStatusByDate'() {
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

          let _init = {
            clientId: s.clientId,
            buId: s.buId,
            simulationId: s.simulationId,
            userId: s.userId,
            asmtId: s.assessmentId || null           
          }

          let _update = {
            checked: true,
            status: status
          }

          if(resultStage && resultStage === 'Distributed') {
            _update.status = resultStage
            _init.statusAt = s.distributedAt || null

            // SimulationUsersStatus.insert(_o)
            SimulationUsersStatus.upsert(_init, {
              $set: _update
            })

            if(s.exportedAt) {
              _update.status = "Exported"
              _init.statusAt = s.exportedAt

              SimulationUsersStatus.upsert(_init, {
                $set: _update
              })              
            }

            if(s.publishedAt) {
              _update.status = "Published"
              _init.statusAt = s.publishedAt

              SimulationUsersStatus.upsert(_init, {
                $set: _update
              })              
            }

            if(s.submittedAt) {
              _update.status = "Submitted"
              _init.statusAt = s.submittedAt

              SimulationUsersStatus.upsert(_init, {
                $set: _update
              })              
            }

            if(s.startedAt || s.oStartedAt) {
              _update.status = "Started"
              _init.statusAt = s.startedAt || s.oStartedAt

              SimulationUsersStatus.upsert(_init, {
                $set: _update
              })              
            }

            if(s.createdAt) {
              _update.status = "Assigned"
              _init.statusAt = s.createdAt

              SimulationUsersStatus.upsert(_init, {
                $set: _update
              })              
            }                                                

          }
          else if(resultStage && resultStage === 'Exported') {
            _update.status = resultStage
            _init.statusAt = s.exportedAt || null

              SimulationUsersStatus.upsert(_init, {
                $set: _update
              })            

            if(s.publishedAt) {
              _update.status = "Published"
              _init.statusAt = s.publishedAt

              SimulationUsersStatus.upsert(_init, {
                $set: _update
              })              
            }

            if(s.submittedAt) {
              _update.status = "Submitted"
              _init.statusAt = s.submittedAt

              SimulationUsersStatus.upsert(_init, {
                $set: _update
              })              
            }

            if(s.startedAt || s.oStartedAt) {
              _update.status = "Started"
              _init.statusAt = s.startedAt || s.oStartedAt

              SimulationUsersStatus.upsert(_init, {
                $set: _update
              })              
            }

            if(s.createdAt) {
              _update.status = "Assigned"
              _init.statusAt = s.createdAt

              SimulationUsersStatus.upsert(_init, {
                $set: _update
              })              
            }

          }
          else if(resultStage && resultStage === 'Published') {
            _update.status = resultStage
            _init.statusAt = s.publishedAt || null

              SimulationUsersStatus.upsert(_init, {
                $set: _update
              })            

            if(s.submittedAt) {
              _update.status = "Submitted"
              _init.statusAt = s.submittedAt

              SimulationUsersStatus.upsert(_init, {
                $set: _update
              })              
            }

            if(s.startedAt || s.oStartedAt) {
              _update.status = "Started"
              _init.statusAt = s.startedAt || s.oStartedAt

              SimulationUsersStatus.upsert(_init, {
                $set: _update
              })              
            }

            if(s.createdAt) {
              _update.status = "Assigned"
              _init.statusAt = s.createdAt

              SimulationUsersStatus.upsert(_init, {
                $set: _update
              })              
            }

          }
          // else if(resultStage && resultStage === 'Scoring') {
          //   status = resultStage
          //   statusAt = s.modifiedAt || null
          // }        
          else if(simStatus && simStatus === 'Completed') {
            _update.status = 'Submitted'
            _init.statusAt = s.submittedAt || null

              SimulationUsersStatus.upsert(_init, {
                $set: _update
              })            

            if(s.startedAt || s.oStartedAt) {
              _update.status = "Started"
              _init.statusAt = s.startedAt || s.oStartedAt

              SimulationUsersStatus.upsert(_init, {
                $set: _update
              })              
            }

            if(s.createdAt) {
              _update.status = "Assigned"
              _init.statusAt = s.createdAt

              SimulationUsersStatus.upsert(_init, {
                $set: _update
              })              
            }

          }
          else if(simStatus && simStatus === 'In Progress') {
            _update.status = "Started"
            _init.statusAt = s.startedAt || s.oStartedAt

              SimulationUsersStatus.upsert(_init, {
                $set: _update
              })            

            if(s.createdAt) {
              _update.status = "Assigned"
              _init.statusAt = s.createdAt

              SimulationUsersStatus.upsert(_init, {
                $set: _update
              })              
            }

          }
          else if(simStatus && simStatus === 'Assigned') {

            if(s.createdAt) {
              _update.status = simStatus
              _init.statusAt = s.createdAt

              SimulationUsersStatus.upsert(_init, {
                $set: _update
              })              
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
