import { Session } from 'meteor/session'

const XLSX = require('xlsx');

import  { Util } from '/imports/lib/util.js'

import './datadump-findings-comparison-report.html'
import '/imports/ui/stylesheets/datadump/datadump-findings-comparison-report.less'

Template.FindingsComparisonReport.onCreated(function findingsComparisonReportOnCreated() {
  Util.loading(false)
})

Template.FindingsComparisonReport.onRendered(function() {

});

Template.FindingsComparisonReport.helpers({

})

Template.FindingsComparisonReport.events({
	'click .btn-oa-global-base-fu2'(e, tpl) {
		e.preventDefault();

    Util.loader($(e.currentTarget));

    let
    	simulation_id1 = 30,
    	simulation_id2 = 16;

    let queryObj = {
    	simulation_id1: simulation_id1.toString(),
    	simulation_id2: simulation_id2.toString(),
    	simulation_id_1: parseInt(simulation_id1),
    	simulation_id_2: parseInt(simulation_id2)
    }

    Meteor.call("ScoringBehaviors.FindingsComparisonReport.export", queryObj, (err, res) => {
      if(err) {
        Util.alert({mode: 'error'})
        Util.loader({done: true}) 
      } else {
        if(res) {
        	// console.log(res)

          let wb = res.data

          // console.log(wb);
          /* "Browser download file" from SheetJS README */
          let
            wopts = { bookType:'xlsx', bookSST:false, type:'binary' },
            wbout = XLSX.write(wb, wopts)

          // let filename = client_name+'-'+bu_name+'-'+simulation_name+'-'+Util.dateHMS(new Date)+'.xlsx'
          let filename = 'Baseline-OA-Global--1 and Global Follow Up 2 Findings Comparison Report-'+Util.dateHMS(new Date)+'.xlsx'

          saveAs(new Blob([Util.s2ab(wbout)],{type:"application/octet-stream"}), filename);  
            
        } else {
        	Util.alert({mode: 'error'})        	
        }

        Util.loader({done: true});
      }
    })			
	},
  'click .btn-oa-na-base-fu2'(e, tpl) {
    e.preventDefault();

    Util.loader($(e.currentTarget));

    let
      simulation_id1 = 9,
      simulation_id2 = 18;

    let queryObj = {
      simulation_id1: simulation_id1.toString(),
      simulation_id2: simulation_id2.toString(),
      simulation_id_1: parseInt(simulation_id1),
      simulation_id_2: parseInt(simulation_id2)
    }

    Meteor.call("ScoringBehaviors.FindingsComparisonReport.export", queryObj, (err, res) => {
      if(err) {
        Util.alert({mode: 'error'})
        Util.loader({done: true}) 
      } else {
        if(res) {
          // console.log(res)

          let wb = res.data

          // console.log(wb);
          /* "Browser download file" from SheetJS README */
          let
            wopts = { bookType:'xlsx', bookSST:false, type:'binary' },
            wbout = XLSX.write(wb, wopts)

          // let filename = client_name+'-'+bu_name+'-'+simulation_name+'-'+Util.dateHMS(new Date)+'.xlsx'
          let filename = 'Baseline-OA-NA--1 and Global Follow Up 2 Findings Comparison Report-'+Util.dateHMS(new Date)+'.xlsx'

          saveAs(new Blob([Util.s2ab(wbout)],{type:"application/octet-stream"}), filename);  
            
        } else {
          Util.alert({mode: 'error'})         
        }

        Util.loader({done: true});
      }
    })      
  }  
});
