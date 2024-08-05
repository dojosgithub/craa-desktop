import { ReactiveVar } from 'meteor/reactive-var'
import { Util } from '/imports/lib/util.js'

import './etl.html'
import '/imports/ui/stylesheets/etl/etl.less'

// const all_behaviors = new MysqlSubscription('all_behaviors')

Template.ETL.onCreated(etlOnCreated => {
  Template.instance().uploading = new ReactiveVar( false ); 
})

Template.ETL.onRendered(etcOnRendered => {
  $('.etl-grid-container .menu .item').tab()
  Util.loading(false)
})

Template.ETL.helpers({
  uploading() {
    return Template.instance().uploading.get();
  }
})

Template.ETL.events({
  'click .btn-transfer-user-profile-training-modules-data'(e, tpl) {
    e.preventDefault();

    Util.loader($(e.currentTarget));

    Meteor.call("ETL.training.transferUserProfileTrainingModules",{}, (err, res) => {
      if(err) {
        Util.alert({mode: 'error'});
      } else {
        console.log(res);
        if(res) {
          Util.alert();
        }
      }

      Util.loader({done: true})
    })

  },
  'click .btn-update-duplicated-user-data'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget));

    Meteor.call('ETL.V1UsersTemp.duplicated',{}, (err, res) => {
      
      if(err) {
        Util.alert({mode: 'error'})
      } else {
        
        console.log(res);

        Util.alert()
      }

      Util.loader({done: true})
    })

  },
  'click .btn-integrate-v1-scorings'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    Meteor.call('ETL.V1ScoringsRaw.integrate',{}, (err, res) => {
      
      if(err) {
        Util.alert({mode: 'error'})
      } else {
        
        // console.log(res);

        Util.alert()
      }

      Util.loader({done: true})
    })
  },
  'click .btn-create-v1-users-score-summary'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    Meteor.call('ETL.V1ScoringsRaw.V1UsersScoreSummary.create',{}, (err, res) => {
      
      if(err) {
        Util.alert({mode: 'error'})
      } else {
        
        // console.log(res);

        Util.alert()
      }

      Util.loader({done: true})
    })
  },
  'click .btn-add-mn-to-v1-users-score-summary'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    Meteor.call('ETL.V1CommentsRaw.V1UsersScoreSummary.addMonitoringNotes',{}, (err, res) => {
      
      if(err) {
        Util.alert({mode: 'error'})
      } else {
        
        console.log(res);

        Util.alert()
      }

      Util.loader({done: true})
    })
  },
  'click .btn-create-timer-temp-data'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    Meteor.call('ETL.V1SimUsersSummaryTemp.createTimerTemp',{}, (err, res) => {
      
      if(err) {
        Util.alert({mode: 'error'})
      } else {
        
        console.log(res);

        Util.alert()
      }

      Util.loader({done: true})
    })
  },  
  'click .btn-update-v2-w-v1-users-temp-data'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    Meteor.call('ETL.V1UsersTemp.v2Users',{}, (err, res) => {
      
      if(err) {
        Util.alert({mode: 'error'})
      } else {
        
        console.log(res);

        Util.alert()
      }

      Util.loader({done: true})
    })    
  },
  'click .btn-update-v2-w-v1-users-summary-temp-data'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    Meteor.call('ETL.V1UsersSummaryTemp.v2UsersSummary',{}, (err, res) => {
      
      if(err) {
        Util.alert({mode: 'error'})
      } else {
        
        console.log(res);

        Util.alert()
      }

      Util.loader({done: true})
    })    
  },
  'click .btn-update-v2-w-v1-users-demographic-temp-data'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    Meteor.call('ETL.V1UsersDemographicTemp.v2UsersDemographic',{}, (err, res) => {
      
      if(err) {
        Util.alert({mode: 'error'})
      } else {
        
        console.log(res);

        Util.alert()
      }

      Util.loader({done: true})
    })    
  },
  'click .btn-update-v2-w-v1-assessments-temp-data'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    Meteor.call('ETL.V1AssessmentsTemp.v2Assessments',{}, (err, res) => {
      
      if(err) {
        Util.alert({mode: 'error'})
      } else {
        
        console.log(res);

        Util.alert()
      }

      Util.loader({done: true})
    })    
  },
  'click .btn-update-v2-w-v1-sim-users-summary-temp-data'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    Meteor.call('ETL.V1SimUsersSummaryTemp.v2SimUsersSummary',{}, (err, res) => {
      
      if(err) {
        Util.alert({mode: 'error'})
      } else {
        
        console.log(res);

        Util.alert()
      }

      Util.loader({done: true})
    })    
  },
  'click .btn-update-v2-w-v1-users-score-summary-temp-data'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    Meteor.call('ETL.V1UsersScoreSummaryTemp.v2UsersScoreSummary',{}, (err, res) => {
      
      if(err) {
        Util.alert({mode: 'error'})
      } else {
        
        console.log(res);

        Util.alert()
      }

      Util.loader({done: true})
    })    
  },
  'click .btn-update-v2-w-v1-monitoring-notes-temp-data'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    Meteor.call('ETL.V1MonitoringNotesTemp.v2MonitoringNotes',{}, (err, res) => {
      
      if(err) {
        Util.alert({mode: 'error'})
      } else {
        
        console.log(res);

        Util.alert()
      }

      Util.loader({done: true})
    })    
  },
  'click .btn-update-v2-w-v1-compliance-notes-temp-data'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    Meteor.call('ETL.V1ComplianceNotesTemp.v2ComplianceNotes',{}, (err, res) => {
      
      if(err) {
        Util.alert({mode: 'error'})
      } else {
        
        console.log(res);

        Util.alert()
      }

      Util.loader({done: true})
    })    
  },          
  'click .btn-update-v2-w-v1-compliance-notes-temp-data'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    Meteor.call('ETL.V1ComplianceNotesTemp.v2ComplianceNotes',{}, (err, res) => {
      
      if(err) {
        Util.alert({mode: 'error'})
      } else {
        
        console.log(res);

        Util.alert()
      }

      Util.loader({done: true})
    })    
  },
  'click .btn-update-v2-w-v1-timer-log-temp-data'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    Meteor.call('ETL.V1TimerLogTemp.v2TimerLog',{}, (err, res) => {
      
      if(err) {
        Util.alert({mode: 'error'})
      } else {
        
        console.log(res);

        Util.alert()
      }

      Util.loader({done: true})
    })    
  }, 
  'click .btn-update-v2-w-v1-temp-timer-log-temp-data'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    Meteor.call('ETL.V1TempTimerLogTemp.v2TempTimerLog',{}, (err, res) => {
      
      if(err) {
        Util.alert({mode: 'error'})
      } else {
        
        console.log(res);

        Util.alert()
      }

      Util.loader({done: true})
    })    
  },   
  'click .btn-remove-v1-data-from-v2'(e, tpl) {
    e.preventDefault()

    if(confirm("Are you sure to remove all V1 data from V2 collections?")) {
      Util.loader($(e.currentTarget))

      Meteor.call('ETL.V1Temp.removeFromV2',{}, (err, res) => {
        
        if(err) {
          Util.alert({mode: 'error'})
        } else {
          
          console.log(res);

          Util.alert()
        }

        Util.loader({done: true})
      }) 
    }   
  },
  'click .btn-remove-v1-temp-data'(e, tpl) {
    e.preventDefault()

    if(confirm("Are you sure to remove all V1 Temp collections?")) {
      Util.loader($(e.currentTarget))

      Meteor.call('ETL.V1Temp.remove',{}, (err, res) => {
        
        if(err) {
          Util.alert({mode: 'error'})
        } else {
          
          console.log(res);

          Util.alert()
        }

        Util.loader({done: true})
      }) 
    }   
  },    
  'click .btn-integrate-v1-users'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    Meteor.call('ETL.V1UsersRaw.integrate',{}, (err, res) => {
      
      if(err) {
        Util.alert({mode: 'error'})
      } else {
        
        console.log(res);

        Util.alert()
      }

      Util.loader({done: true})
    })
  },
  'click .btn-transfer-findings'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    Meteor.call('ETL.Findings.transfer',{}, (err, res) => {
      
      if(err) {
        Util.alert({mode: 'error'})
      } else {
        Util.alert()
      }

      Util.loader({done: true})
    })
  },
  'click .btn-transfer-simulations'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    Meteor.call('ETL.Simulations.transfer',{}, (err, res) => {
      
      if(err) {
        Util.alert({mode: 'error'})
      } else {
        Util.alert()
      }

      Util.loader({done: true})
    })    
  },
  'click .btn-transfer-document-folders'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    Meteor.call('ETL.DocumentFolders.transfer',{}, (err, res) => {
      
      if(err) {
        Util.alert({mode: 'error'})
      } else {
        Util.alert()
      }

      Util.loader({done: true})
    })    
  },
  'click .btn-transfer-documents'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    Meteor.call('ETL.Documents.transfer',{}, (err, res) => {
      
      if(err) {
        Util.alert({mode: 'error'})
      } else {
        Util.alert()
      }

      Util.loader({done: true})
    })    
  },
  'click .btn-transfer-document-files'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    Meteor.call('ETL.DocumentFiles.transfer',{}, (err, res) => {
      
      if(err) {
        Util.alert({mode: 'error'})
      } else {
        Util.alert()
      }

      Util.loader({done: true})
    })    
  },
  'click .btn-transfer-protocols'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    Meteor.call('ETL.Protocols.transfer',{}, (err, res) => {
      
      if(err) {
        Util.alert({mode: 'error'})
      } else {
        Util.alert()
      }

      Util.loader({done: true})
    })    
  },
  'click .btn-monitoring-notes-modifed-date'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    Meteor.call('ETL.MonitoringNotes.modified',{}, (err, res) => {
      
      if(err) {
        Util.alert({mode: 'error', msg: err})
      } else {
        Util.alert()
      }

      Util.loader({done: true})
    })    
  },
  'click .btn-update-quintiles-user-regions'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    Meteor.call('ETL.UsersDemographic.Quintiles.update',{}, (err, res) => {
      
      if(err) {
        Util.alert({mode: 'error', msg: err})
      } else {
        Util.alert()
      }

      Util.loader({done: true})
    })
  },
  'change [name="v1_user_csv"]' ( e, tpl ) {
    Papa.parse( e.target.files[0], {
      header: true,
      complete( results, file ) {
        Meteor.call( 'ETL.Users.v1.import', results.data, ( err, res ) => {
          if ( err ) {            
            Util.alert({mode: 'error', msg: err.reason})
          } else {
            tpl.uploading.set( false );
            Util.alert()           
          }
        });        
      }
    });
  },
  'click .btn-process-user-scores-for-datadump'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    Meteor.call("ETL.UsersScoreSummary.datadump.init", {}, (err, res) => {
      if(err) {
        Util.alert({mode: 'error'})
        Util.loader({done: true})
      } else {
        if(res && res.success) {          

          Meteor.call("ETL.UsersScoreSummary.datadump.combine", {}, (err, res) => {
            if(err) {
              Util.alert({mode: 'error'})
            } else {
              if(res && res.success) { 
                Util.alert()
              }
            }

            Util.loader({done: true})
          })

        } else {
          Util.alert({mode: 'error'})
          Util.loader({done: true})
        }
      }
      
    })
  },
  'click .btn-process-tr-quiz-scores-for-datadump'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    Meteor.call("ETL.Training.QuizScoreSummary", {}, (err, res) => {
      // console.log(err, res)
      if(err) {
        Util.alert({mode: 'error'})        
      } else {
        if(res && res.success) {
          Util.alert()
          // console.log(res)
        } else {
          Util.alert({mode: 'error'})
        }
      }

      Util.loader({done: true})
      
    })
  },
  'click .btn-process-simulation-assign-date'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    Meteor.call("ETL.Training.SimulationAssignDate", {}, (err, res) => {
      // console.log(err, res)
      if(err) {
        Util.alert({mode: 'error'})        
      } else {
        if(res && res.success) {
          Util.alert()
          // console.log(res)
        } else {
          Util.alert({mode: 'error'})
        }
      }

      Util.loader({done: true})
      
    })

  },
  'click .btn-process-simulation-ostart-date'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    Meteor.call("ETL.SimUsersSummary.setOStartDate", {}, (err, res) => {
      
      if(err) {
        Util.alert({mode: 'error'})
      } else {
        if(res && res.success) {
          Util.alert()
          // console.log(res)
        } else {
          Util.alert({mode: 'error'})
        }
      }

      Util.loader({done: true})
      
    })
   
  },
  'click .btn-cast-score-summary-to-int'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    Meteor.call("ETL.UsersScoreSummary.cast", {}, (err, res) => {
      
      if(err) {
        Util.alert({mode: 'error'})
      } else {
        if(res && res.success) {
          Util.alert()
          // console.log(res)
        } else {
          Util.alert({mode: 'error'})
        }
      }

      Util.loader({done: true})
      
    })
   
  },
  'click .btn-compute-domain-score-total'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    Meteor.call("ETL.UsersScoreSummary.domain.total", {}, (err, res) => {
      
      if(err) {
        Util.alert({mode: 'error'})
      } else {
        if(res && res.success) {
          Util.alert()
          // console.log(res)
        } else {
          Util.alert({mode: 'error'})
        }
      }

      Util.loader({done: true})
      
    })    
  },
  //-- this will update severity in behavior in ScoringBehaviors 
  //-- and unidentified_findings in UsersScoreSummary
  'click .btn-update-sb-severity'(e, tpl) {
    e.preventDefault()


    Util.loader($(e.currentTarget))

    Meteor.call("ETL.ScroingBehaviors.severity", {}, (err, res) => {
      
      if(err) {
        Util.alert({mode: 'error'})
      } else {
        if(res && res.success) {
          Util.alert()
          // console.log(res)
        } else {
          Util.alert({mode: 'error'})
        }
      }

      Util.loader({done: true})
      
    })
  },
  //-- this will re-calculate severity scores with the updated severity value
  'click .btn-update-ss-severity'(e, tpl) {
    e.preventDefault()


    Util.loader($(e.currentTarget))

    Meteor.call("ETL.UsersScoreSummary.severity", {}, (err, res) => { //-- see methods for scoring-behaviors
      
      if(err) {
        Util.alert({mode: 'error'})
      } else {
        if(res && res.success) {
          Util.alert()
          // console.log(res)
        } else {
          Util.alert({mode: 'error'})
        }
      }

      Util.loader({done: true})
      
    })
  },
  //-- this will make user field in logs flat, removing fields except _id
  'click .btn-reduce-user-field'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    Meteor.call("ETL.Logs.reduceUserFiled", {}, (err, res) => { //-- see methods for scoring-behaviors
      
      if(err) {
        Util.alert({mode: 'error'})
      } else {
        if(res && res.success) {
          Util.alert()
          // console.log(res)
        } else {
          Util.alert({mode: 'error'})
        }
      }

      Util.loader({done: true})
      
    })
  },
  //-- this will make user field in logs flat, removing fields except _id
  'click .btn-add-findings-total'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    Meteor.call("ETL.UsersScoreSummary.findingsTotal", {}, (err, res) => { //-- see methods for scoring-behaviors
      // console.log(err, res)
      if(err) {
        Util.alert({mode: 'error'})
      } else {
        if(res && res.success) {
          Util.alert()
          // console.log(res)
        } else {
          Util.alert({mode: 'error'})
        }
      }

      Util.loader({done: true})
      
    })
  },
  //-- this will create a new collection with SUS data by date, focusing on sim/result status/stage
  'click .btn-create-sus-by-date'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    Meteor.call("ETL.SimUsersStatus.createStatusByDate", {}, (err, res) => { //-- see methods for scoring-behaviors
      // console.log(err, res)
      if(err) {
        Util.alert({mode: 'error'})
      } else {
        if(res && res.success) {
          Util.alert()
          // console.log(res)
        } else {
          Util.alert({mode: 'error'})
        }
      }

      Util.loader({done: true})
      
    })
  },
  //-- this will create a new collection with SUS-RT data by date, focusing on sim/result status/stage
  //-- better not doing this again once the collection is created...
  'click .btn-create-susrt-by-date'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    Meteor.call("ETL.SimUsersStatusRT.createStatusByDate", {}, (err, res) => { //-- see methods for scoring-behaviors
      // console.log(err, res)
      if(err) {
        Util.alert({mode: 'error'})
      } else {
        if(res && res.success) {
          Util.alert()
          // console.log(res)
        } else {
          Util.alert({mode: 'error'})
        }
      }

      Util.loader({done: true})
      
    })
  },
  'click .btn-update-sus-data'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    Meteor.call("ETL.SimUsersStatus.updateStatusByDate", {}, (err, res) => { //-- see methods for scoring-behaviors
      // console.log(err, res)
      if(err) {
        Util.alert({mode: 'error'})
      } else {
        if(res && res.success) {
          Util.alert()
          // console.log(res)
        } else {
          Util.alert({mode: 'error'})
        }
      }

      Util.loader({done: true})
      
    })
  },
  //-- For sim status log, it'd be best to let sim users summary have 
  //-- a new key for 'Reopened' cases
  'click .btn-add-reopened-to-sus'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    Meteor.call("ETL.SimUsersSummary.addReopenedKey", {}, (err, res) => { //-- see methods for sim users summary
      // console.log(err, res)
      if(err) {
        Util.alert({mode: 'error'})
      } else {
        if(res && res.success) {
          Util.alert()
          // console.log(res)
        } else {
          Util.alert({mode: 'error'})
        }
      }

      Util.loader({done: true})
      
    })
  },
  //-- This also needs a logic in Admin site's initiateClientDatadumpS in admin-datadump.js, 
  //-- so that domainSummary gets total and identified in future 
  'click .btn-add-identified-total-to-domain-summary'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    Meteor.call("ETL.UsersScoreSummary.addIdentifiedNTotal", {}, (err, res) => { //-- see methods for users score summary
      // console.log(err, res)
      if(err) {
        Util.alert({mode: 'error'})
      } else {
        if(res && res.success) {
          Util.alert()
          // console.log(res)
        } else {
          Util.alert({mode: 'error'})
        }
      }

      Util.loader({done: true})
      
    })    
  },
  //-- Upon Chris' request (12/07/2018, dq) 
  //-- Gerald wanted to exclude IRB/IEC Reporting (category_id: 2) 
  //-- score from total score. We've been using a field 'domainScore' 
  //-- inside UsersScoreSummay, so, we want to have another domainScore 
  //-- that excludes IRB/IEC Reporting. Probably, another set of fields 
  //-- for 'numIF', 'numUF', and 'totalF' should be added there as well.
  //-- Once done, Publishing logic should be updated to create the new 
  //-- fields accordingly. And, Datadump should have a new column that 
  //-- gets the value from the new total score.
  //-- New fields created: domainScore2, numIF2, numUF2, totalF2
  'click .btn-add-new-domain-score'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    Meteor.call("ETL.UsersScoreSummary.addNewDomainTotal", {}, (err, res) => { //-- see methods for users score summary
      // console.log(err, res)
      if(err) {
        Util.alert({mode: 'error'})
      } else {
        if(res && res.success) {
          Util.alert()
          // console.log(res)
        } else {
          Util.alert({mode: 'error'})
        }
      }

      Util.loader({done: true})
      
    })    
  },

  // 'click .btn-import-v1-user'(e, tpl) {
  //   e.preventDefault()

  //   Util.loader($(e.currentTarget))

  //   Meteor.call('ETL.Users.v1.import',{}, (err, res) => {
      
  //     if(err) {
  //       Util.alert({mode: 'error', msg: err})
  //     } else {
  //       Util.alert()
  //     }

  //     Util.loader({done: true})
  //   })
  // } 

'click .btn-quintiles-to-iqvia-email'(e, tpl) {
  e.preventDefault();

    Util.loader($(e.currentTarget))

    Meteor.call("ETL.UsersSummary.quintilesToIqviaEmail", {}, (err, res) => { //-- see methods for users score summary
      // console.log(err, res)
      if(err) {
        Util.alert({mode: 'error'})
      } else {
        if(res && res.success) {
          Util.alert()
          // console.log(res)
        } else {
          Util.alert({mode: 'error'})
        }
      }

      Util.loader({done: true})
      
    }) 
},
'click .btn-add-identified-findings'(e, tpl) {
  e.preventDefault();

  Util.loader($(e.currentTarget));

  Meteor.call("ETL.UsersScoreSummary.addIdentifiedFindings", {}, (err, res) => {
    if(err) {
      Util.alert({mode: 'error'})
    } else {
      if(res) {
        Util.alert()
        // console.log(res)
      } else {
        Util.alert({mode: 'error'})
      }
    }

    Util.loader({done: true})    
  })
},
'click .btn-remove-duplicated-coll-audit-pairs'(e, tpl) {
  e.preventDefault();

  Util.loader($(e.currentTarget));

  Meteor.call("ETL.CollaborationAudit.removedDuplicatedPairs", {}, (err, res) => {
    if(err) {
      Util.alert({mode: 'error'})
    } else {
      if(res) {
        Util.alert()
        // console.log(res)
      } else {
        Util.alert({mode: 'error'})
      }
    }

    Util.loader({done: true})    
  })
} 
})
