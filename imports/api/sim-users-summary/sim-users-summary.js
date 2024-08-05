import { Mongo } from 'meteor/mongo';

import Tabular from 'meteor/aldeed:tabular';

import { Util } from '/imports/lib/util.js'

import { Simulations } from '/imports/api/simulations/simulations.js'
import { MonitoringNotes } from '/imports/api/monitoring-notes/monitoring-notes.js'
import { ScoringTempTimerLog } from '/imports/api/scoring-temp-timer-log/scoring-temp-timer-log.js';
import { NonErrors } from '/imports/api/non-errors/non-errors.js';
import { ScoringAdjudication } from '/imports/api/scoring-adjudication/scoring-adjudication.js';

export const SimUsersSummary = new Mongo.Collection('sim_users_summary');

// let ___sims = Simulations.find()

// // console.log(sims.fetch())

// let ___simObjs = []
// if(___sims && ___sims.fetch().length > 0) {
//   ___sims.fetch().forEach((s) => {
//     ___simObjs[s.id] = s.name
//   })
// }

SimUsersSummary.helpers({
  scorer1Time() {   
    let _time = ScoringTempTimerLog.findOne({
      assessment_id: this.assessmentId,
      assessor_id: this.scorer1Id
    })
  
    return _time && _time.pause_time
  },
  scorer2Time() {    
    let _time = ScoringTempTimerLog.findOne({
      assessment_id: this.assessmentId,
      assessor_id: this.scorer2Id
    })
  
    return _time && _time.pause_time
  },
  monitoringNotes() {    
    // console.log(this)
    let _mns = MonitoringNotes.find({
      creator: this.userId,
      client_id: this.clientId,
      bu_id: this.buId,
      simulation_id: this.simulationId.toString(),
      status: 1
    }).count()

    return _mns
  },  
  nonErrors() {
    let _nes = NonErrors.find({
      assessment_id: this.assessmentId
    }).count()

    let _deletedNEs = NonErrors.find({
      assessment_id: this.assessmentId,
      status: 4
    }).count()    

    let _neText = ''

    if(_nes > 0) {
      // console.log(_nes, _deletedNEs)
      _neText = (_nes-_deletedNEs) + '/' + _nes
    }
    // return _nes > 0 ? _nes : ''
    return _neText
  },
  adjs() {
    // console.log(this)
    let _adj = ScoringAdjudication.find({
      status: 1,
      assessment_id: this.assessmentId
    }).fetch()

    if(_adj && _adj.length > 0) {
      let _adjBHs = _adj[0].behaviors && _adj[0].behaviors.length || 0

      return _adjBHs
    }    
  },
  qaScorers() {
    
    // console.log(this);

    // let _scorers = Meteor.users.find({

    // }).fetch();
  }     
});

new Tabular.Table({
  name: "ExportMonitoringNotes",
  collection: SimUsersSummary,
  // ordering: false,
  order: [[4, 'desc']],
  paging: false,
  info: false,
  pageLength: 1,
  limit: 5,
  language: {
      zeroRecords: "No user data to process",      
      info: "Showing _START_ to _END_ of _TOTAL_ simulations",
      infoEmpty: "No user record to process",
      processing: "Searching ...",
      search: 'Search User:',
  },  
  columns: [
    {data: "fullname", title: "Name", width: 300},
    {data: "email", title: "Email", width: 400},
    {data: "simulationName", title: "Simulation", width: 300, render(v,t,d) {
    // {data: "simulationId", width: 300, render(v,t,d) {
      // console.log(v, Simulations.find().fetch())
      // let sim = Simulations.findOne({id: v}) 
      // if(sim) {
      //   return sim.name
      // }
// console.log(___simObjs)
//       return ___simObjs[v]
      return v
    }},
    {title: "", width: 700, 
      createdCell: Meteor.isClient && function (cell, cellData, rowData) {        
        return Blaze.renderWithData(Template.ExportMonitoringNotesAction, {
          row: rowData
        }, cell);
      },
    },
    {data: "submittedAt", visible: false},
    {data: "_id", visible: false},
    {data: "userId", visible: false},
    {data: "clientId", visible: false},
    {data: "buId", visible: false},
    // {data: "simulationName", visible: false},
    {data: "simulationId", visible: false},
    {data: "clientName", visible: false},
    {data: "buName", visible: false},
   
    // {
    //   data: "emailVerifiedAt",
    //   title: "VerifiedAt",
    //   render: function (val, type, doc) {
    //     if (val instanceof Date) {
    //       return moment(val).calendar();
    //     } else {
    //       return "Never";
    //     }
    //   }
    // },
    // {data: "summary", title: "Summary"},
    // {
    //   tmpl: Meteor.isClient && Template.bookCheckOutCell
    // }
  ]
});

new Tabular.Table({
  name: "ScoringReview",
  collection: SimUsersSummary,
  pub: "sus_w_scoring_temp_timer_log",
  // pub: "admin_all_sims_w_sim_settings", // slow
  // sub: new SubsManager(),
  // order: [[7, 'desc'], [10, 'desc']],
  // order: [[10, 'desc'], [9, 'desc']],
  // order: [[7, 'desc'], [10, 'desc']],
  order: [[1, 'desc']],
  pageLength: 20,
  // throttleRefresh: 3600000,
  lengthMenu: [[20, 50, 100], [20, 50, 100]],
  language: {      
      lengthMenu: "Showing _MENU_ simulations per page",
      zeroRecords: "No Scroe Data",
      info: "Showing _START_ to _END_ of _TOTAL_ simulations",
      infoEmpty: "No Simulation Record Available",
      infoFiltered: "(filtered from _MAX_ total simulations)",
      processing: "Compiling data...please wait...",
      search: "Quick Search: "
  },
  columns: [
    {data: "dueDate", width: 100, title: "Due Date", className: 'due-date', render(v, t, d) {     
      // return Meteor.libMethods.bDueDate(v, 5);
      // console.log(d.fullname, d.daysRemaining);
      // return Meteor.libMethods.bDueDate4Neg(new Date(), d.daysRemaining+1);
      return Util.dateFormatS(v) || Util.bDueDate(v, 3);
    }},
    {data: "submittedAt", width: 100, title: "Date Cmtd", className: 'date-submitted', render(v, t, d) {     
      return Util.dateFormatS(v);
    }},
    {data: "clientName", width: 120, title: "Client", render(v, t, d) {
      return v + '-' + d.buName;
    }},
    {data: "fullname", width: 150, title: "User"},
    {data: "initial", width: 50, title: "Initial"},
    // {data: "simulationName", width: 80, title: "Simulation"},  
    {data: "simulationId", width: 200, title: "Simulation", render(v, t, d) {
      
      let sim = Simulations.findOne({
        id: v
      })
      // console.log(sim)
      return sim && sim.name || ''
      // return adminAllSimNames[v];
    }},
    {data: "scorer1Name", className: 'scorer-name', width: 80, title: "Scorer1", render(v, t, d) {
      let _class = d.scorer1Status

      // console.log(v)
      // $(this).addClass(_class)

      // return '<span class="'+ _class+'">' + v.split(' ')[0] + '</span>'
      if(v) {
        return '<button class="ui mini button '+ _class+'">' + v.split(' ')[0] + '</button>'
      }
    }},
    {data: "scorer1Time()", className: 'scoring-time', title: "Time"},
    {data: "scorer2Name", className: 'scorer-name', width: 80, title: "Scorer2", render(v, t, d) {
      let _class = d.scorer2Status
      if(v) {
        return '<button class="ui mini button '+ _class+'">' + v.split(' ')[0] + '</button>'
      }
    }},
    {data: "scorer2Time()", className: 'scoring-time', title: "Time"},
    {data: "monitoringNotes()", className: 'monitoring-notes', title: "MN"},
    {data: "nonErrors()", className: 'non-errors', title: "NE"},
    // {data: "", title: "Non-Errors", 
    //   createdCell: Meteor.isClient && function (cell, cellData, rowData) {        
    //     return Blaze.renderWithData(Template.ScoringViewNonErrors, {
    //       row: rowData
    //     }, cell);
    //   },
    // },    
    // {data: "adjudicatorName", className: 'adjudicator-name', title: "Adj.", render(v, t, d) {
    //   let _class = d.adjudicatorStatus

    //   if(d.adjudication) {
    //     return '<button class="ui mini button '+ _class+'">' + v.split(' ')[0] + '</button>'
    //   }
    // }},
    {data: "adjs()", className: 'adjudicator-name', title: "Adj", render(v, t, d) {
      if(d.adjudication) {
        let _class = d.adjudicatorStatus
        if(v > 0) {
          _class += ' not-zero'
        }
        return '<button class="ui mini button '+ _class+'">' + v + '</button>'
      }
    }},    
    // {data: "simStatus", width: 90, title: "Status"},
    {data: "resultStage", className: 'result-stage', width: 50, title: "Status", render(v, t, d) {
      if(v) {
        let _class = v === 'Review' ? 'yellow' : 'basic'

        return '<button class="ui mini button '+ _class + '">' + v + '</button>'
      }
    }},
    {title: "", className: 'scoring-review-action-container',
      createdCell: Meteor.isClient && function (cell, cellData, rowData) {        
        return Blaze.renderWithData(Template.ScoringReviewAction, {
          row: rowData
        }, cell);
      },
    },
    {data: "reopenedAt", visible: false},
    {data: "resubmittedAt", visible: false},    
    {data: "clientId", visible: false},
    {data: "buId", visible: false},
    {data: "simulationName", visible: false},
    {data: "userId", visible: false},
    {data: "scorer1Id", visible: false},
    {data: "scorer2Id", visible: false},
    {data: "adjudicatorId", visible: false},
    {data: "buName", visible: false},
    {data: "pauseTime", visible: false},
    {data: "pauseTimeRaw", visible: false},
    {data: "exportedAt", visible: false},
    {data: "status", visible: false},
    {data: "scorer1Status", visible: false},
    {data: "scorer2Status", visible: false},
    {data: "adjudicatorStatus", visible: false},
    {data: "scorer1Name", visible: false},
    {data: "scorer2Name", visible: false},
    {data: "adjudicatorName", visible: false},    
    // {data: "simStatus", visible: false},
    // {data: "resultStage", visible: false},
    {data: "adjudication", visible: false},
    {data: "retractedAt", visible: false},
    {data: "managerId", visible: false},
    {data: "daysRemaining", visible: false},
    {data: "assessmentId", visible: false},
    {data: "qa", visible: false},
    {data: "qaScorers", visible: false},    
    {data: "firstname", visible: false},    
    {data: "lastname", visible: false},    
    {data: "username", visible: false},    
    // {data: "qaData", visible: false},    
  //   {data: "qaAnswers", visible: false}    
  ] 
});

new Tabular.Table({
  name: "ScoringQAMain",
  collection: SimUsersSummary,
  pub: "sus_4_scoring_qa",
  // pub: "admin_all_sims_w_sim_settings", // slow
  // sub: new SubsManager(),
  // order: [[7, 'desc'], [10, 'desc']],
  // order: [[10, 'desc'], [9, 'desc']],
  // order: [[7, 'desc'], [10, 'desc']],
  order: [[1, 'desc']],
  pageLength: 20,
  // throttleRefresh: 3600000,
  lengthMenu: [[20, 50, 100], [20, 50, 100]],
  language: {      
      lengthMenu: "Showing _MENU_ simulations per page",
      zeroRecords: "No Scroe Data",
      info: "Showing _START_ to _END_ of _TOTAL_ simulations",
      infoEmpty: "No Simulation Record Available",
      infoFiltered: "(filtered from _MAX_ total simulations)",
      processing: "Compiling data...please wait...",
      search: "Quick Search: "
  },
  columns: [
    {data: "dueDate", width: 100, title: "Due Date", className: 'due-date', render(v, t, d) {     
      // return Meteor.libMethods.bDueDate(v, 5);
      // console.log(d.fullname, d.daysRemaining);
      // return Meteor.libMethods.bDueDate4Neg(new Date(), d.daysRemaining+1);
      return Util.dateFormatS(v) || Util.bDueDate(v, 3);
    }},
    {data: "submittedAt", width: 100, title: "Date Cmtd", className: 'date-submitted', render(v, t, d) {     
      return Util.dateFormatS(v);
    }},
    {data: "clientName", width: 120, title: "Client", render(v, t, d) {
      return v + '-' + d.buName;
    }},
    {data: "fullname", width: 150, title: "User"},
    {data: "initial", width: 50, title: "Initial"},
    // {data: "simulationName", width: 80, title: "Simulation"},  
    {data: "simulationId", width: 200, title: "Simulation", render(v, t, d) {
      
      let sim = Simulations.findOne({
        id: v
      })
      // console.log(sim)
      return sim && sim.name || ''
      // return adminAllSimNames[v];
    }},
    {title: "Scorers", className: 'td-qa-scorers',
      createdCell: Meteor.isClient && function (cell, cellData, rowData) {        
        return Blaze.renderWithData(Template.QAScorers, {
          row: rowData
        }, cell);
      },
    }, 
    {data: "monitoringNotes()", className: 'monitoring-notes', title: "MN"},
    {data: "nonErrors()", className: 'non-errors', title: "NE"},
    // {data: "", title: "Non-Errors", 
    //   createdCell: Meteor.isClient && function (cell, cellData, rowData) {        
    //     return Blaze.renderWithData(Template.ScoringViewNonErrors, {
    //       row: rowData
    //     }, cell);
    //   },
    // },    
    // {data: "adjudicatorName", className: 'adjudicator-name', title: "Adj.", render(v, t, d) {
    //   let _class = d.adjudicatorStatus

    //   if(d.adjudication) {
    //     return '<button class="ui mini button '+ _class+'">' + v.split(' ')[0] + '</button>'
    //   }
    // }},   
    // {data: "simStatus", width: 90, title: "Status"},
    {data: "resultStage", className: 'result-stage', width: 50, title: "Status", render(v, t, d) {
      if(v) {
        let _class = v === 'Review' ? 'yellow' : 'basic'

        return '<button class="ui mini button '+ _class + '">' + v + '</button>'
      }
    }},    
    {title: "", className: 'qa-main-action-container',
      createdCell: Meteor.isClient && function (cell, cellData, rowData) {        
        return Blaze.renderWithData(Template.QAMainAction, {
          row: rowData
        }, cell);
      },
    },      
    {data: "reopenedAt", visible: false},
    {data: "resubmittedAt", visible: false},    
    {data: "clientId", visible: false},
    {data: "buId", visible: false},
    {data: "simulationName", visible: false},
    {data: "userId", visible: false},
    {data: "scorer1Id", visible: false},
    {data: "scorer2Id", visible: false},
    {data: "adjudicatorId", visible: false},
    {data: "buName", visible: false},
    {data: "pauseTime", visible: false},
    {data: "pauseTimeRaw", visible: false},
    {data: "exportedAt", visible: false},
    {data: "status", visible: false},
    {data: "scorer1Status", visible: false},
    {data: "scorer2Status", visible: false},
    {data: "adjudicatorStatus", visible: false},
    {data: "scorer1Name", visible: false},
    {data: "scorer2Name", visible: false},
    {data: "adjudicatorName", visible: false},    
    // {data: "simStatus", visible: false},
    // {data: "resultStage", visible: false},
    {data: "adjudication", visible: false},
    {data: "retractedAt", visible: false},
    {data: "managerId", visible: false},
    {data: "daysRemaining", visible: false},
    {data: "assessmentId", visible: false},
    {data: "qa", visible: false},
    {data: "qaScorers", visible: false},    
    {data: "firstname", visible: false},    
    {data: "lastname", visible: false},    
    {data: "username", visible: false},    
    // {data: "qaData", visible: false},    
  //   {data: "qaAnswers", visible: false}    
  ] 
});


