import { Session } from 'meteor/session'

const XLSX = require('xlsx');

// import autosize from 'autosize'

import { Util } from '/imports/lib/util.js'

import { Findings } from '/imports/api/findings/findings.js'
import { DocumentFolders } from '/imports/api/document-folders/document-folders.js'
import { Documents } from '/imports/api/documents/documents.js'

// import '/client/lib/autosize.js'

import './findings.html'
import '/imports/ui/stylesheets/simulations/findings.less'
import { toLocaleString } from 'core-js/fn/number/epsilon';

// import './findings-preview.js'

// const all_active_documents = new MysqlSubscription("documents_w_sid")
// const all_active_documents = new MysqlSubscription("all_active_documents")

let _selfFindings

let 
  _myFindingsDocs = [], 
  _myFindingsDocIds = [],
  _myFindingsDocNames = [],
  _myFindingsDomains = [
    {name: 'ICF Process', id: 1},
    {name: 'IRB Reporting', id: 2},
    {name: 'IEC Reporting', id: 2},
    {name: 'Protocol Requirement', id: 3},
    {name: 'IEC Submission/Approval', id: 4},
    {name: 'IRB Submission/Approval', id: 4},
    {name: 'Source Documentation', id: 5},        
    {name: 'Source to EDC/EDC', id: 6},
    {name: 'Potential Fraud', id: 7},
    {name: 'Delegation of Authority', id: 8},
    {name: 'Delegation of Authority and Training', id: 9},
    {name: 'Source Documentation/Source to EDC/EDC', id: 10},
    {name: 'Potential Fraud/Scientific Misconduct', id: 11},

  ]

Template.Findings.onCreated(function findingsOnCreated() {
  _selfFindings = this
  _selfFindings.count = []
  _selfFindings.count.all = []
  _selfFindings.count.active = []
  _selfFindings.count.inactive = []
  _selfFindings.count.excluded = 0

  Session.set("Findings.length", null)
  Session.set("Findings.length.active", null)
  Session.set("Findings.docids", null)
  Session.set("Findings.SimDocIds", null)
  Session.set("Findings.documents.thisSim", null)
  Session.set("Finding.count", null)

  Session.set("Findings.trigger", new Date)

  let sid = parseInt(Session.get('Simulations.id'))

  _selfFindings.autorun(() => {
      _selfFindings.subscribe('document_folders_w_sid', sid)
      _selfFindings.subscribe('documents_w_sid', sid)
      _selfFindings.subscribe('document_files_w_sid', sid)

      _selfFindings.subscribe('protocols_w_sid', sid)

      _selfFindings.subscribe('findings_w_sid', sid)      
  })


  // _selfFindings.autorun(() => {
    
    // if(Session.get("Simulations.id")) {
      // _selfFindings.findingsSubscription = Meteor.subscribe('findings_w_sid', Session.get("Simulations.id"))


  // all_active_documents.change(Session.get("Simulations.id"))
  // console.log('aaa', Session.get("Simulations.id"))
  // all_active_documents.reactive()

  // console.log(Session.get("Simulations.id"), all_active_documents)

    // }    

  // })

  // all_active_documents.change(Session.get("Simulations.id"))
  
  // all_active_documents.reactive()

  // console.log(Session.get("Simulations.id"), all_active_documents)
  

  _selfFindings.domains = []
  _selfFindings.domains['ICF Process'] = 1
  _selfFindings.domains['IRB Reporting'] = 2
  _selfFindings.domains['IEC Reporting'] = 2
  _selfFindings.domains['EC Reporting'] = 2
  _selfFindings.domains['Protocol Requirement'] = 3
  _selfFindings.domains['IRB Submission/Approval'] = 4
  _selfFindings.domains['IEC Submission/Approval'] = 4
  _selfFindings.domains['Source Documentation'] = 5
  _selfFindings.domains['Source Documentation / Source to CRF / CRF'] = 5
  _selfFindings.domains['Source to CRF/CRF'] = 6
  _selfFindings.domains['Source to EDC/EDC'] = 6
  _selfFindings.domains['Potential Fraud'] = 7
  _selfFindings.domains['Delegation of Authority'] = 8
  _selfFindings.domains['Source Documentation/Source to EDC/EDC'] = 10 
  _selfFindings.domains['Potential Fraud/Scientific Misconduct'] = 11 

  Session.set("Findings.domains", _selfFindings.domains)

})

Template.Findings.onRendered(findingsOnRendered => {
  Util.loader({done: true})

  // $('textarea').autosize().show().trigger('autosize.resize');
  // autosize(document.querySelectorAll('textarea'));
  // Tracker.afterFlush(() => {
  //   autosize(document.querySelectorAll('textarea'));
  // })

// autosize($('textarea'));
// console.log('aaa', $('.tbl-findings tr').length)
  // $('.txta-finding-content').each(function(idx) {
  //   console.log(this)
  //   // $(this).height(0).height(this.scrollHeight);
  //   // t.change()
  // })

  // $('td .txta-finding-content').css('background-color', 'red')
  // all_active_documents.reactive()

  // console.log(Session.get("Simulations.id"), all_active_documents)

  // $('.tr-finding.ui.form')
  // .form({
  //   inline: true,
  //   fields: {
  //     name: {
  //       identifier: 'txta_finding_content',
  //       rules: [
  //         {
  //           type   : 'empty',
  //           prompt : 'Finding content cannot be null'
  //         }
  //       ]
  //     }     
  //   },
  //   onSuccess: function(data) {
  //     console.log('aaa')
  //     // console.log(data) //- Nothing...
  //     // Template.Protocols.__helpers.get('addNewProtocolDocument').call()
  //     return false //-- This'd avoid submitting the form w/o invoking loginWithPassword
  //   }
  // })

// using context
// $('.context.example .ui.sidebar')
//   .sidebar({
//     context: $('.context.example .bottom.segment')
//   })
//   .sidebar('attach events', '.context.example .menu .item')

  Tracker.autorun(() => {
    // if(Session.get('Findings.length')) {

    //   setTimeout(() => {
    //     // $('#count_findings').html(Session.get('Findings.length'))
    //     $('.findings-top-menu button').prop('disabled', false)

    //     if(Session.get('Findings.length') || Session.get('Findings.trigger')) {
    //     // $('.ui.seasrch').each(function(i) {          
    //       $('.ui.search').search({
    //         source: Session.get("Findings.documents.thisSim"),
    //         searchFullText: true
    //       })
    //     // })
    //     }

    //   }, 1000)
    // // }
    if(Session.get('Findings.length') || Session.get('Findings.trigger')) {      

      setTimeout(() => {
        $('.findings-top-menu button').prop('disabled', false)

        $('.tr-finding .ui.search').search({  
          source: Session.get("Findings.documents.thisSim"),
          // searchFullText: true
          fullTextSearch: true //-- to avoid error message about using a new name 'fullTextSearch' (happened after updating semantic-ui to 2.4)
        })
      }, 1000)
    }


  })

  if($('.ui.dimmer.modals.page').find('.findings-preview-modal')[1]) {
    $('.ui.dimmer.modals.page').find('.findings-preview-modal')[0].remove()
  }

})

Template.Findings.helpers({
  DocumentFolders() {
    if(Session.get("Findings.trigger")) {
      let dfos = DocumentFolders.find({
        // simulation_id: Session.get('Simulations.id'),
        status: 1
      }, {
        sort: {
          folder_order: 1
        }
      })
  // console.log('folder')
      // Session.set("Findings.trigger", null)
      return dfos
    }
  },
  Documents() {  
    let docs = Documents.find({
      folder_id: this.id,
      status: 1
    }, {
      sort: {
        document_order: 1
      }
    })

    let count = docs.count()
// console.log('doc')
    return docs
  },  
  Findings() {
    let findings = Findings.find({
      document_id: this.id
    }, {
      sort: {
        severity: 1,
        id: 1
      }
    })
// console.log('finding')
    return findings    

  },
  _countAllFindings(dfid) {
    
    if(!_selfFindings.count.all[dfid]) {
      _selfFindings.count.all[dfid] = 0
    }

    _selfFindings.count.all[dfid] += 1

    if( _selfFindings.count.all[dfid] > 0) {
      // $('#_count_finding_'+dfid).html('('+_selfFindings[dfid]+')')
      // console.log(dfid, _selfFindings[dfid])

      Session.set("Finding.count.all", _selfFindings.count.all)
    }
// console.log('all => ', dfid, _selfFindings.count.all[dfid])
    // return _selfFindings[dfid]
  },
  _countActiveFindings(dfid) {
    
    if(!_selfFindings.count.active[dfid]) {
      _selfFindings.count.active[dfid] = 0
    }

    _selfFindings.count.active[dfid] += 1

    if( _selfFindings.count.active[dfid] > 0) {
      // $('#_count_finding_'+dfid).html('('+_selfFindings[dfid]+')')
      // console.log(dfid, _selfFindings[dfid])

      Session.set("Finding.count.active", _selfFindings.count.active)
    }
// console.log('active => ', dfid, _selfFindings.count.active[dfid])
    // return _selfFindings[dfid]
  },
  _countExcludedFindings() {
    _selfFindings.count.excluded += 1

    if( _selfFindings.count.excluded > 0) {
      Session.set("Findings.count.excluded", _selfFindings.count.excluded)
    }    
  },
  countFindingAll(fid) {
    if( Session.get("Finding.count.all") &&  Session.get("Finding.count.all")[fid]) {
      return Session.get("Finding.count.all")[fid]
    }
  },
  countFindingActive(fid) {
    if( Session.get("Finding.count.active") &&  Session.get("Finding.count.active")[fid]) {
      return Session.get("Finding.count.active")[fid]
    } else {
      return 0
    }
  },
  countFindingsExcluded() {
    // console.log(Session.get("Findings.count.excluded"))
    let 
      _excluded = Session.get("Findings.count.excluded") || 0,
      _active = Session.get("Findings.length.active") || 0,
      _selected = _active - _excluded;

    let sid = parseInt(Session.get('Simulations.id'))

    if(sid) {
      let _obj = {
        sid: sid,
        selected: _selected
      };

      Meteor.call("Simulations.numOfSelectedFindings", _obj);
    }

    return _excluded;
  },
  countAllFindings() {
    let count = Findings.find().count()
    Session.set("Findings.length", count || 0)
    return Session.get("Findings.length")
  },
  countActiveFindings() {
    let count = Findings.find({status: 1}).count()
    Session.set("Findings.length.active", count || 0)
    return Session.get("Findings.length.active")
  },
  // autoHeight() {
  //   console.log(this)
  //   console.log(this.id, this.finding.length, $('#finding_content_'+this._id).height())
  //   let 
  //     length = this.finding.length,
  //     height = 7

  //   // if(length < 100) {
  //   //   height = 4
  //   // }
  //   // else if(length >=100 && length <200) {
  //   //   heigth = 5
  //   // }
  //   // else if(length >= 200) {
  //   //   height = 8
  //   // }

  //   return height+'em'
  // }
  _Documents() {

    let 
      allMyDocIds = [], 
      SimDocIds = []

    _myFindingsDocs = []

    let sid = Session.get("Simulations.id")

    // all_active_documents.reactive()
    let all_active_documents = Documents.find({
      simulation_id: sid,
      status: 1
    }).fetch()

    if(all_active_documents && all_active_documents.length > 0) {
      // console.log(Session.get("Simulations.id"), all_active_documents) 
      
      // let myDocs = [], myDocIds = []
      // let sid = Session.get("Simulations.id")

      all_active_documents.forEach(d => {
        // console.log(d.id, d.simulation_id, sid)
        if(d.simulation_id === sid) {
          _myFindingsDocs.push({title: d.name, id: d.id})
          if(!_myFindingsDocIds[d.id]) {
            _myFindingsDocIds[d.id] = d.name
            _myFindingsDocNames[d.name] = d.id
          }
          SimDocIds.push(d.id)
        }
        allMyDocIds.push(d.id)
      }) 

      let _allMyDocIds = $.unique(allMyDocIds)       

      Session.set("Findings.docids", _allMyDocIds)      
      Session.set("Findings.SimDocIds", SimDocIds)      
      Session.set("Findings.document.ids", _myFindingsDocIds)
      Session.set("Findings.documents.thisSim", _myFindingsDocs)
// console.log(_myFindingsDocs)
// console.log(_allMyDocIds)
    }
  },
  Document() {
    if(Session.get("Findings.document.ids")) {
      
      return Session.get("Findings.document.ids")[this.document_id]
    }
  },
  Compare() {
    if(Session.get("Findings.document.ids")) {
      
      return Session.get("Findings.document.ids")[this.compare_with]
    }
  },
  Domains() {
    return _myFindingsDomains
  },
  tplFindingsPreview() {
    // import('./findings-preview.js').then(findingsPreview => {
      if(Session.get("Findings.docids")) {
        import '/imports/ui/pages/simulations/findings-preview.js'
        return 'FindingsPreview'
      }
    // })    
  } 
})

Template.Findings.events({
  'click .btn-save-finding'(e, tpl) {
    e.preventDefault()

    Util.loader($(e.currentTarget))

    let 
      ids = $(e.currentTarget).closest('.td-action').data()

    // if(ids && ids.fid && ids.id) {
    if(this.id && this._id) {
      // let 
      //   // content = $('#finding_content_'+ids.fid).html();
      //   content = $('#finding_content_'+ids.fid).val();

      //   // content = content.replace(/\<div\>|\<\/div\>/g, '')
      //   // content = content.replace(/\<div\>/g, '<br>')
      //   console.log(content)

      let
        // fid = ids.fid,
        // id = ids.id,
        // dfid = ids.dfid,
        // _dfid = ids._dfid,
        fid = this._id,
        id = this.id,
        did = this.document_id,        
        dfid = ids.dfid,
        _dfid = ids._dfid,        
        // status = ids.status,
        finding = $('#_finding_content_'+fid).val(),
        severity = $('#_select_severity_'+fid).val(),
        domain = $('#_select_domain_'+fid).val(),
        domain_name = $('#_select_domain_'+fid+ ' option:selected').text(),
        cfr = $('#_input_cfr_'+fid).val(),
        ichgcp = $('#_input_ichgcp_'+fid).val(),
        finding_document = $('#_input_document_'+fid).val(),
        document_id = (finding_document === '0') ? 0 : _myFindingsDocNames[finding_document],
        compare = $('#_input_compare_'+fid).val(),
        compare_with = (compare === '0') ? 0 : _myFindingsDocNames[compare],
        status = this.status

      // console.log(finding, severity, domain, domain_name, cfr, ichgcp, finding_document, document_id, compare, compare_with)

      if(finding) {
        let findingObj = {
          fid: fid,
          dfid: dfid,
          _dfid: _dfid,
          id: parseInt(id),
          finding: finding.trim(),
          severity: severity,
          category_id: parseInt(domain),
          category: domain_name,
          cfr: cfr.trim(),
          ich_gcp: ichgcp.trim(),
          document_id: parseInt(document_id),
          compare_with: parseInt(compare_with),          
        }

        // console.log(findingObj)

        // Session.set("Findings.trigger", null)

        Meteor.call("Findings.update", findingObj, (err, res) => {
          // console.log(err, res)
          if(err) {
            Util.alert({mode: 'error'})
          } else {
            // console.log(res)
            Util.alert()
            Util.loader({done: true})

            $('#_input_document_'+fid).val('')
            $('#_input_compare_'+fid).val('')

            //-- Doing this again is critical for 
            //--  getting the search back to 
            //-- the updasted Finding row.
            // $('.ui.search').search({  
            //   source: Session.get("Findings.documents.thisSim"),
            //   searchFullText: true
            // })

            //-- Also, this is critical to update the number of 
            //-- Findings per Document Folder
            // _selfFindings.count[dfid] -= 1
            // Session.set("Finding.count", _selfFindings.count)

            // Template.Findings.__helpers.get('DocumentFolders').call()
            // Template.Findings.__helpers.get('Documents').call()
            // Template.Findings.__helpers.get('Findings').call()
            // Template.Findings.__helpers.get('Documents').call()
            // Template.Findings.__helpers.get('DocumentFolders').call()
// console.log(did, document_id)
            if(document_id > 0 && did !== document_id) { //-- When new Document is picked
              // _selfFindings.count = []
              // _selfFindings.count.all = []
              // _selfFindings.count.active = []
              // _selfFindings.count.inactive = []  
              
              // Session.set("Finding.count", null)  

              // DocumentFolders.update(_dfid, {
              //   $set: {
              //     trigger: new Date
              //   }
              // })  

              // Session.set("Findings.trigger", new Date)     

              // let newDoc = Documents.findOne({
              //   id: document_id
              // })

//               if(newDoc) {
//                 let newDfid = newDoc.folder_id
// console.log(status, dfid, newDfid, newDoc)
//                 if(dfid !== newDfid) {

//                 }
//               }
            
              //-- This is tricky, but, the counting numbers need to 
              //-- be subtracked by 1 b/c updating Findings collection
              //-- calls the helper Findings() reactively, which 
              //-- increses the number of Findings by 1 no matter 
              //-- what the Finding is.
              if(status === 1) {
                _selfFindings.count.active[dfid] -= 1
                Session.set("Finding.count.active", _selfFindings.count.active)   
              } else {
                _selfFindings.count.inactive[dfid] -= 1
                Session.set("Finding.count.inactive", _selfFindings.count.inactive)                   
              }          
              
              _selfFindings.count.all[dfid] -= 1
              Session.set("Finding.count.all", _selfFindings.count.all)

              //-- Also, the updated Finding with the new Document
              //-- should be visible if the destination Folder is 
              //-- already open and visible. Otherwise, it's not 
              //-- visible b/c of the default style 'display: none'
              let newDoc = Documents.findOne({
                id: document_id
              })

              if(newDoc) {
                let 
                  newDfid = newDoc.folder_id
                  visible = $('.tr-finding.'+newDfid).is(':visible')

                if(visible) {
                  $('.tr-finding.'+newDfid).show()
                }
              }

            }

            // Session.set("Findings.trigger", new Date)

            //-- Doing this again is critical for 
            //--  getting the search back to 
            //-- the updasted Finding row.
            $('.tr-finding .ui.search').search({  
              source: Session.get("Findings.documents.thisSim"),
              // searchFullText: true
              fullTextSearch: true //-- to avoid error message about using a new name 'fullTextSearch' (happened after updating semantic-ui to 2.4)
            })            

          }
        })
          

      } else {
        Util.alert({mode: 'error', msg: 'Finding content should not be null'})
        Util.loader({done: true})
      }
    }

    Util.log(Meteor.user(), this.id+"/save", "findings")
  },
  'click .btn-update-finding-status'(e, tpl) {
    e.preventDefault()

    let 
      fid = this._id,
      dfid = $(e.currentTarget).parent().data('dfid'),
      status = $(e.currentTarget).data('status');

    let msg = status === 0 ? 'deactivate' 
      : (status === 1 ? 'activate' : 'delete')

    if(fid) {
      if(confirm("Are you sure to " + msg + " this finding?")) {

        let fStatusObj = {
          _id: fid,
          status: parseInt(status)
        }

        Meteor.call("Findings.update.status", fStatusObj, (err, res) => {
          if(err) {
            Util.alert({mode:'error'})
          } else {
            Util.alert()

  // _selfFindings.count = []
  // _selfFindings.count.all = []
  // _selfFindings.count.active = []
  // _selfFindings.count.inactive = []

            //-- This is critical to update the number of 
            //-- Findings per Document Folder            
            if(parseInt(status) === 1) {
              //-- do nothing, the helper Findings() will
              //-- increase the count automatically.
            }
            else {              
              _selfFindings.count.active[dfid] -= 1
              Session.set("Finding.count.active", _selfFindings.count.active)
            }
            
            _selfFindings.count.all[dfid] -= 1
            Session.set("Finding.count.all", _selfFindings.count.all)

            // Session.set("Finding.count.all", _selfFindings.count.all)
             // _selfFindings.count.active[dfid] -= 1
             //  _selfFindings.count.inactive[dfid] -= 1

             //  Session.set("Finding.count.active", _selfFindings.count.active)  
             //  Session.set("Finding.count.inactive", _selfFindings.count.inactive)  
          }
        })
      }
    } else {
      Util.alert({mode: 'error', msg: "Something is wrong. Please go back to 'Simulations' and come back."})
    }
    Util.log(Meteor.user(), fid+"/updatestatus", "findings")
  },
  'click .btn-export-findings'(e, tpl) {
    e.preventDefault()

      let simulation_id = Session.get("Simulations.id")

      let simObj = {
        simulation_id: simulation_id,
        documents: Session.get("Findings.document.ids")
      }

      if(simulation_id) {

        Meteor.call('Findings.export', simObj, function(err, res) {
          if(err) {
            Util.alert({mode: 'error', msg: err})
          }
          else {
            if(res) {
              let wb = res.data

              // console.log(wb);
              /* "Browser download file" from SheetJS README */
              let
                wopts = { bookType:'xlsx', bookSST:false, type:'binary' },
                wbout = XLSX.write(wb, wopts)

              let filename = Session.get("Simulations.name")+'-Findings-'+Util.dateHMS(new Date)+'.xlsx'

              saveAs(new Blob([Util.s2ab(wbout)],{type:"application/octet-stream"}), filename);              
            }

          }
        })

      } else {
        Util.alert({mode: 'error'})
      }
      Util.log(Meteor.user(), simulation_id+"/export", "findings")
  },
  'click .btn-import-findings'(e, tpl) {
    e.preventDefault()

    // import './findings-preview.js'
    // import '/imports/ui/pages/simulations/findings-preview.js'
      Template.Findings.__helpers.get('tplFindingsPreview').call()

      Util.loading(true, () => {

        $('.ui.modal.findings-preview-modal')      
        .modal({
          closable: false,
          duration: 0,
          onShow: function() {
            Util.loading(false) //-- in case the modal window is not fully loaded 
          },       
          onVisible: function() {
            // Util.loader({done: true})
            // $('.findings-preview-modal').prev().remove()
            $(this).siblings().remove() //- This works, removing additional duplocated modal element
            // Util.loader({done: true})
            Util.loading(false) //- not working?
          },
          onHidden: function() {
            // $('#findings_preview_file').val('')
            Template.FindingsPreview.__helpers.get('resetFindingsPreview').call()
          }
        })
        .modal('show')

      })
    
    // Util.loader($(e.currentTarget))
    // $('.ui.modal.findings-preview-modal').modal('hide')
    // if($('.ui.dimmer.modals.page').find('.findings-preview-modal')[1]) {
    //   $('.ui.dimmer.modals.page').find('.findings-preview-modal')[0].remove()
    // }

    // Util.loader($(e.currentTarget))

    // $('.ui.modal.findings-preview-modal')
    // .modal('show')
    // .modal({
    //   closable: false,
    //   duration: 0,
    //   // transition: 'fly down',
    //   onVisible: function() {
    //     Util.loader({done: true})
    //     // $('.findings-preview-modal').prev().remove()
    //     $(this).siblings().remove() //- This works, removing additional duplocated modal element
    //     // Util.loader({done: true})
    //     Util.loading(false)
    //   },
    //   onHidden: function() {
    //     // $('#findings_preview_file').val('')
    //     Template.FindingsPreview.__helpers.get('resetFindingsPreview').call()
    //   }
    // })
    // .modal('setting', {
    //   onShow: function () {
    //     $(this).css({
    //       display: 'block',
    //     });
    //   }      
    // })
    // .modal('show')

      // onVisible: function() {
      //   var data = function () {
      //     return Handsontable.helper.createSpreadsheetData(100, 10);
      //   };

      //   var container = document.getElementById('findings_preview');

      //   var hot = new Handsontable(container, {
      //     data: data(),
      //     minSpareCols: 1,
      //     minSpareRows: 1,
      //     rowHeaders: true,
      //     colHeaders: true,
      //     contextMenu: true
      //   });        
      // }

      Util.log(Meteor.user(), "import", "findings")
  },
  'click .btn-reset-document'(e, tpl) {
    e.preventDefault()

    let fid = $(e.currentTarget).data('fid')

    if(fid) {
      $('#_input_document_'+fid).val('')
    } else {
      Util.alert({mode: 'error'})
    }

    Util.log(Meteor.user(), fid+"/resetdoc", "findings")
  },
  'click .btn-reset-compare'(e, tpl) {
    e.preventDefault()

    let fid = $(e.currentTarget).data('fid')

    if(fid) {
      $('#_input_compare_'+fid).val('')
    } else {
      Util.alert({mode: 'error'})
    }

    Util.log(Meteor.user(), fid+"/resetcomp", "findings")
  },
  'click #chkb_findings_group_by_document'(e, tpl) {
    e.preventDefault()

    let groudByDoc = $(e.currentTarget).is(':checked')

    Session.set("Findings.group", groudByDoc)
    // if(groudByDoc) {

    // } else {

    // }

    let dfos = DocumentFolders.find().fetch()

    console.log(dfos)

  },
  'click .tr-finding-folder'(e, tpl) {
    e.preventDefault()

    let 
      dfid = $(e.currentTarget).data('dfid')
      // visible = $('.tr-finding.'+dfid).is(':visible')

    $('.tr-finding.'+dfid).toggle()
    //-- problem when a Finding is moved to another Folder

    // if(visible) {
    //   $('.tr-finding.'+dfid).hdie()
    // } else {
    //   $('.tr-finding.'+dfid).show()
    // }
  },
  'click .btn-delete-all-findings'(e, tpl) {
    e.preventDefault()

    if(Session.get("Findings.length") && Session.get("Findings.length") > 0) {
      if(Session.get("Simulations.id")) {
        if(confirm("Are you sure to delete all Findings and start over?")) {

          let sid = parseInt(Session.get("Simulations.id"))

          Meteor.call("Findings.remove.all", sid, (err, res) => {
            
            if(err) {
              Util.alert({mode: 'error'})
            } else {
              if(res && res > 0) {
                // Util.alert({mode: 'success', msg: "Successfully deleted. If you don't see the updated one, please move out and view other Simulation's Findings and comeback to get the updated results."})
                Util.alert({mode: 'success', msg: "Successfully deleted."})

              _selfFindings.count = []
              _selfFindings.count.all = []
              _selfFindings.count.active = []
              _selfFindings.count.inactive = []

                Session.set("Finding.count.all", null)
                Session.set("Findings.trigger", new Date)              
                // _selfFindings.count.all = []
                // _selfFindings.count.active = []
                // _selfFindings.count.inactive = []
              // Session.set("Findings.length", null)  
              // Session.set("Finding.count", null)               

              }
            }
          })

          Util.log(Meteor.user(), "deleteall", "findings")
        }
      } else {
        Util.alert({mode: 'error'})
      }
    } else {
      Util.alert({mode: 'warning', msg: 'No Findings to remove. Please check and try again.'})
    }   
  },
  'change .chbx-exclude-finding'(e, tpl) {
    e.preventDefault();

    // console.log(this)
    if(this && this._id) {

      let _checked = $(e.currentTarget).is(':checked');

      let _obj = {
        _id: this._id,   
        excluded: _checked        
      }

      Meteor.call("Findings.exclude", _obj, (err, res) => {
        if(err) {
          Util.alert({mode: 'error'})
        } else {
          if(res) {
            Util.alert({mode: 'success', msg: "Successfully saved."});   
            
            // console.log(this.simulation_id)
            // console.log(Session.get("Findings.length.active"));
            // console.log(Session.get("Findings.count.excluded"));
          }
        }
      })
    }
  }
})

Template.Findings.onDestroyed(findingsOnDestroyed => {
  _selfFindings.findingsSubscription && _selfFindings.findingsSubscription.stop()
  // all_active_documents = null
  _myFindingsDocs = []
  _myFindingsDocIds = []
  _myFindingsDocNames = []  
  _selfFindings.count = []

  Session.set("Findings.length", null)  
  Session.set("Finding.count", null)  
})



