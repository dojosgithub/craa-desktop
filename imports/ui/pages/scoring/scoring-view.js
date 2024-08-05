import { Meteor } from 'meteor/meteor'
import { Session } from 'meteor/session'

import smalltalk from 'smalltalk/legacy';

import '/imports/lib/template-helpers.js';
import { Util } from '/imports/lib/util.js'

import { DocumentFolders } from '/imports/api/document-folders/document-folders.js'
import { Documents } from '/imports/api/documents/documents.js'
import { MonitoringNotes } from '/imports/api/monitoring-notes/monitoring-notes.js'
import { ScoringViewed } from '/imports/api/scoring-viewed/scoring-viewed.js'
import { NonErrors } from '/imports/api/non-errors/non-errors.js'
import { Findings } from '/imports/api/findings/findings.js'
import { ScoringBehaviors } from '/imports/api/scoring-behaviors/scoring-behaviors.js'
import { ScoringAdjudication } from '/imports/api/scoring-adjudication/scoring-adjudication.js'
import { SimUsersSummary } from '/imports/api/sim-users-summary/sim-users-summary.js'

import './scoring-view.html'
import '/imports/ui/stylesheets/scoring/scoring-view.less'

let _selfScoringView

Template.ScoringView.onCreated(function scoringViewOnCreated() {

  _selfScoringView = this;
  _selfScoringView.qaAnswersDict = [];

  let params = Session.get("Scoring.view")

  _selfScoringView.key = params[0].name
  _selfScoringView.view = params[0].value

  Session.set("ScoringView.numOfMonitoringNotes", null)
})

Template.ScoringView.onRendered(function scoringViewOnRendered() {
  let 
    which = _selfScoringView.view.which,
    scorer1 = _selfScoringView.view.s1name,
    scorer2 = _selfScoringView.view.s2name,
    assessee = _selfScoringView.view.uname,
    sname = _selfScoringView.view.sname;

  let qa = _selfScoringView.view.qa || null; //-- added for QA(08/20/2019, dq)
    
  if(qa === '1') {
    Session.set("ScoringView.qa", true);
  } else {
    Session.set("ScoringView.qa", false);
  }
  // if(which === 2) {
  //   scorer = _selfScoringView.view.s2name;
  // }

  // document.title = "Scoring Review: " + assessee + " by " + scorer
  document.title = assessee + "::" + sname + " by scorer1: " + scorer1 + ", scorer2: " + scorer2

  let _height = $(window).height();

  $('.scoring-view-grid').css({
    height: _height-10+'px'
  })

  // $('.scoring-view-grid > .column').css({
  //   overflow: 'auto'
  // })

  // Tracker.autorun(() => {

  //   let _mnIds = $("td.td-mn-id").length

  //   let 
  //     _viewsS1 = $('.td-mn-viewed.s1').length,
  //     _viewedS1 = $('.td-mn-viewed.s1 > i.green').length,
  //     _notviewedS1 = $('.td-mn-viewed.s1 > i.grey').length

  //     _notviewedS1 = _viewsS1 - _viewedS1

  //   let 
  //     _viewsS2 = $('.td-mn-viewed.s2').length,
  //     _viewedS2 = $('.td-mn-viewed.s2 > i.green').length,
  //     _notviewedS2 = $('.td-mn-viewed.s2 > i.grey').length    

  //     _notviewedS2 = _viewsS2 - _viewedS2

  //   let 
  //     _neS1 = $('i.ne.s1').length,
  //     _neS2 = $('i.ne.s2').length,
  //     _neS3 = $('i.ne.s3').length

  //   let _bhs3 = $('i.bh.s3').length

  //   // console.log(_mnIds)
  //   // console.log(_viewsS1)
  //   // console.log(_viewedS1)
  //   // console.log(_notviewedS1)
  //   // console.log(_viewsS2)
  //   // console.log(_viewedS2)
  //   // console.log(_notviewedS2)

  //   // console.log(_neS1)
  //   // console.log(_neS2)
  //   // console.log(_neS3)

  //   // $('.th-mn-viewed-sub.s1 span').html(_viewedS1+'/'+_viewsS1)
  //   // $('.th-mn-viewed-sub.s2 span').html(_viewedS2+'/'+_viewsS2)

  //   $('.th-mn-viewed-sub.s1 span').html(_notviewedS1)
  //   $('.th-mn-viewed-sub.s2 span').html(_notviewedS2)

  //   $('.th-mn-ne-sub.s1 span').html(_neS1)
  //   $('.th-mn-ne-sub.s2 span').html(_neS2)
  //   $('.th-mn-ne-sub.s3 span').html(_neS3)

  //   $('.th-bh-status-sub.s3 span').html(_bhs3)

  //   _mnIds = _mnIds === 0 ? _viewsS1 : _mnIds

  //   Session.set("ScoringView.numOfMonitoringNotes", _mnIds)

  // })

    Util.loading(false)
})

Template.ScoringView.helpers({
  Scorer1() {
    return _selfScoringView.view.s1name
  },
  Scorer2() {
    return _selfScoringView.view.s2name
  },
  Adjudicator() {
    return _selfScoringView.view.adjname
  },    
  DocumentFolders() {
    return DocumentFolders.find()
  },  
  Documents() {
    return Documents.find({
      folder_id: this.id
    })
  }, 
  MonitoringNotes() {
    let _mns = MonitoringNotes.find({
      // 'document.folder_id': this.id
      'document.document_id': this.id
    })

    // let _countMNs = _mns.fetch().length

    // console.log(_countMNs)

    return _mns
  },
  NumOfMonitoringNotes() {
    let _numMNs = MonitoringNotes.find({status: 1}).count()
    
    Session.set("ScoringView.numOfMonitoringNotes", _numMNs)
    return Session.get("ScoringView.numOfMonitoringNotes")
  },
  ScroingViewed() {
    
    let _viewed = ScoringViewed.findOne({
      note_id: this._id
    })
// console.log(this._id, _viewed, _selfScoringView.view.which)
    if(_viewed) {
      // if(_selfScoringView.view.which === 1) {
      //   return {viewed: _viewed.assessor1 && _viewed.assessor1.viewed}
      // }
      // else if(_selfScoringView.view.which === 2) {
      //   return {viewed: _viewed.assessor2 && _viewed.assessor2.viewed}
      // }   
      return {
        s1:  _viewed.assessor1 && _viewed.assessor1.viewed,
        s2:  _viewed.assessor2 && _viewed.assessor2.viewed
      }   
    }
  },
  NonError() {
    let _ne = NonErrors.findOne({
      'note._id': this._id
    })

    if(_ne) {
      // if(_selfScoringView.view.which === 1 
      //     && (_ne.assessor1 && _ne.assessor1._id === _selfScoringView.view.s1id)) {
      //   return _ne.assessor1
      // }
      // else if(_selfScoringView.view.which === 2 
      //     && (_ne.assessor2 && _ne.assessor2._id === _selfScoringView.view.s2id)) {
      //   return _ne.assessor2
      // }

      return {
        s1: _ne.assessor1,
        s2: _ne.assessor2,
        adj: _ne.adjudicator,
        _id: _ne._id
      }     
    }
  },
  NumOfNonErrors() {
    // let _numNEs = NonErrors.find().count()
    let _nes = NonErrors.find().fetch()
    
    if(_nes && _nes.length > 0) {
    
      let _nes1 = _nes2 = _nes3 = 0

      _nes.forEach((ne) => {
        if(ne.assessor1 && ne.assessor1.status === 1) {
          _nes1++
        }
        else if(ne.assessor2 && ne.assessor2.status === 1) {
          _nes2++
        }
        if(ne.adjudicator && (ne.adjudicator.non_errors || ne.adjudicator.status === 1)) {
          _nes3++          
        }                
      })

      let nesObj = {
        s1: _nes1,
        s2: _nes2,
        s3: _nes3,
      }
      Session.set("ScoringView.nes", nesObj)
    }
    
    return Session.get("ScoringView.nes")
  },  
  NumOfAdjudication() {
    let _adj = ScoringAdjudication.find({status: 1}).fetch()

    if(_adj && _adj.length > 0) {
      let _adjBHs = _adj[0].behaviors && _adj[0].behaviors.length || ''

      Session.set("ScoringView.adjs", _adjBHs)

      return Session.get("ScoringView.adjs")
    }
  },
  NumOfScoringViewed() {
    let _s1viewed = ScoringViewed.find({
      'assessor1.viewed': true
    }).count()

    let _s2viewed = ScoringViewed.find({
      'assessor2.viewed': true
    }).count()

    let mns = Session.get("ScoringView.numOfMonitoringNotes")

    let 
      _s1notviewed = mns - _s1viewed,
      _s2notviewed = mns - _s2viewed


    let _vObj = {
      s1: _s1notviewed,
      s2: _s2notviewed
    }      

    Session.set("ScoringView.viewd", _vObj)

    return Session.get("ScoringView.viewd")

  },
  Findings() {
    let _findings = Findings.find({
      document_id: this.id
    })

    // console.log(_findings.fetch())

    return _findings
  },
  ScoringBehaviors() {
    let _sbs = ScoringBehaviors.findOne({
      'behavior._id': this._id
    })

    let _output = this;

    if(_sbs) {
      _output['assessor1'] = _sbs.assessor1;
      _output['assessor2'] = _sbs.assessor2;
      _output['adjudicator'] = _sbs.adjudicator;
      // _output['behavior'] = _sbs.behavior;
      _output['assessment_id'] = _sbs.assessment_id;
      _output['qaAnswer'] = _sbs.qaAnswer;
    }

// console.log(_output);
    return _output;
  },
  isqa() {
    if(Session.get("ScoringView.qa")) {      
      return Session.get("ScoringView.qa");
    }
  },
  // SimUsersSummary() {

  //   let _paramValues = Session.get("Scoring.view") && Session.get("Scoring.view")[0] && Session.get("Scoring.view")[0].value;

  //   if(_paramValues && _paramValues.asmtid) {
  //     let _sus = SimUsersSummary.findOne({
  //       assessmentId: _paramValues.asmtid
  //     });

  //     if(_sus) {
  //       if(_sus.qaAnswers) {
  //         _sus.qaAnswers.forEach((a) => {
  //           let _fkey = 'f'+a.id;            
  //           if(!_selfScoringView.qaAnswersDict[_fkey]) {
  //             _selfScoringView.qaAnswersDict[_fkey] = a
  //           }
  //         })
  //       }
  //     }      
  //   }
  // }
})

Template.ScoringView.events({
  'click .btn-view-nonerror'(e, tpl) {
    e.preventDefault()

    let 
      nid = $(e.currentTarget).parent().data('nid'),
      assessor = parseInt($(e.currentTarget).parent().data('assessor')),
      ne = NonErrors.findOne(nid)
    
    if(ne) {

      let
        _assessor = '', 
        _neText = ''


      let 
        _wWidth = $(window).width(),
        _wLeft = _wWidth/2 -100,
        pos = $(e.target).offset(),
        top = pos.top-70 || e.pageY,
        // left = pos.left-420 || e.pageX    
        left = pos.left-400 || e.pageX    
        // left = _wLeft || e.pageX;

      // smalltalk.alert(_assessor, _neText).then(function() {
      //     //-- Ok callback
      // });

      // $('.smalltalk').css({
      //   left: left+'px',
      //   top: top+'px'
      // })


      if(assessor === 1) {
        _assessor = _selfScoringView.view.s1name
        _neText = ne.assessor1.non_error || ''
      }
      else if(assessor === 2) {
        _assessor = _selfScoringView.view.s2name
        _neText = ne.assessor2.non_error || ''
      }

      smalltalk.alert(_assessor, _neText).then(function() {
          //-- Ok callback
      });

      $('.smalltalk').css({
        left: left+'px',
        top: top+'px'
      })

      if (assessor === 3) {
        _assessor = _selfScoringView.view.adjname

        // if(ne.adjudicator.non_errors.adjudicator 
        //   && ne.adjudicator.non_errors.adjudicator.non_error 
        //   && ne.adjudicator.non_errors.adjudicator.status === 1 )
        // _neText = 
        //   ne.adjudicator.non_errors.adjudicator.status === 1 
        //   && ne.adjudicator.non_errors.adjudicator.non_error 
        //   || "*Denied*"


        let mnInfoBox = `
          <ul class="mn-ne-info-container">
              <table class="tbl-mn-ne-info">
                  <thead>
                      <tr>
                          <th>Scorer</th>
                          <th>Non-error</th>
                          <th>Status</th>
                      </tr>
                      <tr class="mn-ne-info-scorer1">
                          <td></td><td></td><td></td>
                      </tr>
                      <tr class="mn-ne-info-scorer2">
                          <td></td><td></td><td></td>
                      </tr>
                      <tr class="mn-ne-info-adjudicator">
                          <td></td><td></td><td></td>
                      </tr>                                
                  </thead>
              </table>       
          </ul>
        `

        $('.smalltalk .content-area').html(mnInfoBox)

        let s1_ne = '',
            s2_ne = '',
            s3_ne = '';

        let s1_status = '',
            s2_status = '',
            s3_status = '';    

        if(ne.assessor1) {
            if(ne.assessor1.non_error) {
                s1_ne = ne.assessor1.non_error;                
            }
        }

        if(ne.assessor2) {
            if(ne.assessor2.non_error) {
                s2_ne = ne.assessor2.non_error;                
            }
        }

        if(ne.adjudicator) {
            if(ne.adjudicator.non_errors.adjudicator) {
                s3_ne = ne.adjudicator.non_errors.adjudicator.non_error;                
            }

            if(ne.adjudicator.non_errors.assessor1) {
                s1_status = (ne.adjudicator.non_errors.assessor1.status === 4) ? 'Deleted' : 'Active';
                if(ne.adjudicator.non_errors.assessor1.non_error) {
                    s3_ne = ne.adjudicator.non_errors.assessor1.non_error;
                    s1_status = "Accepted";
                    s3_status = "Active";
                }
            }

            if(ne.adjudicator.non_errors.assessor2) {
                s2_status = (ne.adjudicator.non_errors.assessor2.status === 4) ? 'Deleted' : 'Active';
                if(ne.adjudicator.non_errors.assessor2.non_error) {
                    s3_ne = ne.adjudicator.non_errors.assessor2.non_error;
                    s2_status = "Accepted";
                    s3_status = "Active";
                }                
            }  

            if(ne.adjudicator.non_errors.adjudicator) {
                s3_status = (ne.adjudicator.non_errors.adjudicator.status === 4) ? 'Deleted' : 'Active';
            }                      
        }

        $('.mn-ne-info-container').find(".mn-ne-info-scorer1 td:eq(0)").html(_selfScoringView.view.s1name);        
        $('.mn-ne-info-container').find(".mn-ne-info-scorer1 td:eq(1)").html(s1_ne);
        $('.mn-ne-info-container').find(".mn-ne-info-scorer1 td:eq(2)").html(s1_status);
              
        $('.mn-ne-info-container').find(".mn-ne-info-scorer2 td:eq(0)").html(_selfScoringView.view.s2name);        
        $('.mn-ne-info-container').find(".mn-ne-info-scorer2 td:eq(1)").html(s2_ne);
        $('.mn-ne-info-container').find(".mn-ne-info-scorer2 td:eq(2)").html(s2_status);
        
        $('.mn-ne-info-container').find(".mn-ne-info-adjudicator td:eq(0)").html(_assessor);        
        $('.mn-ne-info-container').find(".mn-ne-info-adjudicator td:eq(1)").html(s3_ne);
        $('.mn-ne-info-container').find(".mn-ne-info-adjudicator td:eq(2)").html(s3_status);



      }

      // $('.smalltalk .header').html(_assessor)
      // $('.smalltalk .content-area').html(_neText)      

      if(assessor === 3) {

        // let mnInfoBox = `
        //   <ul class="mn-ne-info-container">
        //       <div class="close-mn-ne-info">
        //           <button class="btn-xs btn-danger btn-close-mn-ne-info"><i class="fa fa-times" aria-hidden="true"></i></button>
        //       </div>
        //       <table class="tbl-mn-ne-info">
        //           <thead>
        //               <tr>
        //                   <th>Scorer</th>
        //                   <th>Non-error</th>
        //                   <th>Status</th>
        //               </tr>
        //               <tr class="mn-ne-info-scorer1">
        //                   <td></td><td></td><td></td>
        //               </tr>
        //               <tr class="mn-ne-info-scorer2">
        //                   <td></td><td></td><td></td>
        //               </tr>
        //               <tr class="mn-ne-info-adjudicator">
        //                   <td></td><td></td><td></td>
        //               </tr>                                
        //           </thead>
        //       </table>       
        //   </ul>
        // `

        // $('.smalltalk .content-area').html(mnInfoBox)
      }

    }
  },
  'click .btn-identified'(e, tpl) {
    e.preventDefault();    

    // let 
    //   _asmtId = this.assessment_id,
    //   _bh = this.behavior,
    //   _fid = _bh.id;

    let 
      _asmtId = this.assessment_id,
      // _bh = this.behavior,
      _fid = this.id;

    if(_asmtId && _fid) {

      let _bhObj = {
        assessmentId: _asmtId,
        id: parseInt(_fid),
        identified: true
      };

      Meteor.call("SimUsersSummary.qaAnswers.update", _bhObj, (err, res) => {
        if(err) {
          Util.alert({mode: 'error', msg: err})
        } else {
          
          if(res) {
            Util.alert();
            $("#qa_mnid_"+_fid).focus();
          } else {
            Util.alert({mode: 'error', msg: err})
          }          
        }
      });
    }
  },
  'click .btn-unidentified'(e, tpl) {
    e.preventDefault();
    
    let 
      _asmtId = this.assessment_id,
      // _bh = this.behavior,
      _fid = this.id;

    if(_asmtId && _fid) {

      let _bhObj = {
        assessmentId: _asmtId,
        id: parseInt(_fid),
        identified: false
      };

      Meteor.call("SimUsersSummary.qaAnswers.update", _bhObj, (err, res) => {
        if(err) {
          Util.alert({mode: 'error', msg: err})
        } else {
          
          if(res) {
            Util.alert();            
          } else {
            Util.alert({mode: 'error', msg: err})
          }           
        }
      });
    }
  },
  'change .input-qa-mnid'(e, tpl) {
    e.preventDefault();

    let
      // _bh = this.behavior, 
      _asmtId = this.assessment_id,
      _fid = this.id,
      _mnid = e.target.value;

// console.log(_asmtId, _fid, _mnid)

    if(_asmtId && _fid) {

      let _bhObj = {
        assessmentId: _asmtId,
        id: parseInt(_fid),
        mnid: parseInt(_mnid) || null
      };

      Meteor.call("SimUsersSummary.qaAnswers.update.mnid", _bhObj, (err, res) => {
        if(err) {
          Util.alert({mode: 'error', msg: err})
        } else {
          
          if(res) {
            Util.alert();            
          } else {
            Util.alert({mode: 'error', msg: err})
          }            
        }
      });
    }

  }
})

Template.ScoringView.onDestroyed(() => {
  Session.set("ScoringView.numOfMonitoringNotes", null);
  Session.set("ScoringView.qa", null);
})

$(window).resize(function(){
   setContainerWidth();
});

function setContainerWidth()
{

  let _height = $(window).height();

  $('.scoring-view-grid').css({
    height: _height-10+'px'
  })

  // $('.scoring-view-grid > .column').css({
  //   overflow: auto
  // })

  //-- This is related to the stikcy header idea.
  // let _theadHeight = $('.tbl-scoring thead').height()
  // $('.tbl-scoring-monitoring-notes').css({ //-- To place table right below the top head
  //   'margin-top': _theadHeight -11 +'px'
  // })

  //-- This is related to the stikcy header idea.
  // let _mnContentWidth = $('.td-mn-content').width()
  // $('.th-mn-content').css('width', _mnContentWidth+'px')

}

