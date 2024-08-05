import { Session } from 'meteor/session'

const XLSX = require('xlsx');

// import '/imports/lib/template-helpers.js'
import { Util } from '/imports/lib/util.js'

import './datadump-management.html'
import '/imports/ui/stylesheets/datadump/datadump-management.less'

// import '/imports/ui/pages/simulations/document-management.js'

let _datadumpManagementTabs = {
  first: 'UnidentifiedFindingsResults',
  second: 'FindingsComparisonReport',
  third: 'FindingsComparisonSummary',
}

let _datadumpManagementTabNames = {
  first: 'Unidentified Findings Results',
  second: 'Findings Comparison Report',
  third: 'Findings Comparison',
}

Template.DatadumpManagement.onCreated(datadumpManagement => { 

  Session.set("DatadumpManagement.tab", {first: "UnidentifiedFindingsResults"})
  Session.set("DatadumpManagement.tab.name", _datadumpManagementTabs['first'])
  $('.attached.tab.first').addClass('loading')  
})

Template.DatadumpManagement.onRendered(function datadumpManagementOnRendered() {

  $('.datadump-management-menu .item').tab({     
    onLoad: function(path, params, history) {
      
      let tab = {
        first: null,
        second: null,
        third: null
      }
      tab[path] = _datadumpManagementTabs[path] 

      Session.set("DatadumpManagement.tab", tab)
      Session.set("DatadumpManagement.tab.current", path)  
      Session.set("DatadumpManagement.tab.name", _datadumpManagementTabNames[path])

      let msg = ''
      if(path === 'first') {                  
        msg = 'uif'        
      } 
      else if(path === 'second') {                  
        msg = 'fcompr'        
      }               
      else {
        msg = 'fcomps'
      } 

      Util.log(Meteor.user(), msg, "datadumpmgmt")         
        
    },
  });

  Util.loading(false)
})

Template.DatadumpManagement.helpers({ 
  UnidentifiedFindingsResults() {
    if(Session.get("DatadumpManagement.tab").first) {
      import '/imports/ui/pages/datadump/datadump-uif-results.js' 

      return Session.get('DatadumpManagement.tab').first
    }
  },
  FindingsComparisonReport() {    
    if(Session.get("DatadumpManagement.tab").second) {
      import '/imports/ui/pages/datadump/datadump-findings-comparison-report.js'
          
      return Session.get("DatadumpManagement.tab").second
    }
  },
  FindingsComparisonSummary() {
    if(Session.get("DatadumpManagement.tab").third) {
      import '/imports/ui/pages/datadump/datadump-findings-comparison-summary.js'
          
      return Session.get("DatadumpManagement.tab").third
    }
  },  
})

Template.DatadumpManagement.events({
  'click .datadump-management-menu .item'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))
    
    setTimeout(()=>{Util.loader({done: true})}, 500);
  } 
})

Template.DatadumpManagement.onDestroyed(datadumpMgmtOnDestroyed => {
  Session.set("DatadumpManagement.tab", null)
  Session.set("DatadumpManagement.tab.current", null)  
  Session.set("DatadumpManagement.tab.name", null)  
})

_resetDatadumpManagementTab = function() {
  $('.datadump-management-column-container .attached.tab').removeClass('loading')
  $('.active.inline.loader').remove()
}
