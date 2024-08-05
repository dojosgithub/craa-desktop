import { Session } from 'meteor/session'

import Tabular from 'meteor/aldeed:tabular';

import { Util } from '/imports/lib/util.js'

import '/imports/api/sim-users-summary/sim-users-summary.js'

// import '/imports/ui/stylesheets/photon/css/photon.min.css'

import './scoring-review.html'
import './scoring-review-action.js'
import '/imports/ui/stylesheets/scoring/scoring-review.less'

Template.ScoringReview.onCreated(function scoringReviewOnCreated() {  
})

Template.ScoringReview.onRendered(function scoringReviewOnRendered() {
  $('.scoring-review-grid table.dataTable').addClass('ui celled table')
  Util.loading(false)
})

Template.ScoringReview.events({
	'change .btn-view-qa-sims-only'(e, tpl) {
		e.preventDefault();

		let _onlyQASims = $(e.currentTarget).is(':checked');

		Session.set("ScoringReview.onlyQASims", _onlyQASims)
	}	
});

Template.ScoringReview.helpers({
	onlyQASims() {
		if(Session.get("ScoringReview.onlyQASims")) {
			return Session.get("ScoringReview.onlyQASims");
		}
	},
	scoringReviewSelector() {
		if(Session.get("ScoringReview.onlyQASims")) {
			return {
				qa: 1
			}
		}
	}
});
