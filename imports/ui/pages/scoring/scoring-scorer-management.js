import { Session } from 'meteor/session';

import { Util } from '/imports/lib/util.js';

import './scoring-scorer-management.html';
import '/imports/ui/stylesheets/scoring/scoring-scorer-management.less'

import { Simulations } from '/imports/api/simulations/simulations.js'

let _selfScoringScorerManagement;

Template.ScoringScorerManagement.onCreated(function() {

	_selfScoringScorerManagement = this;
	_selfScoringScorerManagement.simDict = [];
	_selfScoringScorerManagement.waivedSimsDict = [];

	Tracker.autorun(() => {
		let _sims = Simulations.find({
			status: 1,
			name: { $regex: '^((?!test).)*$', $options: 'i'}
		}).fetch();

		if(_sims && _sims.length > 0) {
			// console.log(_sims)
			Session.set("ScoringScorerManagement.simulations", _sims);

			_sims.forEach((s) => {
				_selfScoringScorerManagement.simDict['s'+s.id] = s;
			});
		};

	})
	
});

Template.ScoringScorerManagement.onRendered(function() {

});

Template.ScoringScorerManagement.helpers({
	Scorers() {
		let _scorers = Meteor.users.find({
			'profile.status': 1,
			'profile.role': '7'
		}).fetch();

		// console.log(_selfScoringScorerManagement.simDict);

		if(_scorers && _scorers.length > 0) {
			let _myScorers = _scorers.map((s, i) => {
				let _scorerObj = {
					_id: s._id,
					name: s.profile.fullname					
				}

				if(s.profile.workload) {

					Session.set("ScoringScorerManagement.osaat", s.profile.workload.osaat || false);					

					let 
						_buffer = s.profile.workload.buffer || 1,
						_score = s.profile.workload.score || 0;

					_scorerObj['status'] = s.profile.workload.status || 'off';					
					_scorerObj['lastScored'] = s.profile.workload.lastScored || 'N/A';
					_scorerObj['buffer'] = _buffer.toFixed(1);
					_scorerObj['score'] = _score.toFixed(2);
					_scorerObj['waived'] = [];
					_scorerObj['lastScored'] = s.profile.workload.lastScored || 'N/A';

					if(s.profile.workload.waived) {
						s.profile.workload.waived.forEach((s) => {
							let _skey = 's'+s;

							if(_selfScoringScorerManagement.simDict[_skey]) {
								let 
									_sim = _selfScoringScorerManagement.simDict[_skey],
									_simObj = {
										_id: _sim._id,								
										name: _sim.name,
										sid: _sim.id
									}

								_scorerObj['waived'].push(_simObj);
							}
						});

						// Session.set("ScoringScorerManagement.waivedSims", _scorerObj['waived']);
						_selfScoringScorerManagement.waivedSimsDict[s._id] = s.profile.workload.waived || [];

					}
				}

				return _scorerObj;
			});

			// console.log(_myScorers);

			Session.set("ScoringScorerManagement.scorers", _myScorers);

			return _myScorers;
		}		
	},
	// Simulations() {
	// 	if(Session.get("ScoringScorerManagement.simulations")) {
			
	// 		console.log(Session.get("ScoringScorerManagement.simulations"));

	// 		return Session.get("ScoringScorerManagement.simulations");
	// 	}
	// },
	// Waived() {
	// 	if(Session.get("ScoringScorerManagement.waivedSims")) {
	// 		console.log(Session.get("ScoringScorerManagement.waivedSims"))
	// 		return Session.get("ScoringScorerManagement.waivedSims");
	// 	}
	// },
	ScoringScorerManagementSimWaiver() {
		if(Session.get("ScoringScorerManagement.template.simWaiver")) {
			return Session.get("ScoringScorerManagement.template.simWaiver");
		}
	},
	ScoringScorerManagementWorkloadReset() {
		if(Session.get("ScoringScorerManagement.template.resetWorkload")) {
			return Session.get("ScoringScorerManagement.template.resetWorkload");
		}
	},	
	Scorings() {
		Meteor.call("Scorings.lastScored",{}, (err, res) => {
			// console.log(err, res);
			if(err) {
				sAlert.error("Something went wrong with Last-Scored data. Please try again.");
			} else {
				if(res && res.success && res.data) {
					
					// console.log(res.data);

					// let _uids = [];
					// res.data.forEach((s) => {
					// 	let 
					// 		_uid = s.scorerId,
					// 		_asmtId = s.assessmentId,
					// 		_simName = s.sus.simulationName,
					// 		_sid = s.sus.simulationId,
					// 		_date = s.scoredAt;

					// 	if(!_uids.includes(_uid)) {

					// 		let _obj = {
					// 			assessmentId: _asmtId,
					// 			simulationName: _simName,
					// 			simulationId: _sid,
					// 			scoredAt: _date
					// 		};

					// 		// Meteor.users.update(_uid, {
					// 		// 	$set: {
					// 		// 		'profile.workload.lastScored': _obj
					// 		// 	}
					// 		// });
					// 		// Meteor.call("Users.workload.lastScored.update", {
					// 		// 	uid: _uid,
					// 		// 	lastScored: _obj
					// 		// });

					// 		_uids.push(_uid);
					// 	}

					// })
				} else {
					sAlert.error("Something went wrong with Last-Scored data. Please try again.");
				}
			}
		})
	},
	OSAAT() {		
		return Session.get("ScoringScorerManagement.osaat");
	}
	// LastScored() {
	// 	if(Session.get("ScoringScorerManagement.lastScored")) {
	// 		return Session.get("ScoringScorerManagement.lastScored");
	// 	}
	// }
});

Template.ScoringScorerManagement.events({
	'click .btn-toggle-status'(e, tpl) {
		e.preventDefault();		
// console.log(this)
		let 
			_status = $(e.currentTarget).data("status"),
			_newStatus = {
				on: 'off',
				off: 'on'
			}

		if(_status) {
			
			Util.loader($(e.currentTarget))

			let _statusToUpdate = _newStatus[_status];
			
			Meteor.call("Users.workload.status.update", {
				_id: this._id,
				status: _statusToUpdate,
				score: parseFloat(this.score)
			}, (err, res) => {

				if(res && res.success && res.data) {
					Util.alert({msg: "Successfully updated."});					
				} else {
					Util.alert({mode: 'error', msg: "Something went wrong. Please try again."});
				}

				Util.loader({elem: $(e.currentTarget), done: true})

			});
			
		} else {
			Util.alert({mode: 'error', msg: "Something went wrong. Please try again."});			
		}
	},
	'click .btn-add-waived'(e, tpl) {
		e.preventDefault();

		let _waivedSims = [];

		//-- this.waived = [{_id: ,name: ,sid: }, ...]
		if(this.waived && this.waived.length > 0) {
			this.waived.forEach((s) => {
				_waivedSims.push(s.sid);
			})
		}	

		Session.set("ScoringScorerManagement.waivedSims", _waivedSims);
		Session.set("ScoringScorerManagement.waivedSims.scorer", this);
		// Session.set("ScoringScorerManagement.template.simWaiver", "ScoringScorerManagementSimulationWaiver");
		
		$('.ui.modal.waived-simulations')
			.modal({
				inverted: true,
				// dimmerSettings: {
				// 	dimmerName: true
				// },
				// onVisible() {
				onShow() {
					$('.ui.modal.waived-simulations').closest('.ui.dimmer.inverted').css('background-color', 'rgba(255,255,255,.45)');

					// $('.chkbx-waived-sim').change(function() {
					// 	console.log('fired')
					// });

					Session.set("ScoringScorerManagement.template.simWaiver", "ScoringScorerManagementSimulationWaiver");
				},
				onHidden() {
					Session.set("ScoringScorerManagement.waivedSims", null);
					Session.set("ScoringScorerManagement.template.simWaiver", null);
					Session.set("ScoringScorerManagement.waivedSims.scorer", null);
				}
			})
  		.modal('show');		
	},
	'click .i-remove-waived-sim'(e, tpl) {
		e.preventDefault();

		// console.log(this);
		// console.log(_selfScoringScorerManagement.waivedSimsDict);

		let 
			_uid = $(e.currentTarget).data("uid"),
			_sid = this.sid;		

		if(_uid && _sid) {

			let _waivedSims = Session.get("ScoringScorerManagement.waivedSims") 
												|| _selfScoringScorerManagement.waivedSimsDict[_uid];

			_waivedSims = _waivedSims.filter((s) => {
				return s !== _sid;
			})

			Meteor.call("Users.workload.waivedSims.update", {
				uid: _uid,
				waivedSims: _waivedSims
			}, (err, res) => {
			if(err) {
				sAlert.error("Something went wrong. Please try again.");
			} else {
				if(res && res.success && res.data) {
					sAlert.info("Successfully updated.");
				} else {
					sAlert.error("Something went wrong. Please try again.");
				}
			}
		})
		}
	},
	'click .btn-save-workload-buffer'(e, tpl) {
		e.preventDefault();

		// console.log(this);

		Util.loader($(e.currentTarget))

		let 
			_uid = this._id,
			_buffer = $("#buffer_"+_uid).val(),
			_score = this.score;

		if(_uid && _buffer) {
			Meteor.call("Users.workload.buffer.update", {
				uid: _uid,
				buffer: parseFloat(_buffer).toFixed(2),
				score: _score
			}, (err, res) => {
				if(err) {
					sAlert.error("Something went wrong. Please try again.");
				} else {
					if(res && res.success) {
						sAlert.info("Successfully updated.");	
					}
				}

				Util.loader({elem: $('#btn_save_buffer_'+_uid), done: true})
			})
		}
	},
	'click .btn-reset-workload'(e, tpl) {
		e.preventDefault();		

		let 
			_uid = this._id,
			_workload = this.score;

		if(_uid && _workload) {

			Session.set("ScoringScorerManagement.resetWorkload.scorer", this);

			$('.ui.modal.reset-workload')
				.modal({
					inverted: true,
					// dimmerSettings: {
					// 	dimmerName: true
					// },
					// onVisible() {
					onShow() {
						$('.ui.modal.reset-workload').closest('.ui.dimmer.inverted').css('background-color', 'rgba(255,255,255,.45)');						

						Session.set("ScoringScorerManagement.template.resetWorkload", "ScoringScorerManagementWorkloadReset");
					},
					onVisible() {
						$("#input_reset_workload").val(_workload);
					},
					onHidden() {
						
						Session.set("ScoringScorerManagement.template.resetWorkload", null);
						Session.set("ScoringScorerManagement.resetWorkload.scorer", null);
						
					}
				})
	  		.modal('show');	

		}
	},
	'click .btn-view-workload-details'(e, tpl) {
		e.preventDefault();

		let _uid = this._id;

		// $(".tr-details").to();
		$("#tr_details_"+_uid).toggle();
	},
	'change #chbx_one_sim_at_a_time'(e, tpl) {
		e.preventDefault();

		let 
			_isChecked = $(e.currentTarget).is(':checked'),
			_canProceed = false;			

		if(_isChecked) {
			if(confirm("Are you sure that you want scorers to score only one simulation at a time?")) {
				_canProceed = true;
			} else {
				$(e.currentTarget).prop("checked", false);
			}
		} else {
			_canProceed = true;
		}

		if(_canProceed) {
			Meteor.call("Users.workload.oneSimAtATime.update", { osaat: _isChecked }, (err, res) => {
				if(err) {
					sAlert.error("Something went wrong. Please try again.");
				} else {
					if(res && res.success && res.data) {
						sAlert.info("Successfully updated.");
					}
				}
			});
		} else {
			// console.log("Do nothing for now...");
		}
	}	
});

Template.ScoringScorerManagementSimulationWaiver.events({
	'change .chkbx-waived-sim'(e, tpl) {	
		e.preventDefault();

		// console.log(this);
		// console.log(_selfScoringScorerManagement.waivedSimsDict);

		let 
			_scorer = Session.get("ScoringScorerManagement.waivedSims.scorer"),
			_waivedSims = Session.get("ScoringScorerManagement.waivedSims");

		// console.log(_scorer);

		let _isChecked = $(e.currentTarget).is(':checked');

		if(_isChecked) {
			_waivedSims.push(this.id);
		} else {
			_waivedSims = _waivedSims.filter((_sid) => {
				return _sid !== this.id;
			})			
		}
		
		Session.set("ScoringScorerManagement.waivedSims", _waivedSims);

		Meteor.call("Users.workload.waivedSims.update", {
			uid: _scorer._id,
			waivedSims: _waivedSims
		}, (err, res) => {
			if(err) {
				sAlert.error("Something went wrong. Please try again.");
			} else {
				if(res && res.success && res.data) {
					sAlert.info("Successfully updated.");
				} else {
					sAlert.error("Something went wrong. Please try again.");
				}
			}
		})

	}	
})

Template.ScoringScorerManagementSimulationWaiver.helpers({
	Simulations() {
		if(Session.get("ScoringScorerManagement.simulations")) {
			return Session.get("ScoringScorerManagement.simulations");
		}
	},
	Waived() {
		if(Session.get("ScoringScorerManagement.waivedSims")) {			
			return Session.get("ScoringScorerManagement.waivedSims");
		}
	},	
});

Template.ScoringScorerManagementWorkloadReset.events({
	'click .btn-save-reset-workload'(e, tpl) {
		e.preventDefault();
		
		let _scorerName = $("#input_reset_workload").data("scrname");

		if(confirm("Are you sure to reset " + _scorerName + "'s workload?")) {
			let 
				_uid = $("#input_reset_workload").data("uid"),
				_workloadScore = $("#input_reset_workload").val();

			let _obj = {
				uid: _uid,
				workload: _workloadScore
			}			

			Meteor.call("Users.workload.reset.update", _obj, (err, res) => {
				if(err) {
					sAlert.error("Something went wrong. Please try again.");
				} else {
					if(res && res.success && res.data) {
						sAlert.info("Successfully updated.");
						
						$('.ui.modal.reset-workload').modal('hide');

					} else {
						sAlert.error("Something went wrong. Please try again.");
					}
				}
			})			
		}
	}
})

Template.ScoringScorerManagementWorkloadReset.helpers({
	Scorer() {
		if(Session.get("ScoringScorerManagement.resetWorkload.scorer")) {
			return Session.get("ScoringScorerManagement.resetWorkload.scorer");
		}
	}
});



