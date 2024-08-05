import { Session } from 'meteor/session'

import { Simulations } from '/imports/api/simulations/simulations.js';
import { Findings } from '/imports/api/findings/findings.js';

import { Util } from '/imports/lib/util.js'

import './findings-tips.html'
import '/imports/ui/stylesheets/all-findings/findings-tips.less'

let _selfFindingsTips

const __domainsForTips = [
    { id: 1, ids: [1], name: 'The Informed Consent Process'},
    { id: 3, ids: [3], name: 'Protocol Requirement'},
    { id: 4, ids: [4], name: 'IRB/IEC Submission and Approval'},
    { id: 5, ids: [5,6,10], name: 'Source Documentation, CRF, Source-to-CRF Review'},
    { id: 7, ids: [7,8,9,11], name: 'Potential Fraud, Scientific Misconduct and Delegation of Authority'}
];

Template.FindingsTips.onCreated(() => {
	
	_selfFindingsTips = this;
	_selfFindingsTips.sizeOfFindingsDict = [];

});
Template.FindingsTips.onRendered(() => {

	$('.ui.accordion.domains').accordion({
		exclusive: false,
    close: true,
    selector: {
      trigger: '.title.trigger'
    } 		
	});

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

Template.FindingsTips.events({
	'click .btn-view-domain-tips'(e, tpl) {
		e.preventDefault();

        // console.log(this);

		let 
			_id = this.id,
			_ids = this.ids,
            _name = this.name;            

		if(_id) {

			Session.set("FindingsTips.domain.id", _id);

			Template.FindingsTips.__helpers.get('getTips').call();

			Session.set("FindingsTips.simulation.id", null);
			Session.set("FindingsTips.finding.id", null);

			Session.set("FindingsTips.finding.tips", null);
		}
	},
	'click .btn-add-new-tip'(e, tpl) {
		e.preventDefault();

		let 
			_domainId = Session.get("FindingsTips.domain.id"),
			_tipContent = $("#txta_new_tip").val();
		
		// console.log(_domainId, _tipContent);

		if(_domainId) {

			Util.loader($(e.currentTarget));

			let _obj = {
				domainId: _domainId,
				tip: _tipContent,
				author: Meteor.userId()
			}

			Meteor.call("DomainTips.add", _obj, (err, res) => {
				if(err) {
					Util.alert({mode: 'error'});
				} else {
					Util.alert({mode: 'info', msg: 'Successfully added.'});	
					$("#txta_new_tip").val('')				
				}
				Template.FindingsTips.__helpers.get('getTips').call();
				Util.loader({done: true});
			})
		}
		// let _tip = $()
	},
	'click .btn-update-tip-status'(e, tpl) {
		e.preventDefault();

		// console.log(this);

		let 
			_id = this._id,
			_status = $(e.currentTarget).data('status');

		// console.log(_status)

		if(_id && _status) {

			_status = parseInt(_status);

			if(_id && _status > 0) {				
				if(_status === 4) {
					if(confirm("Are you sure to delete this tip?")) {
						__updateDomainTipStatus(_id, _status);
					}
				} else {
					__updateDomainTipStatus(_id, _status);
				}
	
			} else {
				Util.alert({mode: 'error'});
			}
		}
	},
	'click .btn-save-tip'(e, tpl) {
		e.preventDefault();

		// console.log(this);

		let 
		_id = this._id,
		_tipContent = $("#_tip_"+this._id).val();
	
	// console.log(_domainId, _tipContent);

		if(_id && _tipContent) {

			Util.loader($(e.currentTarget));

			let _obj = {
				_id: _id,
				content: _tipContent,
				editor: Meteor.userId()
			}

			Meteor.call("DomainTips.content.update", _obj, (err, res) => {
				if(err) {
					Util.alert({mode: 'error'});
				} else {
					Util.alert({mode: 'info', msg: 'Successfully updated.'});									
				}
				Template.FindingsTips.__helpers.get('getTips').call();
				Util.loader({done: true});
			})
		}

	},
	'click .btn-view-findings'(e, tpl) {
		e.preventDefault();

		let 
			_id = this._id,
			_sid = this.id,
			_sname = this.name;

		// console.log(this);

		if(_sid) {
			

			Util.loader($(e.currentTarget));

			$("#findings_list").empty();

			let _simLabelKey = _sname.includes("Baseline") ? 'baseline' : (_sname.includes("Followup") ? 'followup' : 'prehire')

			Session.set("FindingsTips.simulations.chosen", _simLabelKey);
			Session.set("FindingsTips.simulation.id", parseInt(_sid));
			Session.set("FindingsTips.simulation.name", _sname);

			Meteor.subscribe("active_findings_w_sid_ordered_by_domain", parseInt(_sid));

			Template.FindingsTips.__helpers.get("getFindingsBySid").call();

			Session.set("FindingsTips.domain.id", null);
			Session.set("FindingsTips.finding.id", null);
			Session.set("FindingsTips.finding.tips", null);
		}
	},
	'click .icon-view-finding-tips'(e, tpl) {
		e.preventDefault();
		
		// console.log(this);

		let 
			_fid = this.id,
			_catId = this.category_id,
			_domainId = null,
			_tips = this.tips || [];

		__domainsForTips.forEach((d) => {
			// console.log(d, d.ids, _catId, d.ids.includes(_catId))
			if(d.ids.includes(_catId)) {
				_domainId = d.id
			}
		})

		// console.log(this, _domainId);

		if(_fid && _domainId) {
			Session.set("FindingsTips.finding.id", _fid);
			Session.set("FindingsTips.finding.domain.id", _domainId);

			Session.set("FindingsTips.finding.tips", _tips);

			Template.FindingsTips.__helpers.get("getActiveTips").call();

			let 
				// _offset = $(e.currentTarget).offset(),
				_viewportTop = $(window).scrollTop(),
				// _marginTop = _offset && _offset.top && _offset.top < 300 ? _offset.top -100 : _offset.top -100;
				_marginTop = _viewportTop + 50;

			// var viewportTop = $(window).scrollTop();

			// console.log(_offset, _marginTop, viewportTop)

			$(".finding-tips-container").css({
				marginTop: _marginTop + 'px'
			})
		} else {
			Session.set("FindingsTips.tips.byDomain", null);
			Util.alert({mode: 'warning', msg: "No data to view."});
		}

	},
	'click .chkb-finding-tip'(e, tpl) {
		e.preventDefault();		

		// console.log(this);

		let 
			_tuid = this._id, //-- uid 
			_tips = Session.get("FindingsTips.finding.tips") || [],
			_fid = Session.get("FindingsTips.finding.id"),			
			_isChecked = $(e.currentTarget).is(':checked');

		if(_tuid && _fid) {

			if(_isChecked) {
				_tips.push(_tuid);
			} else {
				_tips = _tips.filter(tuid=>tuid !== _tuid)
			}

			let _obj = {
				id: _fid,
				tips: _tips
				// checked: _isChecked
			}

			// console.log(_obj)

			Meteor.call("Findings.tips.update", _obj, (err, res) => {
				if(err) {
					Util.alert({mode: 'error'});
				} else {					
					Session.set("FindingsTips.finding.tips", _tips);

					Template.FindingsTips.__helpers.get("getFindingsBySid").call();
					// Template.FindingsTips.__helpers.get("getTips").call();

					Util.alert({mode: 'info', msg: 'Successfully updated.'});					
				}
			})
			
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

			Meteor.call("FindingsTips.finding.delete", _obj, (err, res) => {
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
	'click .btn-update-status'(e, tpl) {
		e.preventDefault();

		// console.log(this)

		let 
			_id = this._id,
			_status = parseInt($(e.currentTarget).data('status'));

		if(_id && _status > 0) {
			if(_status === 4) {
				if(confirm("Are you sure to delete this requirement?")) {
					__updateFindingsTipStatus(_id, _status);
				}
			} else {
				__updateFindingsTipStatus(_id, _status);
			}

		} else {
			Util.alert({mode: 'error'});
		}
	},	
})

Template.FindingsTips.helpers({
    Domains() {
        return __domainsForTips;
    },
    getTips() {
		
		let _domainId = Session.get("FindingsTips.domain.id") || Session.get("FindingsTips.finding.domain.id");

        if(_domainId) {            

			let _obj = {
				domainId: parseInt(_domainId)
			}

			Meteor.call("DomainTips.get.byDomainId", _obj, (err, res) => {
				if(err) {
					Util.alert({mode: 'error', msg: "Something went wrong. Please try again."});
				} else {
					// console.log(res)

					if(res) {
						Util.loader({done: true});
						if(res.length > 0) {
							// Util.alert();                                                    
						} else {
							Util.alert({mode: 'warning', msg: "No data to view."});
						}
												
						Session.set("FindingsTips.tips.byDomain", res);

						// return res;
					}
				}
			});
		}		
	},
	getActiveTips() {
		let _domainId = Session.get("FindingsTips.domain.id") || Session.get("FindingsTips.finding.domain.id");

        if(_domainId) {            

			let _obj = {
				domainId: parseInt(_domainId)
			}

			Meteor.call("DomainTips.get.active.byDomainId", _obj, (err, res) => {
				if(err) {
					Util.alert({mode: 'error', msg: "Something went wrong. Please try again."});
				} else {
					// console.log(res)

					if(res) {
						Util.loader({done: true});
						if(res.length > 0) {
							// Util.alert();                                                    
						} else {
							Util.alert({mode: 'warning', msg: "No data to view."});
						}
												
						Session.set("FindingsTips.tips.active.byDomain", res);

						// return res;
					}
				}
			});
		}
	},
	DomainTips() {
		if(Session.get("FindingsTips.tips.byDomain")) {
			return Session.get("FindingsTips.tips.byDomain");
		}
	},
	ActiveDomainTips() {
		if(Session.get("FindingsTips.tips.active.byDomain")) {
			return Session.get("FindingsTips.tips.active.byDomain");
		}
	},	
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

			Session.set("FindingsTips.simulations.prehire.count", _psCount);
			Session.set("FindingsTips.simulations.baseline.count", _bsCount);
			Session.set("FindingsTips.simulations.followup.count", _fsCount);

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
		if(Session.get("FindingsTips.simulations.prehire.count")) {
			return Session.get("FindingsTips.simulations.prehire.count");
		}
	},
	BaselineCount() {
		if(Session.get("FindingsTips.simulations.baseline.count")) {
			return Session.get("FindingsTips.simulations.baseline.count");
		}
	},
	FollowupCount() {
		if(Session.get("FindingsTips.simulations.followup.count")) {
			return Session.get("FindingsTips.simulations.followup.count");
		}
	},
  getFindingsBySid() {
  	if(Session.get("FindingsTips.simulation.id")) {

  		let _sid = Session.get("FindingsTips.simulation.id");

			Meteor.call("Findings.bySid.orderedBy.domain", {sid: parseInt(_sid)}, (err, res) => {
				if(err) {
		    	Util.alert({mode: 'error'});
		    	Util.loader({done: true});
				} else {
					// console.log(res)
					if(res && res.success && res.data) {
						Session.set("FindingsTips.list", res.data);//-- update Findings list of the template
					}
					Util.loader({done: true})
				}
			});

		}  	
  },
	FindingsList() {		
		if(Session.get("FindingsTips.list")) {
			return Session.get("FindingsTips.list");
		}
	},
	FindingsTips() {
		let _freqs = FindingsTips.find({
			simulation_id: Session.get("FindingsTips.simulation.id"),
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

					_selfFindingsTips.sizeOfFindingsDict[q._id] = q.findings.length;
				}
			})
		}

		Session.set("FindingsTips.allReqFindings", _allFindings);

		return _freqs; 
	},
	hasThisTip(tuid) {
		if(Session.get("FindingsTips.finding.tips")) {

			let _tips = Session.get("FindingsTips.finding.tips") || [];

			return _tips.includes(tuid) ? 'checked' : '';
		}
	},
	hasTips() {
		// console.log(this);

		if(this.tips && this.tips.length > 0) {
			return 'has-tips'
		}
	}
})

Template.FindingsTips.onDestroyed(() => {
	
	Session.set("FindingsTips.finding.id", null);
	
})

function __updateDomainTipStatus(_id, _status) {

	let _obj = {
		_id: _id,
		status: parseInt(_status)
	}

	Meteor.call("DomainTips.status.update", _obj, (err, res) => {
		if(err) {
			Util.alert({mode: 'error'})
		} else {
			Util.alert({mode: 'info', msg: "Successfully updated."})
			Template.FindingsTips.__helpers.get('getTips').call();
		}
	})
}

