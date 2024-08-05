import { Session } from 'meteor/session'

import { Util } from '/imports/lib/util.js'

import './qa-main-action.html';
import '/imports/ui/stylesheets/scoring/qa/qa-main-action.less';
// import '/imports/ui/stylesheets/scoring/qa/scoring-qa-settings.less';

Template.QAMainAction.onCreated(function() {

});

Template.QAMainAction.onRendered(function() {

});

Template.QAMainAction.helpers({
  LoadQAView() {
    import('/imports/ui/pages/scoring/qa/scoring-qa-view.js').then(modScoringQAReview => {

      let _asmtId = Session.get("ScoringQAView.assessmentId");
      
      // console.log("_asmtId1: ", _asmtId);

      $(".scoring-qa-view-sidebar")
      .sidebar({
        // dimPage: false,
        // exclusive: false,
        // closable: false,
        // returnScroll: true
        onShow() {
          // console.log("_asmtId2: ", _asmtId);
          // Session.set("UserNotes.uid", uid)
          Session.set("QAMainAction.qaViewSidebar.template", "ScoringQAView");
          // Session.set("QAMainAction.qaSidebar.data", _data);

          $('.scoring-qa-pusher').addClass("overflow-y-auto"); 

          Util.log(Meteor.user(), "qa-main/view/"+_asmtId, "scoring");           
        },
        onHidden() {
          Session.set("QAMainAction.qaViewSidebar.template", null);
          // Session.set("QAMainAction.qaSidebar.data", null);
          Session.set("ScoringQASettings.isQASim", null);
          
          $('.scoring-qa-pusher').removeClass("overflow-y-auto");
        }
      })
      .sidebar('setting', 'transition', 'overlay')
      // .sidebar('setting', 'transition', 'push')
      // .sidebar('setting', 'transition', 'auto')
      // .sidebar('setting', 'transition', 'scale down')
      // .sidebar('setting', 'dimPage', false)
      // .sidebar({
      //   transition: 'scale down'
      // })        
      // .sidebar('setting', 'transition', 'uncover')
      .sidebar('toggle');

    });    
  }
});

Template.QAMainAction.events({
	'click .btn-view-qa-settings'(e, tpl) {
		e.preventDefault();

		// console.log(this)

    let 
      _data = this.row, 
      _asmtId = _data && _data.assessmentId || null,
      _scorer1Id = _data && _data.scorer1Id || null,
      _scorer2Id = _data && _data.scorer2Id || null;

    if(_asmtId) {
      // import('/imports/ui/pages/scoring/qa/scoring-qa-settings.js').then(scoringQASettings => {
      // import '/imports/ui/stylesheets/scoring/qa/scoring-qa-settings.less';
      	
      import('/imports/ui/pages/scoring/qa/scoring-qa-settings.js').then(modScoringQASettings => {      	

        // console.log(_data)
        $(".scoring-qa-settings-sidebar")
        .sidebar({
          // dimPage: false,
          // exclusive: false,
          // closable: false,
          // returnScroll: true
          onShow() {
            // Session.set("UserNotes.uid", uid)
            Session.set("QAMainAction.qaSettingsSidebar.template", "ScoringQASettings");
            Session.set("ScoringReviewAction.qa-sidebar.data", _data);

            $('.scoring-qa-pusher').addClass("overflow-y-auto");
            
            Util.log(Meteor.user(), "qa-main/settings/"+_asmtId, "scoring");
          },
          onHidden() {
            Session.set("QAMainAction.qaSettingsSidebar.template", null);
            Session.set("QAMainAction.qaSidebar.data", null);
            Session.set("ScoringQASettings.isQASim", null);
            
            $('.scoring-qa-pusher').removeClass("overflow-y-auto");
          }
        })
        .sidebar('setting', 'transition', 'overlay')
        // .sidebar('setting', 'transition', 'auto')
        // .sidebar('setting', 'transition', 'scale down')
        // .sidebar('setting', 'dimPage', false)
        // .sidebar({
        //   transition: 'scale down'
        // })        
        // .sidebar('setting', 'transition', 'uncover')
        .sidebar('toggle');

      });
    }		
	},	
	'click .btn-view-qa-scores'(e, tpl) {
		e.preventDefault();

		// console.log(this)

    let 
      _data = this.row, 
      _asmtId = _data && _data.assessmentId || null,
      _scorer1Id = _data && _data.scorer1Id || null,
      _scorer2Id = _data && _data.scorer2Id || null;

    if(_asmtId) {
      
      Meteor.call("SimUsersSummary.get.qa.data", {assessmentId: _asmtId}, (err, res) => {
        
        // console.log(err, res);

        if(err) {
          // Util.alert({mode: 'error', msg: err});
          Util.alert({mode: 'error', msg: "Please check if the QA Settings/Answers are set-up."});
        } else {
          // console.log(res)
          if(res && res.success) {
            let _qaData = res.data && res.data || []; 

            Session.set("ScoringQAView.assessmentId", _qaData.assessmentId);
            Session.set("ScoringQAView.qa.data.notes", _qaData.notes);
            Session.set("ScoringQAView.qa.data.notes.count", _qaData.countNotes);
            Session.set("ScoringQAView.qa.data.scorers", _qaData.qaScorers);
            Session.set("ScoringQAView.qa.data.findings", _qaData.sbs);
            Session.set("ScoringQAView.qa.data.scorers.count", _qaData.qaScorers.length || 0);

            Session.set("ScoringQAView.qa.data.fullname", _qaData.fullname);
            Session.set("ScoringQAView.qa.data.initial", _qaData.initial);

            Template.QAMainAction.__helpers.get("LoadQAView").call();

            Util.alert();
          } else {
            Util.alert({mode: 'error', msg: err});
          }
        }
      })
    }		
	}
});
