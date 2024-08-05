import { Session } from 'meteor/session'

const XLSX = require('xlsx');

import { Util } from '/imports/lib/util.js'

import './scoring-scorers.html'
import '/imports/ui/stylesheets/scoring/scoring-scorers.less'

Template.ScoringScorers.onCreated(function() {

})

Template.ScoringScorers.onRendered(function() {

})

Template.ScoringScorers.helpers({
  Scorers() {
    return Meteor.users.find({
      $or: [
        {'profile.role': '2'},
        {'profile.role': '7'}
      ],
      'profile.status': 1
    }, 
    {
      sort: {
        'profile.role': -1,
        'profile.fullname': 1
      }
    }
    )
  }
})

Template.ScoringScorers.events({
  'click .btn-compute-scorer-data'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    let 
      // uid = $('.sel-scorers').val(),
      uid = $('.sel-scorers').dropdown('get value'),
      // fullname = $('#sel_scorers:selected').text()
      fullname = $('.sel-scorers').dropdown('get text')

    let scorerObj = {
      name: fullname,
      uid: uid,
      // findings: Session.get("Findings.count")
      findings: Session.get("Findings.count") && Session.get("Findings.count").findings
    }

// console.log(scorerObj);

    Meteor.call("Scoring.scorer.export", scorerObj, (err, res) => {
      if(err) {
        Util.alert({mode: 'error'})
        Util.loader({done: true})
      } else {
        // console.log(res)
        if(res && res.success) {
            let wb = res.data

            // console.log(wb);
            /* "Browser download file" from SheetJS README */
            let
              wopts = { bookType:'xlsx', bookSST:false, type:'binary' },
              wbout = XLSX.write(wb, wopts)

            let filename = fullname+'-'+Util.dateHMS(new Date)+'.xlsx'

            saveAs(new Blob([Util.s2ab(wbout)],{type:"application/octet-stream"}), filename);  

            Util.loader({done: true})           
        } else {
          Util.alert({mode: 'warning', msg: 'No data to process'})
          Util.loader({done: true})  
        }
      }
    })
  }
})