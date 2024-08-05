import { Session } from 'meteor/session';

import Tabular from 'meteor/aldeed:tabular';

const XLSX = require('xlsx');

import { Util } from '/imports/lib/util.js'

import { CollaborationAudit } from '/imports/api/collaboration-audit/collaboration-audit.js'

import './collaboration-audit.html';

import '/imports/ui/stylesheets/uba/collaboration-audit.less'

import './collaboration-audit-templates.js';

let _selfUBACollAudit = null;

Template.UBACollaborationAudit.onCreated(function() {

  _selfUBACollAudit = this;

  Session.set("UBACollaborationAudit.comment.obj", null);

})

Template.UBACollaborationAudit.onRendered(function() {
  Tracker.autorun(function() {
    if(!Session.get("UBACollaborationAudit.filters")) {
      Session.set("UBACollaborationAudit.filters", {
        status: 1,
        percent: { $gte: 80 },
        excluded: { $ne: true }
      })
  
      // $("#percent_filter_dropdown option[value=" + 80 + "]").prop('selected', true);
      // $("#percent_filter_dropdown").val('80');
      // $("#percent_filter_dropdown option:eq('80')").prop('selected', true);
      // $("#percent_filter_dropdown option:eq('80')").attr('selected', 'selected');
    }
  });  
});

Template.UBACollaborationAudit.helpers({
  CommentModalObject() {
    if(Session.get("UBACollaborationAudit.comment.obj")) {
      // console.log("CommentModalObject => ", Session.get("UBACollaborationAudit.comment.obj"));
      return Session.get("UBACollaborationAudit.comment.obj");
    }
  },
  collaborationAuditSelector() {
    // let _$_filters = Session.get("UBACollaborationAudit.filters");
    // console.log(_$_filters);
    // return _$_filters;
    return Session.get("UBACollaborationAudit.filters");
  }, 
});

Template.UBACollaborationAudit.events({
  'click .btn-recompute'(e, tpl) {
    e.preventDefault();

    let _d = $(e.currentTarget).data('d');
    console.log(this, _d);
    if(_d) {

      let 
        _uid = null,
        _uname = null,
        _sid = this.data.sid,
        _sname = this.data.simName;

      if(_d == '1') {
        _uid = this.data.u1Id,
        _uname = this.data.u1Name;        
      }
      else if(_d == '2') {
        _uid = this.data.u2Id,        
        _uname = this.data.u2Name;        
      }

      let 
        _buId = this.data.buid;
      
      if(confirm("Are you sure you want to re-compute " + _uname + "'s data?")) {

        Util.loader($(e.currentTarget));

        Meteor.call("CollaborationAudit.recompute",{
          position: parseInt(_d),
          userId: _uid,
          buId: _buId
        }, (err, res) => {
          if(err) {
            Util.alert({mode: 'error'});
          } else {
            if(res) {
              Util.alert();
            } else {
              Util.alert({mode: 'error'});
            }
          }

          Util.loader({done: true});
        })
      }

    }

  },
  'click .btn-export-collaboration-audit-data'(e, tpl) {
    e.preventDefault();
    
    if(confirm("Are you sure to export audit data? This may slow down your computer.")) {
      
      Util.loader($(e.currentTarget));

      let _filters = Session.get("UBACollaborationAudit.filters");

      Meteor.call("CollaborationAudit.export", _filters, (err, res) => {
        if(err) {
          Util.alert({mode: 'error'});
          Util.loader({done: true});
        } else {
          if(res) {
              let wb = res.data;

              // console.log(res.data.length);
              let
                wopts = { bookType:'xlsx', bookSST:false, type:'binary' },
                wbout = XLSX.write(wb, wopts)

              let filename = 'CollaborationAudit-'+Util.dateHMS(new Date)+'.xlsx'

              saveAs(new Blob([Util.s2ab(wbout)],{type:"application/octet-stream"}), filename);  

              Util.loader({done: true})           
          }
        }
      })
    }
  },  
	'click .btn-view-init-data'(e, tpl) {
		e.preventDefault();

		Util.loader($(e.currentTarget));

    Meteor.call("UBA.CollaborationAudit.compute", {}, (err, res) => {
      if(err) {
        Util.alert({mode: 'error', msg: err})
        Util.loader({done: true});
      } else {
      	// console.log(res);

        if(res && res.success && res.data) {
          
          if(res.data.diff && res.data.diff.length > 0) {          

          } else {
            Util.alert({mode: 'error', msg: 'Not enough data to present.'})
          }
          Util.loader({done: true})
        } else {
          Util.alert({mode: 'error'})
        }
      }

      Util.loader({done: true})      
    })		
	},
  'click .btn-update-data'(e, tpl) {
    e.preventDefault();

    let 
      _country =  $("#country_filter_dropdown").val(),
      _sim = $("#sim_filter_dropdown").val(),
      _mode = $("#mode_filter_dropdown").val(),
      _percent = $("#percent_filter_dropdown").val();

    let _filters = {};

    if(_country === '2') {
        _filters['$expr'] = { $eq: ['$u1Country', '$u2Country'] }; //-- use single quotatation mark as in 'REGEX_EXPRESSION', /REGEX_EXPRESSION/ won't work well
    }

    if(_sim !== '1') {
      if(_sim === '2') {
        _filters['simName'] = { $regex: 'Baseline' }; //-- use single quotatation mark as in 'REGEX_EXPRESSION', /REGEX_EXPRESSION/ won't work well
      }
      else if(_sim === '3') {
        _filters['simName'] = { $regex: 'Followup' };
      }
    }

    _filters['excluded'] = { $ne: true }
    if(_mode === '1') {
      // _filters['excluded'] = { $exists: false };
    } else {
      if(_mode === '2') {
        _filters['reviewed'] = true;
      }
      else if(_mode === '3') {
        _filters['reviewed'] = { $ne: true };
      }
      else if(_mode === '4') {
        _filters['collaborated'] = true;
      }
      else if(_mode === '5') {
        _filters['comment'] = { $exists: true };
      }
      else if(_mode === '6') {
        _filters['excluded'] = true
      }                  
    }    
     
    if(_percent) {
      _percent = parseInt(_percent);
      _filters['percent'] = { $gte: _percent };
    }

    Session.set("UBACollaborationAudit.filters", _filters); 

  },
  'click .btn-exclude'(e, tpl) {
    e.preventDefault();

    // console.log(this);
    let _d = $(e.currentTarget).data('d');
    // console.log(_d);
    if(_d) {

      let 
        _uid = null,
        _uname = null,
        _sid = this.data.sid,
        _sname = this.data.simName;

      if(_d == '1') {
        _uid = this.data.u1Id,
        // _uname = this.u1fname + ' ' + this.u1lname;
        _uname = this.data.u1Name;
        // _obj['user1Id'] = _uid;
      }
      else if(_d == '2') {
        _uid = this.data.u2Id,
        // _uname = this.u2fname + ' ' + this.u2lname;
        _uname = this.data.u2Name;
        // _obj['user2Id'] = _uid;
      }
      
      if(confirm("Are you sure you want to exclude " + _uname + "'s " + _sname + " data?")) {
        // let _key = this.data.key;

        // Meteor.call("UBA.CollaborationAudit.exclude", {userId: _uid}, (err, res) => {
        Meteor.call("UBA.CollaborationAudit.exclude", {
          uid: _uid,
          sid: parseInt(_sid)
        }, (err, res) => {
          if(err) {
            Util.alert({mode: 'error'});
          } else {
            if(res) {
              // Template.UBACollaborationAudit.__helpers.get("getCollaborationAuditData").call();
              // Template.UBACollaborationAudit.__helpers.get("TotalSizeOfAuditData").call();
              Util.alert();
            }
          }
        })
      }

    }
  }, 
  'click .btn-include'(e, tpl) {
    e.preventDefault();

    // console.log(this);
    let _d = $(e.currentTarget).data('d');
    // console.log(_d);
    if(_d) {

      let 
        _uid = null,
        _uname = null,
        _sid = this.data.sid,
        _sname = this.data.simName;

      if(_d == '1') {
        _uid = this.data.u1Id,
        // _uname = this.u1fname + ' ' + this.u1lname;
        _uname = this.data.u1Name;
        // _obj['user1Id'] = _uid;
      }
      else if(_d == '2') {
        _uid = this.data.u2Id,
        // _uname = this.u2fname + ' ' + this.u2lname;
        _uname = this.data.u2Name;
        // _obj['user2Id'] = _uid;
      }
      
      if(confirm("Are you sure you want to include " + _uname + "'s " + _sname + " data?")) {
        // let _key = this.data.key;

        // Meteor.call("UBA.CollaborationAudit.exclude", {userId: _uid}, (err, res) => {
        Meteor.call("UBA.CollaborationAudit.include", {
          uid: _uid,
          sid: parseInt(_sid)
        }, (err, res) => {
          if(err) {
            Util.alert({mode: 'error'});
          } else {
            if(res) {
              // Template.UBACollaborationAudit.__helpers.get("getCollaborationAuditData").call();
              // Template.UBACollaborationAudit.__helpers.get("TotalSizeOfAuditData").call();
              Util.alert();
            }
          }
        })
      }

    }
  },   
  'click .btn-reviewed'(e, tpl) {
    e.preventDefault();

    // console.log(this);
    Util.loader($(e.currentTarget));

    if(this && this._id) {
      
      // let _id = this.data._id._str;
      let _id = this._id;

      if(_id) {

        let 
          _reviewed = $(e.currentTarget).data('val'),
          _nReviewed = _reviewed ? false : true,
          _idx = $(e.currentTarget).data('idx');

        let _obj = {
          _id: _id,
          reviewed: _nReviewed,
          cid: this.cid,
          buid: this.buid,
          sid: parseInt(this.sid),
          u1Id: this.u1Id,
          u2Id: this.u2Id,
          author: Meteor.userId()
        }

        Meteor.call("CollaborationAudit.reviewed.update", _obj, (err, res) => {
          if(err) {
            Util.alert({mode: 'error', msg: err});
          } else {            
            if(res === 1) {
              Util.alert();

              let _data = Session.get("UBACollaborationAudit.data");
              _data[_idx].reviewed = _nReviewed;

              Session.set("UBACollaborationAudit.data", _data);

            } else {
              Util.alert({mode: 'error'});
            }
          }
        })

        Util.loader({done: true});

      }
    }     
  },  
  'click .btn-add-comment'(e, tpl) {
    e.preventDefault();

    // console.log(this);

    Util.loader($(e.currentTarget));

		if(this && this.data && this.data._id) {
			
			// let _id = this.data._id._str;
			let _id = this.data._id;

			if(_id) {

				Session.set("UBACollaborationAudit.comment.obj", this.data);

				$('.collaboration-audit-comment-modal')
					.modal({
						inverted: true,
						centered: false,
						dimmerSettings: {
							dimmerName: "collaboration-audit-comment-modal-dimmer"
						},
						onApprove(el) {

							Util.loader($(".btn-save-comment"));
														
							let _comment = $("#collaboration_audit_comment").val();

							let _o = Session.get("UBACollaborationAudit.comment.obj");

							if(_comment) {

								let _obj = {
									_id: _o._id,
									cid: _o.cid,
									buid: _o.buid,
									sid: _o.sid,
									u1Id: _o.u1Id,
									u2Id: _o.u2Id,
									author: Meteor.userId(),									
									comment: _comment
								}

								Meteor.call("CollaborationAudit.comment.update", _obj, (err, res) => {
									if(err) {
										Util.alert({mode: 'error', msg: err})
									} else {										
										if(res) {
											$('.collaboration-audit-comment-modal').modal('hide');
											// return true; //-- this'd close the modal window but not working.
                      Util.alert();
										} else {
											Util.alert({mode: 'error'});
										}										
									}
								})

								Util.loader({done: true});

							} else {
								Util.alert({mode: 'error', msg: 'omment cannot be null.'})
								Util.loader({done: true});
							}

							return false;
						},
						onHidden() {
							$("#collaboration_audit_comment").val('');
						}
					})
  				.modal('show');				

				Util.loader({done: true});

			}
		}
  },
  'click .btn-edit-comment'(e, tpl) {
    e.preventDefault();    

    Util.loader($(e.currentTarget));

		if(this && this.data && this.data._id) {
			
			let 
				// _id = this.data._id._str,
				_id = this.data._id,
				_comment = this.data.comment;

			if(_id && _comment) {

				Session.set("CollaborationAudit.comment.obj", this.data);

				$('.collaboration-audit-comment-modal')
					.modal({
						inverted: true,
						centered: false,
						dimmerSettings: {
							dimmerName: "collaboration-audit-comment-modal-dimmer"
						},
						onVisible() {
							$("#collaboration_audit_comment").val(_comment);
						},
						onApprove(el) {

							Util.loader($(".btn-save-comment"));
														
							let _comment = $("#collaboration_audit_comment").val();

							let _o = Session.get("CollaborationAudit.comment.obj");

							if(_comment) {

								let _obj = {
									_id: _o._id,
									cid: _o.cid,
									buid: _o.buid,
									sid: _o.sid,
									u1Id: _o.u1Id,
									u2Id: _o.u2Id,
									author: Meteor.userId(),									
									comment: _comment
								}

								Meteor.call("CollaborationAudit.comment.update", _obj, (err, res) => {
									if(err) {
										Util.alert({mode: 'error', msg: err})
									} else {										
										if(res) {
											$('.collaboration-audit-comment-modal').modal('hide');
											// return true; //-- this'd close the modal window but not working.
                      Util.alert();
										} else {
											Util.alert({mode: 'error'});
										}										
									}
								})

								Util.loader({done: true});

							} else {
								Util.alert({mode: 'error', msg: 'Comment cannot be null.'})
								Util.loader({done: true});
							}

							return false;
						},
						onHidden() {
							$("#collaboration_audit_comment").val('');
						}						
					})
  				.modal('show');				

				Util.loader({done: true});

			}
		}
  },
  'click .btn-delete-comment'(e, tpl) {
    e.preventDefault();

		if(confirm("Are you sure you want to delete this comment?")) {
			// console.log(this);

			Util.loader($(e.currentTarget));

			if(this && this.data && this.data._id) {
				
				let _id = this.data._id;

				if(_id) {
					Session.set("CollaborationAudit.comment.obj", this.data);

					let _o = Session.get("CollaborationAudit.comment.obj");

					let _obj = {
						_id: _o._id,
						cid: _o.cid,
						buid: _o.buid,
						sid: _o.sid,
						u1Id: _o.u1Id,
						u2Id: _o.u2Id,
						author: Meteor.userId(),
						comment: _o.comment
					}

					Meteor.call("CollaborationAudit.comment.delete", _obj, (err, res) => {
						if(err) {
							Util.alert({mode: 'error', msg: err});
						} else {						
							if(res) {
								Util.alert();
							} else {
								Util.alert({mode: 'error'});
							}
						}
					});

					Util.loader({done: true});
				}

			}

			Util.loader({done: true});
		}
  },
  'click .has-collaborated-container'(e, tpl) {
    e.preventDefault();

    // console.log(this);

    Util.loader($(e.currentTarget));

    if(this && this._id) {
      
      let _id = this._id;

      if(_id) {

        let 
          _collaborated = $(e.currentTarget).data('val'),
          _nCollaborated = _collaborated ? false : true,
          _idx = $(e.currentTarget).data('idx');

        let _obj = {
          _id: _id,
          collaborated: _nCollaborated,
          cid: this.cid,
          buid: this.buid,
          sid: parseInt(this.sid),
          u1Id: this.u1Id,
          u2Id: this.u2Id,
          author: Meteor.userId()
        }

        Meteor.call("CollaborationAudit.collaborated.update", _obj, (err, res) => {
          if(err) {
            Util.alert({mode: 'error', msg: err});
          } else {            
            if(res === 1) {
              Util.alert();

              let _data = Session.get("UBACollaborationAudit.data");
              _data[_idx].collaborated = _nCollaborated;

              Session.set("UBACollaborationAudit.data", _data);              

            } else {
              Util.alert({mode: 'error'});
            }
          }
        })

        Util.loader({done: true});

      }
    }   
  },
  'click .search-lastname-pair'(e, tpl) {
    e.preventDefault();

    if(confirm("Are you sure you want to view only the cases for this user pair?")) {
      let _names = $("#user_lastname_pair").val();

      if(_names.includes(",")) {
        console.log("user pair => ", _names);
      } else {
        console.log("single => ", _names);
      }
    }
  }    
});

Template.UBACollaborationAudit.onDestroyed(function() {
  Session.set("UBACollaborationAudit.filters", null);
})

function _curPageSet(params) {
  let
    _pageParams =  params,
    _pageNavSetIndex = _pageParams.pageNavSetIndex || 0,
    _sizePerPage = _pageParams.sizePerPage || 20,
    _pageSet = [];  

  if(_pageNavSetIndex >=0 && _sizePerPage > 0) {

    let 
      _start = _pageNavSetIndex * 10,
      _end = _start + 10;

    for( let i = _start; i < _end; i++ ) {
      _pageSet.push({page: i+1});
    }    

    return _pageSet;
  }  
}
