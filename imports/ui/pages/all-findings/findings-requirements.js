import { Session } from 'meteor/session'

import { Simulations } from '/imports/api/simulations/simulations.js';
import { Findings } from '/imports/api/findings/findings.js';
import { FindingsRequirements } from '/imports/api/findings-requirements/findings-requirements.js';

import { Util } from '/imports/lib/util.js'

import './findings-requirements.html'
import '/imports/ui/stylesheets/all-findings/findings-requirements.less'

let _selfFindingsRequirements

Template.FindingsRequirements.onCreated(() => {
	
	_selfFindingsRequirements = this;
	_selfFindingsRequirements.sizeOfFindingsDict = [];

});
Template.FindingsRequirements.onRendered(() => {

	$('.ui.accordion.simulations').accordion({
		exclusive: false,
    close: true,
    selector: {
      trigger: '.title.trigger'
    } 		
	});

	setTimeout(() => {
		Util.loading(false);
	}, 500);

});

Template.FindingsRequirements.events({
	'click .btn-view-findings'(e, tpl) {
		e.preventDefault();

		let 
			_id = this._id,
			_sid = this.id,
			_sname = this.name;

		if(_sid) {

			Session.set("FindingsRequirements.allReqFindings", []);

			Util.loader($(e.currentTarget));

			$("#findings_list").empty();

			let _simLabelKey = _sname.includes("Baseline") ? 'baseline' : (_sname.includes("Followup") ? 'followup' : 'prehire')

			Session.set("FindingsRequirements.simulations.chosen", _simLabelKey);
			Session.set("FindingsRequirements.simulation.id", parseInt(_sid));
			Session.set("FindingsRequirements.simulation.name", _sname);

			Meteor.subscribe("active_findings_w_sid_ordered_by_domain", parseInt(_sid));

			Template.FindingsRequirements.__helpers.get("getFindingsBySid").call();
		}
	},
	'click .btn-create-requirement'(e, tpl) {
		e.preventDefault();

		Util.loader($(e.currentTarget));

		let _sid = Session.get("FindingsRequirements.simulation.id");

		if(_sid) {
			let _reqName = $("#findings_requirement_name").val();

			if(_reqName) {
				let _obj = {
					sid: _sid,
					name: _reqName
				}

				Meteor.call("FindingsRequirements.add", _obj, (err, res) => {
					if(err) {
						Util.alert({mode: 'error'});			
					} else {
						if(res && res.success) {
							Util.alert();
						}
					}

					Util.loader({done: true});
				})
			} else {
				Util.alert({mode: 'error', msg: 'Requirement Name cannot be null.'});
				Util.loader({done: true});
			}
		} else {
			Util.alert({mode: 'error'});
			Util.loader({done: true});
		}
	},
	'click .chbx-required'(e, tpl) {
		e.preventDefault();		

		let
			_id = this._id, 
			_sid = this.simulation_id,
			_fid = this.id;

		if(_id && _sid && _fid) {

			$('.modal.findings-requirements-modal')
				.modal({
			    onApprove : function() {
			      let _freqId = $("#sel_findings_requirements").val();

			      if(_freqId) {
			      	let _obj = {
			      		_id: _freqId,
			      		sid: _sid,
			      		fid: _fid
			      	};

			      	Meteor.call("FindingsRequirements.finding.add", _obj, (err, res) => {
			      		if(err) {
			      			Util.alert({mode: 'error'});
			      		} else {
									if(res && res.success && res.data === 1) {										
										Util.alert();
										$(e.currentTarget).closest('tr').addClass('tr-required');
									}			      			
			      		}
			      	})
			      } else {
			      	Util.alert({mode: 'error', msg: "If none, please create a requirement group to select."});
			      }
			    }				
				})
	  		.modal('show');

	  	// $('.modal.findings-requirements-modal').draggable();

			// $('.findings-requirements-dropdown')
			//   .dropdown({
			//     clearable: true
			//   })

		} else {
			Util.alert({mode: 'error'});
		}	
	},
	'click .delete-finding'(e, tpl) {
		e.preventDefault();

		// console.log(this)
		let 
			_freqId = $(e.currentTarget).closest('tr').attr('id'),
			_id = _freqId.split('freq')[1],
			_fid = parseInt($(e.currentTarget).attr('id'));

		// console.log(_freqId, _fid);

		if(_id && _fid) {
			
			let _obj = {
				_id: _id,
				fid: _fid
			}

			Meteor.call("FindingsRequirements.finding.delete", _obj, (err, res) => {
				if(err) {
					Util.alert({mode: 'error'});
				} else {
					if(res && res.success) {
						Util.alert();
						$(e.currentTarget).closest('tr').removeClass('tr-required');
					}
				}

			});

		} else {
			Util.alert({mode: 'error'});
		}
	},
	'click .btn-save-threshold'(e, tpl) {
		e.preventDefault();		

		let 
			_id = this._id,
			_threshold = parseInt($("#freq_threshold_"+_id).val()),
			_total = parseInt(_selfFindingsRequirements[_id]) || parseInt($("#total_"+_id).text());		

		if(_threshold > 0 && _threshold <= _total) {
			let _obj = {
				_id: _id,
				threshold: _threshold
			}

			Meteor.call("FindingsRequirements.threshold.update", _obj, (err, res) => {
				if(err) {
					Util.alert({mode: 'error'});
				} else {
					if(res && res.success) {
						Util.alert();
					}					
				}
			})
		} else {
			Util.alert({mode: 'error'});
		}
		
	},
	'click .btn-update-status'(e, tpl) {
		e.preventDefault();

		// console.log(this)

		let 
			_id = this._id,
			_status = parseInt($(e.currentTarget).data('status'));

		if(_id && _status > 0) {
			if(_status === 4) {
				if(confirm("Are you sure to delete this requirement?")) {
					__updateFindingsRequirementStatus(_id, _status);
				}
			} else {
				__updateFindingsRequirementStatus(_id, _status);
			}

		} else {
			Util.alert({mode: 'error'});
		}
	},	
})

Template.FindingsRequirements.helpers({
	Simulations() {
		let _sims = Simulations.find().fetch();

		if(_sims && _sims.length > 0) {

			let _psCount = 0,
					_prehireSims = _sims.filter((ps) => {
				if(ps.name.includes("Prehire")) {
					_psCount++;
					return ps;
				}
			});

			let _bsCount = 0,
					_baselineSims = _sims.filter((bs) => {
				if(bs.name.includes("Baseline")) {
					_bsCount++;
					return bs;
				}
			});

			let _fsCount = 0,
					_followupSims = _sims.filter((fs) => {
				if(fs.name.includes("Follow")) {
					_fsCount++;
					return fs;
				}
			});

			_baselineSims.sort((a, b) => {
				return a.name.localeCompare(b.name);
			})

			_followupSims.sort((a, b) => {
				return a.name.localeCompare(b.name);
			})

			Session.set("FindingsRequirements.simulations.prehire.count", _psCount);
			Session.set("FindingsRequirements.simulations.baseline.count", _bsCount);
			Session.set("FindingsRequirements.simulations.followup.count", _fsCount);

			return {
				prehire: {
					count: _psCount,
					sims: _prehireSims
				},
				baseline: {
					count: _bsCount, 
					sims: _baselineSims
				},
				followup: {
					count: _fsCount, 
					sims: _followupSims
				}
			}
		}

		Util.loading(false);
	},
	PrehireCount() {
		if(Session.get("FindingsRequirements.simulations.prehire.count")) {
			return Session.get("FindingsRequirements.simulations.prehire.count");
		}
	},
	BaselineCount() {
		if(Session.get("FindingsRequirements.simulations.baseline.count")) {
			return Session.get("FindingsRequirements.simulations.baseline.count");
		}
	},
	FollowupCount() {
		if(Session.get("FindingsRequirements.simulations.followup.count")) {
			return Session.get("FindingsRequirements.simulations.followup.count");
		}
	},
  getFindingsBySid() {
  	if(Session.get("FindingsRequirements.simulation.id")) {

  		let _sid = Session.get("FindingsRequirements.simulation.id");

			Meteor.call("Findings.bySid.orderedBy.domain", {sid: parseInt(_sid)}, (err, res) => {
				if(err) {
		    	Util.alert({mode: 'error'});
		    	Util.loader({done: true});
				} else {
					
					if(res && res.success && res.data) {
						Session.set("FindingsRequirements.list", res.data);//-- update Findings list of the template
					}
					Util.loader({done: true})
				}
			});

		}  	
  },
	FindingsList() {		
		if(Session.get("FindingsRequirements.list")) {
			return Session.get("FindingsRequirements.list");
		}
	},
	FindingsRequirements() {
		let _freqs = FindingsRequirements.find({
			simulation_id: Session.get("FindingsRequirements.simulation.id"),
			status: { $ne: 4 } 
		}, {
			sort: {
				name: 1
			}
		}).fetch();

		let _allFindings = [];

		if(_freqs && _freqs.length > 0 ) {
			_freqs.forEach((q) => {
				if(q.findings && q.findings.length > 0) {
					q.findings.forEach((f) => {
						_allFindings.push(f);
					})

					_selfFindingsRequirements.sizeOfFindingsDict[q._id] = q.findings.length;
				}
			})
		}

		Session.set("FindingsRequirements.allReqFindings", _allFindings);

		return _freqs; 
	},
	AllReqFindings() {
		if(Session.get("FindingsRequirements.allReqFindings")) {
			return Session.get("FindingsRequirements.allReqFindings");
		}
	} 		
})

function __updateFindingsRequirementStatus(_id, _status) {
	let _obj = {
		_id: _id,
		status: _status
	}

	Meteor.call("FindingsRequirements.status.update", _obj, (err, res) => {
		if(err) {
			Util.alert({mode: 'error'});
		} else {
			if(res && res.success) {
				Util.alert();
			}					
		}
	})
}

