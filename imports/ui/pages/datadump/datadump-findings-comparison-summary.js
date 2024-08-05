import { Session } from 'meteor/session'

const XLSX = require('xlsx');

import  { Util } from '/imports/lib/util.js'

import { Simulations } from '/imports/api/simulations/simulations.js'
import { Clients } from '/imports/api/clients/clients.js'

import './datadump-findings-comparison-summary.html'
import '/imports/ui/stylesheets/datadump/datadump-findings-comparison-summary.less'

Template.FindingsComparisonSummary.onCreated(function findingsComparisonSummaryOnCreated() {
  Util.loading(false)

  Template.FindingsComparisonSummary.__helpers.get("reset").call();
})

Template.FindingsComparisonSummary.onRendered(function() {

});

Template.FindingsComparisonSummary.helpers({
  FollowupSims() {
    let _sims = Simulations.find({
      name: { $regex: /Followup/ }
    }).fetch();

    return _sims;
  },
  BaselineSims() {
    let _sims = Simulations.find({
      name: { $regex: /Baseline/ }
    }).fetch();

    return _sims;
  },
  Clients() {
    let _clients = Clients.find().fetch();

    return _clients;
  },
  BUs() {
    return Session.get("FindingsComparisonSummary.bus")
  },  
  FollowupFindings() {
    if(Session.get("FindingsComparisonSummary.FUS")) {
      return Session.get("FindingsComparisonSummary.FUS").data || [];
    }
  },
  BaselineFindings() {
    if(Session.get("FindingsComparisonSummary.Baseline")) {
      return Session.get("FindingsComparisonSummary.Baseline").data || [];
    }
  },
  reset() {
    Session.set("FindingsComparisonSummary.FileToDownload", null);
    Session.set("FindingsComparisonSummary.Baseline", null);
    Session.set("FindingsComparisonSummary.FUS", null);
    Session.set("FindingsComparisonSummary.FUS", null);
  
    Session.set("FindingsComparisonSummary.cid", null);
    Session.set("FindingsComparisonSummary.bus", null);
  } 
})

Template.FindingsComparisonSummary.events({
  'click .btn-apply-fus'(e, tpl) {
    e.preventDefault();

    Util.loader($(e.currentTarget));

    let _fus = $('#sel_fus').val();
    
    console.log(_fus)

    Meteor.call("Findings.FindingsComparison.bySimulationId", {simulationId: parseInt(_fus)}, (err, res) => {
      // console.log(err, res);

      if(err) {
        Util.alert({mode: 'error'}, {message: err});
      } else {
        if(res) {
          Session.set("FindingsComparisonSummary.FUS", res);
        }
      }

      Util.loader({done: true}) 
    })

  },
  'click .btn-apply-baseline'(e, tpl) {
    e.preventDefault();

    let _baseline = $('#sel_baseline').val();

    // console.log(_baseline);
    let _obj = {
      simulationId: parseInt(_baseline)
    }

    if(Session.get("FindingsComparisonSummary.FUS")) {
      _obj['domainIds'] = Session.get("FindingsComparisonSummary.FUS").domainIds || [];
    }

    Meteor.call("Findings.FindingsComparison.bySimulationId", _obj, (err, res) => {
      // console.log(err, res);

      if(err) {
        Util.alert({mode: 'error'});
      } else {
        if(res) {
          Session.set("FindingsComparisonSummary.Baseline", res);
        }
      }

      Util.loader({done: true}) 
    })    

  },
  'click .btn-submit-comparison'(e, tpl) {
    e.preventDefault();

    Util.loader($(e.currentTarget));

    let 
      _fus_id = $("#sel_fus").val() || null,
      _baseline_id = $("#sel_baseline").val() || null,
      _filename = $("#file_name").val() || "FindingsComparison";

    let 
      _clientId = $("#sel_client").val() || null,
      _buId = $("#sel_bu").val() || null;

      // console.log(_clientId, _buId)
    if(_fus_id && _baseline_id && _filename) {

      let 
        _fus_findings = [],
        _baseline_findings = [];

      $(".input-fus-baseline-id").each(function() {
        // console.log($(this).data('fid'), $(this).val())
        if($(this).val() !== "") {
          _fus_findings.push($(this).data('fid'));
          _baseline_findings.push(parseInt($(this).val()));
        }
      })

      if(_fus_findings.length > 0 &&  _baseline_findings.length > 0) {

        let _obj = {
          fus_id: parseInt(_fus_id),
          baseline_id: parseInt(_baseline_id),
          fus_findings: _fus_findings,
          baseline_findings: _baseline_findings,
          filename: _filename,
          clientId: _clientId,
          buId: _buId
        }

        // console.log(_obj);

        Meteor.call("UsersScoreSummary.FindingsComparisonSummary.export", _obj, (err, res) => {
          if(err) {
            Util.alert({mode: 'error'})
            Util.loader({done: true}) 
          } else {
            if(res) {
              // console.log(res)
    
              // let wb = res.data
    
              // // console.log(wb);
              // /* "Browser download file" from SheetJS README */
              // let
              //   wopts = { bookType:'xlsx', bookSST:false, type:'binary' },
              //   wbout = XLSX.write(wb, wopts)
    
              // // let filename = client_name+'-'+bu_name+'-'+simulation_name+'-'+Util.dateHMS(new Date)+'.xlsx'
              // let filename = 'Baseline-OA-Global--1 and Global Follow Up 2 Findings Comparison Report-'+Util.dateHMS(new Date)+'.xlsx'
    
              // saveAs(new Blob([Util.s2ab(wbout)],{type:"application/octet-stream"}), filename);  
                
              // var blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
              // fileSaver.saveAs(blob, fileName);

              // res.wb.xlsx.writeBuffer()
              // .then((buf) => {
              //     saveAs(new Blob([buf]), "Test.xlsx");
              // });       
              
              // res.wb.xlsx.writeBuffer().then(function (data) {
              // res.wb.writeBuffer().then(function (data) {
              //   var blob = new Blob([data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
              //   saveAs(blob, 'fileName.xlsx');
              // });
            
              if(res.filename) {
                // let link = 
                // `<a id="excel_report_file" href=""https://s3.amazonaws.com/craav2-us-east-1-uploads/fc_exports/${res.filename}" referrerpolicy="origin" download="${res.filename}" target="_blank">${res.filename}</a><br>
                // <div class="send-excel-message">Click the file above to download.</div>`;
                // `<a id="excel_report_file" href=""https://s3.amazonaws.com/craav2-us-east-1-uploads/fc_exports/${res.filename}" download="${res.filename}">${res.filename}</a>`;

                // $("#fc_excel_file").show().find('pre').empty().append(link);
                // $("#fc_excel_file").show();
                Session.set("FindingsComparisonSummary.FileToDownload", res.filename)
              }

              Util.alert();
              
            } else {
              Util.alert({mode: 'error'})        	
            }
    
            Util.loader({done: true});
          }
          
        })        

      } //-- if(_fus_findings.length > 0 &&  _baseline_findings.length > 0) {
      else {
        Util.alert({mode: 'error', msg: 'No mapped baseline findings'})
        Util.loader({done: true}) 
      }

    } //-- if(_fus_id && _baseline_id) {
    else {
      Util.alert({mode: 'error', msg: 'Both FU & Baseline sims required'})
      Util.loader({done: true}) 
    }    

    Util.loader({done: true}) 

  },
  // 'dragstart .baseline-finding-id'(e, tpl) {
  'dragstart #dragtarget'(e, tpl) {
    e.preventDefault();

    console.log(e.target.id)

    // e.dataTransfer.setData("baseline_id", e.target.id);
    e.originalEvent.dataTransfer.setData("baseline_id", e.target.id);
    Session.set("FindingsComparisonSummary.dragStart.data", e.target.id);

  },
  // 'dragover .drop-input-fus-baseline-id'(e, tpl) {
  'dragenter .droptarget'(e, tpl) {
    e.preventDefault();

    // console.log("AAA")
  },
  // 'drop .input-fus-baseline-id'(e, tpl) {
  // 'drop .td-fus-baseline-id'(e, tpl) {
  // 'drop .drop-input-fus-baseline-id'(e, tpl) {
  'drop .droptarget'(e, tpl) {
  // 'drop .li-baseline-finding'(e, tpl) {
    // e.preventDefault();

    let _data = e.originalEvent.dataTransfer.getData("baseline_id");
    let data = Session.get("FindingsComparisonSummary.dragStart.data");

    console.log("drop => ", _data);
    console.log("drop data => ", data);

    if(data || _data) {
      $(e.currentTarget).val(data);
      Session.set("FindingsComparisonSummary.dragStart.data", null);
    }
  },
  'change #sel_client'(e,tpl) {
    e.preventDefault();

    let cid = $(e.currentTarget).val()

    // console.log(cid)

    if(cid) {
      let bus = Clients.find({
        'bus.client_id': cid
      }, {
        fields: {
          bus: 1
        }
      }).fetch()

      Session.set("FindingsComparisonSummary.cid", cid)
      Session.set("FindingsComparisonSummary.bus", bus[0].bus)

    }
  } 
});

Template.FindingsComparisonSummary.onDestroyed(() => {
  Template.FindingsComparisonSummary.__helpers.get("reset").call();
})

$(function() {
// $('.drop-input-fus-baseline-id').on('drop',function(e){
$('.test').on('drop',function(e){
  e.preventDefault();
  // event.dataTransfer.dropEffect = 'copy';  // required to enable drop on DIV
  let _data = e.originalEvent.dataTransfer.getData("baseline_id");

  console.log("DDDD => ", _data)
})
});
