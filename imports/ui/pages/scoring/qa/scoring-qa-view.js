import { Session } from 'meteor/session';

const XLSX = require('xlsx');
// const fs = require('fs');
// window.require('fs')

// import { saveAs } from '/imports/lib/util/FileSaver.min.js'
// import { saveAs } from '/imports/lib//filesaver.min.js'

import { SimUsersSummary } from '/imports/api/sim-users-summary/sim-users-summary.js'

import { Util } from '/imports/lib/util.js'

import './scoring-qa-view.html'
import '/imports/ui/stylesheets/scoring/qa/scoring-qa-view.less';

Template.ScoringQAView.onCreated(function() {


});

Template.ScoringQAView.onRendered(function() {

});

Template.ScoringQAView.events({
	'click .btn-review-scores'(e, tpl) {
		e.preventDefault();
		
		let _selected = $("#sel_qa_simulations").val();

		// console.log(_selected)
		if(_selected !== -1) {
			if(Session.get("ScoringQAView.qa.data.scorers") && Session.get("ScoringQAView.qa.data.scorers").length > 0) {
				Meteor.call("SimUsersSummary.get.qa.data", {assessmentId: _selected}, (err, res) => {
					if(err) {
						Util.alert({mode: 'error', msg: err});
					} else {
						// console.log(res)
						if(res && res.success) {
							let _qaData = res.data && res.data || []; 

							Session.set("ScoringQAView.assessmentId", _qaData.assessmentId);
							Session.set("ScoringQAView.qa.data.notes", _qaData.notes);
							Session.set("ScoringQAView.qa.data.notes.count", _qaData.countNotes);
							Session.set("ScoringQAView.qa.data.scorers", _qaData.qaScorers);
							Session.set("ScoringQAView.qa.data.findings", _qaData.sbs);
							Session.set("ScoringQAView.qa.data.scorers.count", _qaData.qaScorers.length || 0);

							Util.alert();
						} else {
							Util.alert({mode: 'error', msg: err});
						}
					}
				})
			} else {
				Util.alert({mode: 'error', msg: "No QA scorers assigned. Please just pick QA scorer(s) for this QA sim to load the initial data."});
			}
		}
	},
	'click .btn-export-scores'(e, tpl) {
		e.preventDefault();
		
    let 
      _tables = document.getElementsByTagName("table"),
      // _tables = document.getElementsByClassName("tbl-qa-review"),
      _data = [];

    if(_tables && _tables.length > 0) {
      // _tables.forEach((t,i) => { //-- not working as it's Node list(ie. HTML Collection)
      [].forEach.call(_tables, (t,i) => { //-- this trick works
      	// if(i > 0) {
	        let 
	          _tbl = t,
	          _ws = XLSX.utils.table_to_sheet(_tbl),
	          _wData = XLSX.utils.sheet_to_json(_ws, { header: 1 });

	        _data = _data.concat(['']).concat(_wData);
      	// }
      })
    }
   // let tbl1 = document.getElementsByTagName("table")[0]
   // let tbl2 = document.getElementsByTagName("table")[1]
      
   // let worksheet_tmp1 = XLSX.utils.table_to_sheet(tbl1);
   // let worksheet_tmp2 = XLSX.utils.table_to_sheet(tbl2);
      
   // let a = XLSX.utils.sheet_to_json(worksheet_tmp1, { header: 1 })
   // let b = XLSX.utils.sheet_to_json(worksheet_tmp2, { header: 1 })
      
   // a = a.concat(['']).concat(b)
     
   let worksheet = XLSX.utils.json_to_sheet(_data, { skipHeader: true })
   
   const _nWB = XLSX.utils.book_new();   
   XLSX.utils.book_append_sheet(_nWB, worksheet, "Scoring QA Report")


   // XLSX.writeFile(_nWB, 'Scoring QA-Report-'+Util.dateHMS(new Date)+'.xlsx') 	

	  let
	    wopts = { bookType:'xlsx', bookSST:false, type:'binary' },
	    wbout = XLSX.write(_nWB, wopts)

	  let filename = 'Scoring QA Report-'+Util.dateHMS(new Date)+'.xlsx'

	  saveAs(new Blob([Util.s2ab(wbout)],{type:"application/octet-stream"}), filename);  

	},
  'click .btn-close-qa-view'(e, tpl) {
    e.preventDefault()
    
    $(".scoring-qa-view-sidebar").sidebar('hide');
  },		
});

Template.ScoringQAView.helpers({
	QASimulations() {
		return SimUsersSummary.find({
			qa: 1
		});		
	},
	QAData() {
		if(Session.get("ScoringQAView.qa.data")) {
			return Session.get("ScoringQAView.qa.data");
		}
	},
	MonitoringNotes() {
		if(Session.get("ScoringQAView.qa.data.notes")) {
			return Session.get("ScoringQAView.qa.data.notes");
		}
	},
	NumOfMonitoringNotes() {
		if(Session.get("ScoringQAView.qa.data.notes.count")) {
			return Session.get("ScoringQAView.qa.data.notes.count");
		}
	},	
	thisAssessmentId() {
		if(Session.get("ScoringQAView.assessmentId")) {
			return Session.get("ScoringQAView.assessmentId");
		}		
	},
	QAScorers() {
		if(Session.get("ScoringQAView.qa.data.scorers")) {
			return Session.get("ScoringQAView.qa.data.scorers");
		}			
	},
	qaScorersCount() {
		if(Session.get("ScoringQAView.qa.data.scorers.count")) {
			return Session.get("ScoringQAView.qa.data.scorers.count");
		}				
	},
	Findings() {
		if(Session.get("ScoringQAView.qa.data.findings")) {
			return Session.get("ScoringQAView.qa.data.findings");
		}			
	},
	Fullname() {
		if(Session.get("ScoringQAView.qa.data.fullname")) {
			return Session.get("ScoringQAView.qa.data.fullname");
		}
	},
	Initial() {
		if(Session.get("ScoringQAView.qa.data.initial")) {
			return Session.get("ScoringQAView.qa.data.initial");
		}
	},	
});
