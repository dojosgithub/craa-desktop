import { Session } from 'meteor/session';

import '/imports/lib/template-helpers.js'
import { Util } from '/imports/lib/util.js'

import './collaboration-audit-templates.html';
import '/imports/ui/stylesheets/uba/collaboration-audit-templates.less'

Template.UBACollaborationAuditReviewed.events({
	'click .btn-reviewed'(e, tpl) {
		e.preventDefault();

		// console.log(this);
		Util.loader($(e.currentTarget));

		if(this && this.data && this.data._id) {
			
			// let _id = this.data._id._str;
			let _id = this.data._id;

			if(_id) {

				let 
					_reviewed = $(e.currentTarget).data('val'),
					_nReviewed = _reviewed ? false : true;

				let _obj = {
					_id: _id,
					reviewed: _nReviewed,
					cid: this.data.cid,
					buid: this.data.buid,
					sid: parseInt(this.data.sid),
					u1Id: this.data.u1Id,
					u2Id: this.data.u2Id,
					author: Meteor.userId()
				}

				Meteor.call("CollaborationAudit.reviewed.update", _obj, (err, res) => {
					if(err) {
						Util.alert({mode: 'error', msg: err});
					} else {						
						if(res === 1) {
							Util.alert();
						} else {
							Util.alert({mode: 'error'});
						}
					}
				})

				Util.loader({done: true});

			}
		}
	}
});

Template.UBACollaborationAuditComment.onRendered(function() {
    // $('.button.btn-view-comment')
    //   .popup({
    //     on: 'hover'
    //   });  
})

Template.UBACollaborationAuditComment.events({
	'click .btn-add-comment0'(e, tpl) {
		e.preventDefault();

		// console.log("UBACollaborationAuditComment => ", this);

		Util.loader($(e.currentTarget));

		if(this && this.data && this.data._id) {
			
			// let _id = this.data._id._str;
			let _id = this.data._id;

			if(_id) {

				Session.set("CollaborationAudit.comment.obj", this.data);

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
	'click .btn-edit-comment0'(e, tpl) {
		e.preventDefault();

		// console.log(this);

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
	'click .btn-delete-comment0'(e, tpl) {
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
	}
});

Template.UBACollaborationAuditCollaborated.events({
	'click .has-collaborated-container'(e, tpl) {
		e.preventDefault();

		// console.log(this);

		Util.loader($(e.currentTarget));

		if(this && this.data && this.data._id) {
			
			let _id = this.data._id;

			if(_id) {

				let 
					_collaborated = $(e.currentTarget).data('val'),
					_nCollaborated = _collaborated ? false : true;

				let _obj = {
					_id: _id,
					collaborated: _nCollaborated,
					cid: this.data.cid,
					buid: this.data.buid,
					sid: parseInt(this.data.sid),
					u1Id: this.data.u1Id,
					u2Id: this.data.u2Id,
					author: Meteor.userId()
				}

				Meteor.call("CollaborationAudit.collaborated.update", _obj, (err, res) => {
					if(err) {
						Util.alert({mode: 'error', msg: err});
					} else {						
						if(res === 1) {
							Util.alert();
						} else {
							Util.alert({mode: 'error'});
						}
					}
				})

				Util.loader({done: true});

			}
		}		
	}
});

