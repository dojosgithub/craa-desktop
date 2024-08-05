import { Session } from 'meteor/session'

import { Simulations } from '/imports/api/simulations/simulations.js';
import { Findings } from '/imports/api/findings/findings.js';
import { FindingsSelected } from '/imports/api/findings-selected/findings-selected.js';

import { Util } from '/imports/lib/util.js'

import './findings-selected.html'
import '/imports/ui/stylesheets/all-findings/findings-selected.less'

let _selfFindingsSelected

Template.FindingsSelected.onCreated(() => {
	
	_selfFindingsSelected = this;
	_selfFindingsSelected.sizeOfFindingsDict = [];

});
Template.FindingsSelected.onRendered(() => {

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

Template.FindingsSelected.events({
	'click .btn-view-findings'(e, tpl) {
		e.preventDefault();

		let 
			_id = this._id,
			_sid = this.id,
			_sname = this.name;

		if(_sid) {

			Session.set("FindingsSelected.allSelectedFindings", []);

			Util.loader($(e.currentTarget));

			$("#findings_list").empty();

			let _simLabelKey = _sname.includes("Baseline") ? 'baseline' : (_sname.includes("Followup") ? 'followup' : 'prehire')

			Session.set("FindingsSelected.simulations.chosen", _simLabelKey);
			Session.set("FindingsSelected.simulation.id", parseInt(_sid));
			Session.set("FindingsSelected.simulation.name", _sname);

			Meteor.subscribe("active_findings_w_sid_ordered_by_domain", parseInt(_sid));

			Template.FindingsSelected.__helpers.get("getFindingsBySid").call();
		}
	},
	'click .btn-create-sf-group'(e, tpl) {
		e.preventDefault();

		Util.loader($(e.currentTarget));

		let _sid = Session.get("FindingsSelected.simulation.id");

		if(_sid) {
			let _sfName = $("#findings_selected_name").val();

			if(_sfName) {
				let _obj = {
					sid: _sid,
					name: _sfName
				}

				Meteor.call("FindingsSelected.add", _obj, (err, res) => {
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
				Util.alert({mode: 'error', msg: 'Group Name cannot be null.'});
				Util.loader({done: true});
			}
		} else {
			Util.alert({mode: 'error'});
			Util.loader({done: true});
		}
	},
	'click .chbx-selected'(e, tpl) {
		e.preventDefault();		

		let
			_id = this._id, 
			_sid = this.simulation_id,
			_fid = this.id;

        // console.log(_id, _sid, _fid)

        // console.log(this)

		if(_id && _sid && _fid) {

			$('.modal.findings-selected-modal')
				.modal({
			    onApprove : function() {
			      let _selId = $("#sel_findings_selected").val();

			      if(_selId) {
			      	let _obj = {
			      		_id: _selId,
			      		sid: _sid,
			      		fid: _fid
			      	};

			      	Meteor.call("FindingsSelected.finding.add", _obj, (err, res) => {
			      		if(err) {
			      			Util.alert({mode: 'error'});
			      		} else {
									if(res && res.success && res.data === 1) {										
										Util.alert();
										$(e.currentTarget).closest('tr').addClass('tr-selected');
									}			      			
			      		}
			      	})
			      } else {
			      	Util.alert({mode: 'error', msg: "If none, please create a selected-findings group to select."});
			      }
			    }				
				})
	  		.modal('show');

	  	// $('.modal.findings-selected-modal').draggable();

			// $('.findings-selected-dropdown')
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

			Meteor.call("FindingsSelected.finding.delete", _obj, (err, res) => {
				if(err) {
					Util.alert({mode: 'error'});
				} else {
					if(res && res.success) {
						Util.alert();
						$(e.currentTarget).closest('tr').removeClass('tr-selected');
					}
				}

			});

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
				if(confirm("Are you sure to delete " + this.name + "?")) {
					__updateFindingsSelectedtatus(_id, _status);
				}
			} else {
				__updateFindingsSelectedtatus(_id, _status);
			}

		} else {
			Util.alert({mode: 'error'});
		}
	},
	'click .btn-sort-findings'(e, tpl) {
		e.preventDefault();

		let 
			_sortBy = $("#sel_sort_option").val(),
			_findings = Session.get("FindingsSelected.list");

		if(_findings && _findings.length > 0) {

			let _sorted = _findings;

			if(_sortBy === 'id') {
				_sorted = _findings.sort((a,b) => {
					return a.id - b.id;
				})
			}
			else if(_sortBy === 'order') {
				_sorted = _findings.sort((a,b) => {
					return a.order - b.order;
				})
			}
			else {
				_sorted = _findings.sort((a,b) => {
					return a.category_id - b.category_id;
				})
			}			

			// console.log(_sortBy, _sorted)

			Session.set("FindingsSelected.list", _sorted);
		}
		
	}	
})

Template.FindingsSelected.helpers({
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

			Session.set("FindingsSelected.simulations.prehire.count", _psCount);
			Session.set("FindingsSelected.simulations.baseline.count", _bsCount);
			Session.set("FindingsSelected.simulations.followup.count", _fsCount);

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
		if(Session.get("FindingsSelected.simulations.prehire.count")) {
			return Session.get("FindingsSelected.simulations.prehire.count");
		}
	},
	BaselineCount() {
		if(Session.get("FindingsSelected.simulations.baseline.count")) {
			return Session.get("FindingsSelected.simulations.baseline.count");
		}
	},
	FollowupCount() {
		if(Session.get("FindingsSelected.simulations.followup.count")) {
			return Session.get("FindingsSelected.simulations.followup.count");
		}
	},
    getFindingsBySid() {
  	    if(Session.get("FindingsSelected.simulation.id")) {

  		    let _sid = Session.get("FindingsSelected.simulation.id");

			Meteor.call("Findings.by.sid.orderBy.id", {sid: parseInt(_sid)}, (err, res) => {
				if(err) {
		    	Util.alert({mode: 'error'});
		    	Util.loader({done: true});
				} else {
					
					if(res && res.success && res.data) {
						Session.set("FindingsSelected.list", res.data);//-- update Findings list of the template
					}
					Util.loader({done: true})
				}
			});

		}  	
  },
	FindingsList() {		
		if(Session.get("FindingsSelected.list")) {
			return Session.get("FindingsSelected.list");
		}
	},
	FindingsSelected() {
		let _selected = FindingsSelected.find({
			simulation_id: Session.get("FindingsSelected.simulation.id"),
			status: { $ne: 4 } 
		}, {
			sort: {
                name: 1
			}
		}).fetch();

        let _allFindings = [];
        
        let _thisSimFindings = Session.get("FindingsSelected.list");

        let _selectedOutput = [];

		if(_thisSimFindings && _selected && _selected.length > 0 ) {
			_selected.forEach((q) => {
                
                let _thisSelectedFids = [];

				if(q.findings && q.findings.length > 0) {
					q.findings.forEach((f) => {
                        _thisSelectedFids.push(f)
						_allFindings.push(f);
					})

                    _selectedFindings = _thisSimFindings.filter(f => _thisSelectedFids.includes(f.id));

                    q.findings = _selectedFindings;

					_selfFindingsSelected.sizeOfFindingsDict[q._id] = q.findings.length;
                }
                _selectedOutput.push(q);
			})
		}

		Session.set("FindingsSelected.allSelectedFindings", _allFindings);

        // console.log(_selectedOutput);

		// return _selected; 
		return _selectedOutput; 
	},
	AllSelectedFindings() {
		if(Session.get("FindingsSelected.allSelectedFindings")) {
			return Session.get("FindingsSelected.allSelectedFindings");
		}
	} 		
})

function __updateFindingsSelectedtatus(_id, _status) {
	let _obj = {
		_id: _id,
		status: _status
	}

	Meteor.call("FindingsSelected.status.update", _obj, (err, res) => {
		if(err) {
			Util.alert({mode: 'error'});
		} else {
			if(res && res.success) {
				Util.alert();
			}					
		}
	})
}

