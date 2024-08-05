import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { Promise } from 'meteor/promise'

import { Util } from '/imports/lib/server/util.js'

import { SimUsersSummary } from '/imports/api/sim-users-summary/sim-users-summary.js'
import { SimulationSettings } from '/imports/api/simulation-settings/simulation-settings.js'

import { TrainingModuleScores } from '/imports/api/training/training-module-scores/training-module-scores.js';
import { TrainingModuleScoreSummary } from '/imports/api/training/training-module-scores/training-module-score-summary.js';
import { TrainingModuleUserStats } from '/imports/api/training/training-module-user-stats/training-module-user-stats.js';
import { TrainingModuleUserLogs } from '/imports/api/training/training-module-user-logs/training-module-user-logs.js';

Meteor.methods({
  'ETL.Training.QuizScoreSummary'() {

    let output = Meteor.wrapAsync((args, callback) => {

      // let 
        // rawScores = TrainingModuleScores.rawCollection(),
        // aggregateQueryScores = Meteor.wrapAsync(rawScores.aggregate, rawScores)
      
      let pipelineScores = 
      [
        // {
        //   $lookup: {
        //     from: "sim_users_summary",
        //     localField: "userId",
        //     foreignField: "userId",
        //     as: "sus"
        //   }   
        // },      
        {
          $group: {
            "_id": {
              uid: "$userId",
              moduleId: "$moduleId",
              feedback: "$feedback"                          
            },
            // clientId: {$first: "$sus.clientId"},
            count: { "$sum": 1 }
          }   
        },
        // {
        //   $lookup: {
        //     from: "sim_users_summary",
        //     localField: "userId",
        //     foreignField: "userId",
        //     as: "sus"
        //   }   
        // },
        // {
        //   $unwind: "$sus"
        // },
        {
         $project: {
            _id: 0,          
            uid: "$_id.uid",
            moduleId: "$_id.moduleId",
            feedback: "$_id.feedback",
            // clientId: "$clientId",
            count: 1          
          }        
        }
      ]

      // let _scores = aggregateQueryScores(pipelineScores)
      let _scores = Promise.await(TrainingModuleScores.rawCollection().aggregate(pipelineScores).toArray());

      let 
        _scoresDict = [],
        _scoreData = []

      if(_scores && _scores.length > 0) {        

        _scores.forEach((s, i) => {
          let _sKey = s.uid + '-' + s.moduleId

          if(!_scoresDict[_sKey]) {
            _scoresDict[_sKey] = {
              uid: s.uid,
              moduleId: s.moduleId,
              // clientId: s.clientId
              correct: 0,
              wrong: 0,
              total: 0,
              percent: 0,
              sid: null
            }
          }

          if(s.feedback) {
            if(s.feedback === "correct") {
              _scoresDict[_sKey].correct = s.count
            } else {
              _scoresDict[_sKey].wrong = s.count
            }

             _scoresDict[_sKey].total += s.count

            if(_scoresDict[_sKey].total > 0) {
              _scoresDict[_sKey].percent 
                = Math.floor(_scoresDict[_sKey].correct/_scoresDict[_sKey].total *100)
            }
          }
          
        })

        if(_scoresDict) {
          // Object.entries(_scoresDict).forEach(([k, v]) => {            
          //   _scoreData.push(v)
          // })
          Object.values(_scoresDict).forEach((v) => {            
            // _scoreData.push(v)
            
            TrainingModuleScoreSummary.upsert({
              userId: v.uid,
              moduleId: v.moduleId
            }, {
              $setOnInsert: {
                createdAt: new Date
              },
              $set: {
                correct: v.correct,
                wrong: v.wrong,
                total: v.total,
                percent: v.percent,
                modifiedAt: new Date
              }
            })

            // SimUsersSummary.update({
            //   userId: v.uid,
            //   training
            // })

            let _su = SimUsersSummary.findOne({
              userId: v.uid,              
            }, {
              fields: {
                buId: 1
              }
            })

            if(_su) {
              // console.log(v.moduleId)
              let _ss = SimulationSettings.findOne({                
                bu_id: _su.buId,
                // simulation_id: { $in: ['16','18','21','22','25','28','34','35','36','37']},
                training_modules: v.moduleId
              })
// console.log(_ss)
              if(_ss) {
                v['sid'] = _ss.simulation_id

                let _susUpdate = SimUsersSummary.update({
                  userId: v.uid,
                  buId: _su.buId,
                  simulationId: parseInt(_ss.simulation_id)
                }, {
                  $set: {
                    trainingQuiz: {
                      moduleId: v.moduleId,
                      total: v.total,
                      correct: v.correct,
                      wrong: v.wrong,
                      percent: v.percent
                    }
                  }
                })
// console.log(v.uid, _su.buId, parseInt(_ss.simulation_id), _susUpdate)                
              }
              _scoreData.push(v)
            }

          }) 
        }
      }

      callback(null, {success: true, data: _scoreData})
    })

    let result = output('dk')

    if(result) {
      return result
    }
  },
  'ETL.Training.SimulationAssignDate'() {

    let output = Meteor.wrapAsync((args, callback) => {

      let 
        fusIds = [16,18,21,22,25,28,34,35,36,37],
        fusStringIds = ['16','18','21','22','25','28','34','35','36','37']

      let _SSs = SimulationSettings.find({
        simulation_id: { $in: fusStringIds },
        training_modules: { $exists: true }
      }).fetch()

// console.log(_SSs)
      
      let 
        _ssDict = [],
        _ssDone = []
      
      if(_SSs && _SSs.length > 0) {
        _SSs.forEach((ss) => {
          if(ss.training_modules && ss.training_modules.length > 0) {
            ss.training_modules.forEach((t) => {
              if(t) {
                // _ssDict[t] = ss.simulation_id
                _ssDict[ss.simulation_id] = t
              }
            })
          }
        })
      }

      let _allSUSs = SimUsersSummary.find({        
        roleKey: '6',
        createdAt: {$exists: false}
      }).fetch()

      if(_allSUSs && _allSUSs.length > 0) {
        _allSUSs.forEach((s) => {

          //-- this sim has a training module linked (meainng it's FUS), 
          //-- so, this sim/user may possibly have its TR record
          if(_ssDict[s.simulationId]) {
            let moduleId = _ssDict[s.simulationId]

            // let trQuizScore = TrainingModuleScores.findOne({
            //   userId: s.userId,
            //   moduleId: moduleId
            // })

            let trUserStats = TrainingModuleUserStats.findOne({
              userId: s.userId,
              moduleId: moduleId
            })

            let completionDate = null

            if(trUserStats) { //-- if the FUS user has a TR record
              //-- the FUS assign date should be in the TrainingModuleUserLogs
              let trUserLog = TrainingModuleUserLogs.findOne({
                uid: s.userId,
                mid: moduleId,
                msg: 'sim assigned'
              })

              if(trUserLog && trUserLog.cAt) { //-- this can be TR Module completion & FUS sim assign date
                completionDate = trUserLog.cAt
              } else {
                if(trUserStats.completedAt) {
                  completionDate = trUserStats.completedAt[0] || null
                }
              }

              SimUsersSummary.update({
                _id: s._id,
                createdAt: { $exists: false }
              }, {
                $set: {
                  createdAt: completionDate              
                }
              })              

            } 
            //-- if the FUS user has no TR record, this FUS must have 
            //-- been created manually or something like that...
            else {
              addDateAssigned(s._id, parseInt(s.simulationId), s.userId)
            }
          } //-- if(_ssDict[s.simulationId])

          else { //-- if this sim has no TR module at all
            addDateAssigned(s._id, parseInt(s.simulationId), s.userId)            
          }

          // _ssDone.push(s._id)


        }) //-- _allSUSs.forEach((s)
      }

      callback(null, {success: true, data: _ssDone})
    })

    let result = output('dk')

    if(result) {
      return result
    }
  }  
})

function addDateAssigned(ssId, simulationId, userId) {
  let _user = Meteor.users.findOne(userId)

  if(_user) {
    _user.profile.clients.forEach((c) => {
      if(c.bus) {
        c.bus.forEach((b) => {
          if(b.simulations) {
            b.simulations.forEach((_s) => {
              // if(_s.checked && _s.id === parseInt(simulationId)) {
              if(_s.id === parseInt(simulationId)) { //-- even though it's not checked
                if(_s.addedAt) { //-- add the date if it has addedAt data, this'd be once the sim was assigned to the user, but removed later
                  SimUsersSummary.update({
                    _id: ssId,
                    createdAt: { $exists: false }
                  }, {
                    $set: {
                      createdAt: _s.addedAt              
                    }
                  })                              
                }
              }
            })
          }
        })
      }
    })
  }  
}

