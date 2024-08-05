import { Session } from 'meteor/session'

import { Util } from '/imports/lib/util.js'

import { Clients } from '/imports/api/clients/clients.js';

import './collaboration-audit-etl.html';
import '/imports/ui/stylesheets/uba/collaboration-audit-etl.less'

Template.UBACollaborationAuditETL.onCreated(function() {

	Tracker.autorun(() => {
		let _clients = Clients.find().fetch();
		
		if(_clients && _clients.length > 0) {
			Session.set("UBACollaborationAuditETL.clients", _clients);
		}
	});
});

Template.UBACollaborationAuditETL.helpers({
	Clients() {
		if(Session.get("UBACollaborationAuditETL.clients")) {
			let 
				_clients = Session.get("UBACollaborationAuditETL.clients"),
				_bus = [],
				_nClients = [];

			if(_clients.length > 0) {

				_clients.sort((a,b) => {
					if(a.name && b.name) {
						return a.name.localeCompare(b.name);
					}
				})

				_clients.forEach((c) => {
					if(c.bus) {
						let _nBus = c.bus.sort((a,b) => {
							return a.name.localeCompare(b.name);
						})

						c.bus = _nBus;

						_nClients.push(c);
					}
				});			

				return _nClients;
			}
		}
	}
});

Template.UBACollaborationAuditETL.events({
	'click .btn-compute'(e, tpl) {
		e.preventDefault();

		// console.log(this);
		let _myRole = Meteor.user().profile.role;

		if(_myRole) {
			let _myIntRole = parseInt(_myRole);

			if(_myRole < 2)
			
				Util.loader($(e.currentTarget));
			
				let 
					cid = this.client_id,
					buid = this._id;

				if(cid && buid) {

					let _obj = {
						cid: this.client_id,
						buid: this._id
					}

					Meteor.call("UBA.CollaborationAudit.compute", _obj, (err, res) => {
						if(err) {
							Util.alert({mode: 'error'});
						} else {
							// console.log(res);
							Util.alert();
						}

						Util.loader({done: true})
					});

				} else {
					Util.alert({mode: 'error'});
				}

			} else {
				Util.alert()
			}
	},
	'click .btn-update-collaboration-audit-data'(e, tpl) {
		e.preventDefault();

		if(confirm("Are you sure you want to update the collaboration audit data of all clients and business units? This may slow down your machine.")) {

			Util.loader($(e.currentTarget));

			Meteor.call("UBA.CollaborationAudit.ETL.update.all", {}, (err, res) => { //-- see users-score-summary methods.uba
				if(err) {
					Util.alert({mode: 'error', msg: err});
				} else {
					// console.log(res);
					Util.alert();
				}
				Util.loader({done: true});
			});

		}
	}
});

