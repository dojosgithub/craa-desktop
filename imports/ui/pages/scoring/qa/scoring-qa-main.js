import { Meteor } from 'meteor/meteor'
import { Session } from 'meteor/session'

import Tabular from 'meteor/aldeed:tabular';

const XLSX = require('xlsx');

import '/imports/lib/template-helpers.js';
import { Util } from '/imports/lib/util.js'

import '/imports/api/sim-users-summary/sim-users-summary.js'

// import { DocumentFolders } from '/imports/api/document-folders/document-folders.js'
// import { Documents } from '/imports/api/documents/documents.js'
// import { MonitoringNotes } from '/imports/api/monitoring-notes/monitoring-notes.js'
// import { ScoringViewed } from '/imports/api/scoring-viewed/scoring-viewed.js'
// import { NonErrors } from '/imports/api/non-errors/non-errors.js'
// import { Findings } from '/imports/api/findings/findings.js'
// import { ScoringBehaviors } from '/imports/api/scoring-behaviors/scoring-behaviors.js'
// import { ScoringAdjudication } from '/imports/api/scoring-adjudication/scoring-adjudication.js'
// import { SimUsersSummary } from '/imports/api/sim-users-summary/sim-users-summary.js'

import './scoring-qa-main.html'
import './qa-scorers.js'
import './qa-main-action.js'
import '/imports/ui/stylesheets/scoring/qa/scoring-qa-main.less'

let _selfScoringQAMain

Template.ScoringQAMain.onCreated(function scoringQAMainOnCreated() {

  _selfScoringQAMain = this;

//   console.log("AAA");
})

Template.ScoringQAMain.onRendered(function scoringQAMainOnRendered() {
});

Template.ScoringQAMain.helpers({
	scoringQAMainSelector() {
	  return {
			qa: 1       
	  };		
	}
});

Template.ScoringQAMain.events({
	'click .btn-export-qa-scores'(e, tpl) {
		e.preventDefault();

		Util.loader($(e.currentTarget))
		// sAlert.info("Not fully implemented yet...");
		Meteor.call("SimUsersSummary.qa.export.all", {}, (err, res) => {
			if(err) {				
				Util.alert({mode: 'error'});
			} else {

        if(res && res.success) {
            let wb = res.data;
                        
            let
              wopts = { bookType:'xlsx', bookSST:false, type:'binary' },
              wbout = XLSX.write(wb, wopts)

            let filename = 'Scoring QA-'+Util.dateHMS(new Date)+'.xlsx'

            saveAs(new Blob([Util.s2ab(wbout)],{type:"application/octet-stream"}), filename);  

            //-- don't need this to avoid the case this can still be appearing
            //-- even though the admin user clicks 'cancel' in the download window...
            // Util.alert();   
        } else {
        	Util.alert({mode: 'error'});
        }
				
			}

			Util.loader({done: true});
		})
	}
});

