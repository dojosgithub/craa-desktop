import { Session } from 'meteor/session'

import { Util } from '/imports/lib/util.js'

import '/imports/api/sim-users-summary/sim-users-summary.js'

// import '/imports/ui/stylesheets/photon/css/photon.min.css'

import './scoring-review-action.html'
import '/imports/ui/stylesheets/scoring/scoring.less'

Template.ScoringReviewAction.events({
  'click .btn-view-viewport'(e, tpl) {
    e.preventDefault()

    // console.log(this)

    let
      row = this.row,
      asmtid = row.assessmentId,
      cid = row.clientId,
      buid = row.buId,
      sid = row.simulationId,
      uid = row.userId,
      s1id = row.scorer1Id,
      s2id = row.scorer2Id,
      adjid = row.adjudicatorId,
      sname = row.simulationName,
      uname = row.fullname,      
      initial = row.initial,
      s1name = row.scorer1Name,
      s2name = row.scorer2Name,
      adjname = row.adjudicatorName,
      which = 1;

    let qa = row.qa || null; //-- added for QA (08/20/2019, dq)

    let
      sp = '/',
      // _url = asmtid+sp+cid+sp+buid+sp+sid+sp+uid+sp+s1id+sp+s2id+sp+adjid+sp+sname+sp+uname+sp+initial+sp+s1name+sp+s2name+sp+adjname+sp+which;
      _url = asmtid+sp+cid+sp+buid+sp+sid+sp+uid+sp+s1id+sp+s2id+sp+adjid+sp+sname+sp+uname+sp+initial+sp+s1name+sp+s2name+sp+adjname+sp+qa+sp+which;

    let 
      screenWidth = window.screen.availWidth || window.screen.width,
      screenHeight = window.screen.availHeight || window.screen.height;

    // if(Meteor.isDesktop) {
    //   Desktop.send('desktop', 'setWindowSize', {width: screenWidth, height: screenHeight})
    // }

                    //     const remote = require('electron').remote;
                    // const BrowserWindow = remote.BrowserWindow;

                    // var win = new BrowserWindow({ width: screenWidth, height: screenHeight });

    // console.log(Meteor.isDesktop)
    // console.log(_url);

    let _serverUrl = 
      process.env.NODE_ENV === "production" ? 
        'https://lsgyq68kcl6cmeyscgxe.craassessments.com/'+___aR+'/scoring/'+_url : 
          'http://localhost:3000/'+___aR+'/scoring/'+_url

      if(Meteor.isDesktop) {
        Desktop.send('desktop', 'viewScoring', {
          width: screenWidth, 
          height: screenHeight,
          // url: 'https://lsgyq68kcl6cmeyscgxe.craassessments.com/'+___aR+'/simulations'
          // url: 'http://localhost:3000/'+___aR+'/scoring/'+_url
          // url: 'https://lsgyq68kcl6cmeyscgxe.craassessments.com/'+___aR+'/scoring/'+_url
          url: _serverUrl
        })
      }

      // window.open("/"+___aR+"/simulations", "Scoring", "width=420,height=230,resizable,scrollbars=yes,status=1")
      // window.open("/"+___aR+"/simulations", "Scoring")

      Util.log(Meteor.user(), "scoring/view/"+asmtid, "scoring")

  },
  'click .btn-view-results'(e, tpl) {
    e.preventDefault()

    alert("Not implemented yet...")
  },
  'click .btn-view-qa-settings'(e, tpl) {
    e.preventDefault();

    // console.log(this);

    let 
      _data = this.row, 
      _asmtId = _data && _data.assessmentId || null,
      _scorer1Id = _data && _data.scorer1Id || null,
      _scorer2Id = _data && _data.scorer2Id || null;

    if(_asmtId) {
      // import('/imports/ui/pages/scoring/qa/scoring-qa-settings.js').then(scoringQASettings => {
      import('/imports/ui/pages/scoring/qa/scoring-qa-settings.js').then(modScoringQASettings => {

        // console.log(_data)
        $(".scoring-qa-sidebar")
        .sidebar({
          // dimPage: false,
          // exclusive: false,
          // closable: false,
          // returnScroll: true
          onShow() {
            // Session.set("UserNotes.uid", uid)
            Session.set("ScoringReviewAction.qa-sidebar.template", "ScoringQASettings");
            Session.set("ScoringReviewAction.qa-sidebar.data", _data);

            $('.scoring-qa-pusher').addClass("overflow-y-auto");

            Util.log(Meteor.user(), "qa-settings", "scoring");
          },
          onHidden() {
            Session.set("ScoringReviewAction.qa-sidebar.template", null);
            Session.set("ScoringReviewAction.qa-sidebar.data", null);
            Session.set("ScoringQASettings.isQASim", null);
            
            $('.scoring-qa-pusher').removeClass("overflow-y-auto");
          }
        })
        // .sidebar('setting', 'transition', 'overlay')
        // .sidebar('setting', 'transition', 'auto')
        .sidebar('setting', 'transition', 'scale down')
        // .sidebar('setting', 'dimPage', false)
        // .sidebar({
        //   transition: 'scale down'
        // })        
        // .sidebar('setting', 'transition', 'uncover')
        .sidebar('toggle');

      });
    }
  }
});

Template.ScoringReviewAction.helpers({
});

