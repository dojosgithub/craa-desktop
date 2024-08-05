import { Session } from 'meteor/session';

import '/imports/lib/template-helpers.js'
import { Util } from '/imports/lib/util.js'

import './scoring-qa-settings.html';
import '/imports/ui/stylesheets/scoring/qa/scoring-qa-settings.less';

let _selfScoringQASettings;

Template.ScoringQASettings.onCreated(function() {
	_selfScoringQASettings = this;

	let _data = Session.get("ScoringReviewAction.qa-sidebar.data");

	// console.log(_data);

	_selfScoringQASettings.data = _data

	_selfScoringQASettings._id = _data._id; //-- sim_users_summary _id
	_selfScoringQASettings.assessmentId = _data.assessmentId;
	_selfScoringQASettings.scorer1Id = _data.scorer1Id;
	_selfScoringQASettings.scorer2Id = _data.scorer2Id;

	_selfScoringQASettings.scorers = [_selfScoringQASettings.scorer1Id, _selfScoringQASettings.scorer2Id];

	Session.set("ScoringQASettings.isQASim", _data.qa ? 1 : 0);

});

Template.ScoringQASettings.events({
  'change #ckb_qa_sim'(e, tpl) {
    e.preventDefault()

    if(Session.get("ScoringReviewAction.qa-sidebar.data") 
    		&& Session.get("ScoringReviewAction.qa-sidebar.data").assessmentId) {

      let
      	_id = Session.get("ScoringReviewAction.qa-sidebar.data")._id, 
    		_assessmentId = Session.get("ScoringReviewAction.qa-sidebar.data").assessmentId;
      // console.log(simulation_id)

      let _useThisSim4QA = $(e.currentTarget).is(':checked');

      let _simObj = {
      	_id: _id,
        assessmentId: _assessmentId,
        qa: _useThisSim4QA ? 1 : 0
      }

      Meteor.call("SimUsersSummary.update.qa", _simObj, (err, res) => {
        if(err) {
          Util.alert({mode: 'error', msg: err})
        } else {
          
          if(res && res.data === 1) {
            Util.alert()            
          }            
        }
      });

      Session.set("ScoringQASettings.isQASim", _useThisSim4QA)

    } else {
      Util.alert({mode: 'error'})
    }   

    // Util.log(Meteor.user(), Session.get("Simulations.id")+"/changerpp", "simpref")    
  },
  'click .btn-close-qa-settings'(e, tpl) {
    e.preventDefault()

    $(".scoring-qa-sidebar").sidebar('hide');
    $(".scoring-qa-settings-sidebar").sidebar('hide');
  },
  'click .btn-save-scorers'(e, tpl) {
  	e.preventDefault();


    if(Session.get("ScoringReviewAction.qa-sidebar.data") 
    		&& Session.get("ScoringReviewAction.qa-sidebar.data").assessmentId) {

    	Util.loader($(e.currentTarget))

      let
      	_id = Session.get("ScoringReviewAction.qa-sidebar.data")._id,
      	_assessmentId = Session.get("ScoringReviewAction.qa-sidebar.data").assessmentId,
      	_selectedScorers = [];

			$('.chb-scorer:checked').each(function() {
				_selectedScorers.push($(this).val());  			
			});

			let _obj = {
				_id: _id,
				assessmentId: _assessmentId,
				qaScorers: _selectedScorers
			}

	  	Meteor.call("SimUsersSummary.update.qaScorers", _obj, (err, res) => {
	  		if(err) {
	  			// console.log(err);
	  			Util.alert({mode: 'error', msg: err})
	  		} else {
	  			// console.log(res);
          if(res && res.data === 1) {
            Util.alert()            
          } else {
          	Util.alert({mode: 'error', msg: res.data})
          }	  			
	  		}

	  		Util.loader({elem: $('.btn-save-scorers'), done: true})
	  	});  	
  	}
  }
});

Template.ScoringQASettings.helpers({
	Info() {
		if(Session.get("ScoringReviewAction.qa-sidebar.data")) {
			return Session.get("ScoringReviewAction.qa-sidebar.data");
		}
	},
	Scorers() {
	  let _users = Meteor.users.find({
	    $or: [
	      {'profile.role': '2'},
	      {'profile.role': '7'}
	    ],
	    'profile.status': 1
	  }, {
	  	$sort: {
	  		'profile.firstname': 1
	  	}
	  }).fetch();

	//   console.log(_users);

	  if(_users && _users.length > 0) {

	  	let _qaScorers = _selfScoringQASettings.data.qaScorers || [];

		  _users.sort((a,b) => {
		  	return a.profile.firstname.localeCompare(b.profile.firstname);
		  })

	  	let 
	  		_admins = [],
	  		_scorers = [];

	  	_users.map((u) => {
	  		if(u._id) {
	  			let
	  				_id = u._id, 
	  				_role = parseInt(u.profile.role);

	  			let _uObj = {
	  				_id: _id,
	  				role: _role,
	  				firstname: u.profile.firstname,
	  				lastname: u.profile.lastname,
	  				fullname: u.profile.fullname,
	  				hasScored: false,
	  				checked: _qaScorers.includes(_id) ? true : false
	  			}

	  			if(_selfScoringQASettings.scorers.includes(_id)) {
	  				_uObj.checked = false;
	  				_uObj.hasScored = true;
	  			}

	  			if(_role < 3) {
	  				_uObj.checked = false;
	  				_admins.push(_uObj);
	  			} else {
	  				_scorers.push(_uObj)
	  			}
	  		}
	  	});

	  	// let _scorersToManage = _scorers.concat(_admins);
	  	let _scorersToManage = {scorers: _scorers, admins: _admins};

		// console.log(_scorersToManage);

	  	return _scorersToManage;

	  }
	},
	selectedAsQASimulation() {
		if(Session.get("ScoringQASettings.isQASim")) {
			return Session.get("ScoringQASettings.isQASim");
		}
	}
});
