import { Session } from 'meteor/session';

import { Util } from '/imports/lib/util.js';

import Tabular from 'meteor/aldeed:tabular';

// import { Util } from '/imports/lib/util.js'

import '/imports/api/sim-users-summary/sim-users-summary.js'

import './scoring.html'
import '/imports/ui/stylesheets/scoring/scoring.less'

let _selfScoring

Template.Scoring.onCreated(function scoringOnCreated() {

  _selfScoring = this

  _selfScoring.tabs = {
    first: "ScoringScorers",
    second: 'ScoringReview',
    third: 'ScoringQAMain',
    fourth: 'ScoringSimulationWeighting',
    fifth: 'ScoringScorerManagement'
  }

  Session.set("Scoring.tabs", _selfScoring.tabs) 

})

Template.Scoring.onRendered(function scoringOnRendered() {
  $('.scoring-grid-container .menu .item').tab()
  Util.loading(false)
})

Template.Scoring.helpers({
  ScoringScorers() {
    if(Session.get("Scoring.tabs").first) {
      import "./scoring-scorers.js"      

      return Session.get("Scoring.tabs").first      
    }       
  },  
  ScoringReview() {
    if(Session.get("Scoring.tabs").second) {
      import "./scoring-review.js"

      return Session.get("Scoring.tabs").second
    }       
  },
  ScoringQAMain() {
    if(Session.get("Scoring.tabs").third) {
      
      // Meteor.subscribe('sim_users_summary_w_qa');

      import "./qa/scoring-qa-main.js"      
      
      return Session.get("Scoring.tabs").third
    }       
  },
  ScoringSimulationWeighting() {
    if(Session.get("Scoring.tabs").fourth) {
      
      // Meteor.subscribe('sim_users_summary_w_qa');

      import "./scoring-simulation-weighting.js"      
      
      return Session.get("Scoring.tabs").fourth;
    }       
  },
  ScoringScorerManagement() {
    if(Session.get("Scoring.tabs").fifth) {
      import "./scoring-scorer-management.js"

      return Session.get("Scoring.tabs").fifth;
    }       
  },  
})

