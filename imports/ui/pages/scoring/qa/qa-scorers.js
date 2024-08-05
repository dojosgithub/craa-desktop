import './qa-scorers.html';
import '/imports/ui/stylesheets/scoring/qa/qa-scorers.less'

Template.QAScorers.onCreated(function() {

});

Template.QAScorers.onRendered(function() {

});

Template.QAScorers.helpers({
	Scorers() {
		// console.log(this)
		let
			_scorer1Id = this.row.scorer1Id,
			_scorer2Id = this.row.scorer2Id,
			_scorerIds = [_scorer1Id, _scorer2Id];
			
		if(this.row.qaScorers && this.row.qaScorers.length > 0) {
			_scorerIds = _scorerIds.concat(this.row.qaScorers);
		}

// console.log(_scorerIds)
		// if(this.row && this.row.qaScorers) {
			let _scorers = Meteor.users.find({
				// 'profile.role': '7'
				_id: { $in: _scorerIds }
			}).fetch();		

			// console.log(_scorers);
			if(_scorers.length > 0) {
				
				_scorers.forEach((u,i) => { //-- 07/07/2021, redundant but needed to keep the initial scorers in the beginning of the scorer list
					if(u.profile) {

					if(u._id === _scorer1Id) {
						u.profile['_order'] = 0;
					}
					else if(u._id === _scorer2Id) {
						u.profile['_order'] = 1;
					} else {
						u.profile['_order'] = 99;
					}
					}
				});

				_scorers.sort((a,b) => a.profile._order-b.profile._order);
			}

			return _scorers;
		// }
	}
});
