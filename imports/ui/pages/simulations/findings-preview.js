const XLSX = require('xlsx');

import { Session } from 'meteor/session'

import { Findings } from '/imports/api/findings/findings.js'

import { Util } from '/imports/lib/util.js'

import './findings-preview.html'
import '/imports/ui/stylesheets/simulations/findings-preview.less'

let _selfFindingsPreview

Template.FindingsPreview.onCreated(function findingsPreviewOnCreated() {
  _selfFindingsPreview = this
  _selfFindingsPreview.allFindings = []
  // _selfFindingsPreview.cellsToUpdate = []
  _selfFindingsPreview.sameSimFindings = []
  _selfFindingsPreview.diffSimFindings = []
  _selfFindingsPreview.sid = Session.get("Simulations.id") 

  _selfFindingsPreview.domains = []
  _selfFindingsPreview.domains['ICF Process'] = 1
  _selfFindingsPreview.domains['IRB Reporting'] = 2
  _selfFindingsPreview.domains['IEC Reporting'] = 2
  _selfFindingsPreview.domains['EC Reporting'] = 2
  _selfFindingsPreview.domains['Protocol Requirement'] = 3
  _selfFindingsPreview.domains['IRB Submission/Approval'] = 4
  _selfFindingsPreview.domains['IEC Submission/Approval'] = 4
  _selfFindingsPreview.domains['Source Documentation'] = 5
  _selfFindingsPreview.domains['Source Documentation / Source to CRF / CRF'] = 5
  _selfFindingsPreview.domains['Source to CRF/CRF'] = 6
  _selfFindingsPreview.domains['Source to EDC/EDC'] = 6
  _selfFindingsPreview.domains['Potential Fraud'] = 7
  _selfFindingsPreview.domains['Delegation of Authority'] = 8
  _selfFindingsPreview.domains['Source Documentation/Source to EDC/EDC'] = 10 
  _selfFindingsPreview.domains['Potential Fraud/Scientific Misconduct'] = 11 

  // console.log(Session.get("Findings.docids"))

})

Template.FindingsPreview.onRendered(function findingsPreviewOnRendered() {
  // $('.ui.modal.findings-preview-modal').modal('hide') 
  Util.loading(false)
})

Template.FindingsPreview.helpers({
  resetFindingsPreview() {

    Util.loading(false)

    if(_selfFindingsPreview.hot) {
      // _selfFindingsPreview.hot.destroy()
      // $('#container').handsonatable(config);
      // _selfFindingsPreview.hot.clear()

          // var container = document.getElementById('findings_preview');

          // new Handsontable(container)
      $('#findings_preview').empty()
    }

    $('#num_findings').empty()
    $('.num-findings').hide()

    $('.findings-preview-search #search_field').val('')
    $('.findings-preview-search #num_results').html(0)
    $('.findings-preview-search').hide()

    $('#findings_preview_file').val('')
    // $('.ui.modal.findings-preview-modal').modal('hide')  
    // if($('.ui.dimmer.modals.page').find('.findings-preview-modal')[1]) {
    //   $('.ui.dimmer.modals.page').find('.findings-preview-modal')[0].remove()
    // }    
  }
})

Template.FindingsPreview.events({
  'change #findings_preview_file'(e, tpl) {
    e.preventDefault()
    
    /* "Browser file upload form element" from SheetJS README */
    const file = e.currentTarget.files[0];

    if(file) {
      
      if(_selfFindingsPreview.hot) { //- initiate the table
        // _selfFindingsPreview.hot.destroy()
        // _selfFindingsPreview.hot.clear()
        $('#findings_preview').empty()
            // var container = document.getElementById('findings_preview');

            // new Handsontable(container)
        $('#num_findings').empty()
        $('.num-findings').hide()

        $('.findings-preview-search #search_field').val('')
        $('.findings-preview-search #num_results').html(0)  
        $('.findings-preview-search').hide()
      } 

      const reader = new FileReader();
      reader.onload = function(evt) {
        const data = evt.target.result;
        const name = file.name;
      
        /* Meteor magic */
        Meteor.call('Findings.import', data, name, function(err, res) {
          if(err) {
            Util.alert({mode: 'error', msg: err})
          }
          else {
            /* do something here -- this just dumps an array of arrays to console */
            // console.log(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {header:1}));

            if(res && res.xlsx) {
              
              let wb = res.xlsx       

              if(res.findings && res.findings.length > 0) {
                let allFindings = []
                res.findings.forEach((f) => {
                  let o = {
                    id: f.id,
                    data: f
                  }
                  
                  allFindings.push(o)
                })
  // console.log(allFindings)
                _selfFindingsPreview.allFindings = allFindings
              }

              let data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {header:1})

              // console.log(data)
                        // document.getElementById('out').innerHTML = (XLSX.utils.sheet_to_html(wb.Sheets[wb.SheetNames[0]]));
              // $('.ui.search')
              //   .search({
              //     source : data,
              //     searchFields   : [
              //       'finding'
              //     ],
              //     searchFullText: false
              //   })

              Handsontable.renderers.registerRenderer('findingsValidityCheckRenderer', ___findingsValidityCheckRenderer);

              var container = document.getElementById('findings_preview');

              _selfFindingsPreview.hot = new Handsontable(container, {
                // data: data(),
                data: data,
                // colHeaders: ['ID', 'Finding', 'Severity', 'Domain ID', 'Domain', 'CFR', 'ICH-GCP',
                //   'Document ID', 'Document', 'Document2 ID', 'Document2', 'Status'],
                columns: [
                  // {title: 'ID', type: 'numeric'},
                  {title: 'Finding', type: 'text'},
                  {title: 'Severity', type: 'text'},
                  // {title: 'Domain ID', type: 'numeric'},
                  {title: 'Domain', type: 'text'},
                  {title: 'CFR', type: 'text'},
                  {title: 'ICH-GCP', type: 'text'},
                  {title: 'Document ID', type: 'numeric'},
                  {title: 'Document', type: 'text'},
                  {title: 'Document2 ID', type: 'numeric'},
                  {title: 'Document2', type: 'text'},
                  {title: 'Status', type: 'numeric'},
                  // {title: '', type: 'text'},
                  // {title: 'name.first'},
                  // {data: 'name.last'},
                  // {data: 'ip', validator: ipValidatorRegexp, allowInvalid: true},
                  // {data: 'email', validator: emailValidator, allowInvalid: false}
                ],
                cells: function(row, col, prop) {
                    var cellProperties = {};
                    cellProperties.renderer = "findingsValidityCheckRenderer";

                    return cellProperties;
                },            
                minSpareCols: true,
                minSpareRows: true,
                autoWrapRow: true,            
                columnSorting: true,
                fillHandle: true,
                // currentRowClassName: 'currentRow',            
                rowHeaders: false,
                // colHeaders: true,
                contextMenu: true,
                // colWidths: [40, 350, 50, 70, 80, 100, 100, 80, 100, 90, 100, 40],           
                colWidths: [350, 50, 70, 80, 100, 100, 80, 100, 90, 100, 40],           
                 stretchH: 'all',
                 // autoColumnSize: true,
                 autoWrapCol: true,
                 autoWrapRow: true,
                 manualColumnResize: true,
                 manualRowResize: true,
                 manualRowMove: true,
                 // search: true,
                 search: {
                  searchResultClass: 'search-result'
                },
                preventOverflow: 'horizontal'     

              });        
          
    // var hiddenRowsPlugin = hot.getPlugin('hiddenRows');
    // hiddenRowsPlugin.hideRow(1);

              var countSourceRows = _selfFindingsPreview.hot.countSourceRows() - 1;

              _selfFindingsPreview.hot.addHook('modifyRow', function(row) {
                var rowOffset = 1;
                
                // if (row >= 2) { // hide two rows starting at index 2 (so ID 3 and 4 are excluded)
                //   rowOffset = rowOffset + 2;
                // }
                // if (row >= 7) { // hide one row starting at index 7 (so ID 10 is excluded)
                //   rowOffset = rowOffset + 1;
                // }
                row = row + rowOffset;

                return row <= countSourceRows ? row : null;
              });
              _selfFindingsPreview.hot.render();

              $('.num-findings').show().css("display", "inline-block");
              $('#num_findings').html(data.length-2) //-- exclude Header and the last spare row

              $('.findings-preview-search').show().css("display", "inline-block");
              $('.btn-submit-import-findings').removeClass('basic').addClass('teal').prop('disabled', false)

              let searchFiled = document.getElementById('search_field')

              // let searchResults = []

              Handsontable.dom.addEvent(searchFiled,'keyup', function (event) {
                var queryResult = _selfFindingsPreview.hot.search.query(this.value);

                // console.log(queryResult); 
                
                $('.findings-preview-search #num_results').html(queryResult.length)         

                _selfFindingsPreview.hot.render();
              }); 

            } //-- if(res && res.xlsx)
            else {
              Util.alert({mode: 'error'})
            }

          } //-- if~else
        }); //-- Meteor.method: Findings.import

      } //-- reader.onload = function(evt) {

      reader.readAsBinaryString(file);

      $('#findings_preview_file').prop('value', '')
      // $('#findings_preview_file').val('')
      // $(e.currentTarget).val('')
      // $(e.currentTarget).prop('value', '')
      // $(e.currentTarget).attr('value', '')
      $('#_findings_preview_file').html(file.name)

    } //-- if(file)

    Util.log(Meteor.user(), "changefile", "findingspreview")
  },
  'click .btn-submit-import-findings'(e, tpl) {
    e.preventDefault()

    // var container = document.getElementById('findings_preview');

    // let json=JSON.stringify(container.handsontable('getData'))
    // let json=JSON.stringify(_selfFindingsPreview.hot.getData())

    // console.log(_selfFindingsPreview.hot.getData())

    let 
      findingsInOtherSim = $('.finding-exists-different-sim').length,
      documentsNotInThisSim = $('.documents-not-in-this-sim').length,
      documentsToDoubleCheck = $('.doc-different').length,
      canSubmit = true

    if(findingsInOtherSim > 0) {
      Util.alert({mode: 'error', msg: 'There are ' + findingsInOtherSim + ' Findings from other simulation.'})
      canSubmit  = false
    }  
    if(documentsNotInThisSim > 0) {
      Util.alert({mode: 'error', msg: 'There are ' + documentsNotInThisSim + ' documents from other simulation.'})
      canSubmit = false
    } 
    if(documentsToDoubleCheck > 0) {
      Util.alert({mode: 'error', msg: 'There are ' + documentsToDoubleCheck + ' documents to double-check.'})
      canSubmit = false
    }

    if(canSubmit) {

      Util.loading(true, () => {
        // if(confirm("Are you sure to submit the Findings data? \n\n This will add the new data, or, will overwrite any existing data.")) {
        if(confirm("Are you sure to submit the new Findings data?")) {

          let 
            data = _selfFindingsPreview.hot.getData(),
            simulation_id = Session.get("Simulations.id")

          if(data && data.length > 1 && simulation_id) { //-- including the last spare row

            // Util.loading(true, () => {

              let obj = {
                data: data,
                simulation_id: simulation_id
              }
              Meteor.call("Findings.insert", obj, (err, res) => {
                if(err) {
                  Util.alert({mode: 'error'})
                  Util.loading(false) 
                } else {
                  // console.log(res)
                  if(res && res.success) {
                    Util.alert()

                    if(_selfFindingsPreview.hot) { //- Not needed any more as Modal.onHidden does this
                      _selfFindingsPreview.hot.destroy()
                    }

                    _resetFindingsPreview()

                    Util.loading(false, () => {
                      // console.log(Session.get("Findings.documents.thisSim"))
                      $('.ui.search').search({
                        source: Session.get("Findings.documents.thisSim"),
                        // searchFullText: true
                        fullTextSearch: true //-- to avoid error message about using a new name 'fullTextSearch' (happened after updating semantic-ui to 2.4)
                      })
                    })

                  } else { 
                    Util.alert({mode: 'error', msg: 'Possibly not all Findings done successfully. Close this panel and check Findings. If there are any missing ones, check its domain name etc. before import them.'})                   
                    Util.loading(false) 
                  }
                }
              })

            // })

          } else {
            Util.alert({mode: 'error'})
            Util.loading(false) 
          }
        } else {
          Util.loading(false) 
        }

      })
    } //-- if(canSubmit)

    Util.log(Meteor.user(), "submitimport", "findingspreview")
  },
  // 'click .ui.modal .close.icon'(e, tpl) { //- not working
  //   e.preventDefault()

  //   _resetFindingsPreview()
  // }
})

Template.FindingsPreview.onDestroyed(function findingsPreviewOnDestroyed() {
  _resetFindingsPreview()
})

function _resetFindingsPreview() {
  // _selfFindingsPreview.hot.updateSettings({
  //   data : []
  // });

  // if(_selfFindingsPreview.hot) { //- Not needed any more as Modal.onHidden does this
  //   _selfFindingsPreview.hot.destroy()
  // }

  $('#num_findings').empty()
  $('.num-findings').hide()

  $('.findings-preview-search #search_field').val('')
  $('.findings-preview-search #num_results').html(0)  
  $('.findings-preview-search').hide()

  $('#findings_preview_file').val('')
  $('.ui.modal.findings-preview-modal').modal('hide')
  // if($('.ui.dimmer.modals.page').find('.findings-preview-modal')[1]) {
  //   $('.ui.dimmer.modals.page').find('.findings-preview-modal')[0].remove()
  // }  
}

function ___findingsValidityCheckRenderer(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);

    if(value !== null && value !== '') {   

      let 
        docId = parseInt(instance.getDataAtCell(row, 5)),
        doc2Id = parseInt(instance.getDataAtCell(row, 7))
        // docName = instance.getDataAtCell(row, 7),
        // doc2Name = instance.getDataAtCell(row, 9)          

      if(col === 2) {
        let _domainName = value.trim()
        if(!_selfFindingsPreview.domains[value]) {
          td.className = 'wrong-domain-name'
        }
      }

      if(col === 5 || col === 7) {
        // if(Session.get("Findings.docids").indexOf(parseInt(value)) === -1) {
        let _docId = parseInt(value)
        // console.log(col, _docId, Session.get("Findings.docids"), Session.get("Findings.docids").includes(_docId))
        // console.log(col, _docId, Session.get("Findings.SimDocIds"), Session.get("Findings.SimDocIds").includes(_docId))
        if(!Session.get("Findings.SimDocIds").includes(_docId)) {
          if(_docId > 0) {
            td.className = 'doc-not-in-this-sim'
          } else {
            td.className = 'doc-null'
          }
        }
        // td.textContent = docName
      }

      if(col === 6) {
        let docName =  Session.get('Findings.document.ids')[docId] || ''
        // console.log(value, docName, )
        if(value.trim() !== docName.trim()) {
          td.className = 'doc-different'
        }
      }
      if(col === 8) {
        let doc2Name =  Session.get('Findings.document.ids')[doc2Id] || ''
        // console.log(value + ' # ' + doc2Name)
        if(value.trim() !== doc2Name.trim()) {
          td.className = 'doc-different'
        }          
      }

    }
}

