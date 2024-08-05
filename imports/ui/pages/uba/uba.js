import { Session } from 'meteor/session'
import { Util } from '/imports/lib/util.js'

import './uba.html'
import '/imports/ui/stylesheets/uba/uba.less'

let _selfUBA

Template.UBA.onCreated(function() {
  _selfUBA = this

  _selfUBA.tabs = {
    first: 'UBAFindingsIndividual',    
    second: "UBAComplianceCalculationIndividual",
    third: "UBAMonitoringNotesIndividual",
    fourth: "UBAFindingsBU",  
    // fifth: "UBAMonitoringNotesCfFindings",
    fifth: "UBACollaborationAudit",
    sixth: "UBACollaborationAuditETL",
  }

  Session.set("UBA.tabs", _selfUBA.tabs)  
})

Template.UBA.onRendered(ubaOnRendered => {
  $('.uba-grid-container .menu .item').tab()
  Util.loading(false)  
})

Template.UBA.helpers({
  FindingsBU() {
    if(Session.get("UBA.tabs").fourth) {
      import "./findings-bu.js"      

      return Session.get("UBA.tabs").fourth;
    }       
  },  
  FindingsIndividual() {
    if(Session.get("UBA.tabs").first) {
      import "./findings-individual.js"
      
      return Session.get("UBA.tabs").first;
    }       
  },  
  ComplianceCalculationIndividual() {
    if(Session.get("UBA.tabs").second) {
      import "./compliance-calculation-individual.js"
      
      return Session.get("UBA.tabs").second;
    }       
  },
  MonitoringNotesIndividual() {
    if(Session.get("UBA.tabs").third) {
      import "./monitoring-notes-individual.js"
      
      return Session.get("UBA.tabs").third;
    }       
  },
  // MonitoringNotesCfFindings() {
  //   if(Session.get("UBA.tabs").fifth) {
  //     import "./monitoring-notes-cf-findings.js"
      
  //     return Session.get("UBA.tabs").fifth;
  //   }       
  // }
  CollaborationAudit() {
    if(Session.get("UBA.tabs").fifth) {
      import "./collaboration-audit.js"
      
      return Session.get("UBA.tabs").fifth;
    }       
  },
  CollaborationAuditETL() {
    if(Session.get("UBA.tabs").sixth) {
      import "./collaboration-audit-etl.js"
      
      return Session.get("UBA.tabs").sixth;
    }       
  }  
})
