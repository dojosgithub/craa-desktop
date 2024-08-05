const XLSX = require('xlsx');

import { Session } from 'meteor/session'

import { Util } from '/imports/lib/util.js'

import './email-manager.html'
import '/imports/ui/stylesheets/tools/email-manager.less'

let _selfEmailManager

Template.EmailManager.onCreated(function emailManagerOnCreated() {
  _selfEmailManager = this
  _selfEmailManager.allUsersEmails = []
  _selfEmailManager.userByEmails = [],
  _selfEmailManager.resultByEmails = [],
  _selfEmailManager.hotData = []

})

Template.EmailManager.onRendered(function emailManagerOnRendered() {
  Util.loading(false)
  
  _resetEmailManager()

})

Template.EmailManager.events({
  'click .btn-submit-emails'(e, tpl) {
    e.preventDefault()

    let 
      errors = $('.email-exists-nok').length + $('.email-not-exist').length,
      sendVerificationMessage = $('#chkb_send_verification_message').is(':checked')
// console.log(sendVerificationMessage)
    if(errors > 0) {
      if(errors === 1) {
        Util.alert({mode: 'error', msg: "There is " + errors + " error. Please correct the error first."})
      } else {
        Util.alert({mode: 'error', msg: "There are " + errors + " errors. Please correct the errors first."})
      }
      
      return false;
    } else {

      let confirmMsg = "Are you sure to submit the emails?"
      if(sendVerificationMessage) {
        confirmMsg += "\n\nEmail owners who haven't verified yet will receive a new verification message as well."
      }

      if(confirm(confirmMsg)) {
        Util.loading(true)

        let data = _selfEmailManager.hot.getData()

        // console.log(_selfEmailManager.userByEmails)

        // let emailObj = {
        //   data: data,
        //   users: _selfEmailManager.userByEmails,
        //   sendVerificationMessage: sendVerificationMessage
        // }

        //-- this is risky. let's go with the worst scenario, and process 
        //-- each email one by one.
        // Meteor.call("EmailManager.update.emails", emailObj, (err, res) => {
        //   if(err) {
        //     Util.alert({mode: 'error', msg: err})
        //   } else {
        //     // console.log(res)
        //     if(res) {
        //       _selfEmailManager.allUsersEmails = res              
        //       _selfEmailManager.hot.loadData(_selfEmailManager.hotData)
        //       _selfEmailManager.hot.render()
        //       Util.alert()
        //       // Util.loading(false)
        //     }
        //   }
        //   Util.loading(false)
        // })

        // console.log(data, _selfEmailManager.userByEmails)

        if(data && data.length > 0) {

          data.forEach((e) => {

            if(e[0] && e[1]) {

              let emailObj = {
                source: e[0],
                target: e[1],
                // users: _selfEmailManager.userByEmails,
                sendVerificationMessage: sendVerificationMessage
              }

              Meteor.call("EmailManager.update.email", emailObj, (err, res) => {
                if(err) {
                  Util.alert({mode: 'error', msg: err})
                } else {
                  // console.log(res)
                  if(res) {
                    // _selfEmailManager.allUsersEmails = res              
                    // _selfEmailManager.hot.loadData(_selfEmailManager.hotData)
                    // _selfEmailManager.hot.render()
                    $('#emails_out').show()

                    let msg = "Updated "
                    if(res.sent) {
                      msg += "and sent out "
                    }

                    msg += "for " + res.fullname + "'s new Email: " + res.target

                    Util.alert({mode: 'info', msg: msg})
                    // Util.loading(false)
                    let sent = res.sent ? 'SENT': ''
                    let htmlMsg = `
                      <li>                 
                        <div class='target'>${res.target}</div>
                        <div class='fullname'>${res.fullname}</div>
                        <div class='sent'>${sent}</li>
                      </li>
                    `
                    $('#emails_out ul').prepend(htmlMsg)
                  }
                }
                Util.loading(false)
              })

            }

          })
        }       

      }

    }

    Util.log(Meteor.user(), "submitemails", "emailmgmt") 
  },
  'change #email_manager_file'(e, tpl) {
    e.preventDefault()    

    const file = e.currentTarget.files[0];

    if(file) {

      _resetEmailManager()

      const reader = new FileReader();
      reader.onload = function(evt) {
        const data = evt.target.result;
        const name = file.name;
      
        /* Meteor magic */
        Meteor.call('EmailManager.import', data, name, function(err, res) {
          if(err) {
            Util.alert({mode: 'error', msg: err})
          }

          else {
            /* do something here -- this just dumps an array of arrays to console */          

            if(res && res.excel && res.users) {

                let excelData = res.excel
                _selfEmailManager.hotData = XLSX.utils.sheet_to_json(excelData.Sheets[excelData.SheetNames[0]], {header:1})

                Handsontable.renderers.registerRenderer('validityCheckRenderer', ___validityCheckRenderer);

                var container = document.getElementById('emails_preview');

                _selfEmailManager.hot = new Handsontable(container, {
                  // data: data(),
                  data: _selfEmailManager.hotData,
                  // colHeaders: ['ID', 'Finding', 'Severity', 'Domain ID', 'Domain', 'CFR', 'ICH-GCP',
                  //   'Document ID', 'Document', 'Document2 ID', 'Document2', 'Status'],
                  columns: [
                    {title: 'Source', type: 'text'},
                    {title: 'Target', type: 'text'},                    
                    // {title: 'name.first'},
                    // {data: 'name.last'},
                    // {data: 'ip', validator: ipValidatorRegexp, allowInvalid: true},
                    // {data: 'email', validator: emailValidator, allowInvalid: false}
                  ],
                  cells: function(row, col, prop) {
                      var cellProperties = {};
                      cellProperties.renderer = "validityCheckRenderer";

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
                  colWidths: [200, 200],
                  // hiddenRows: {
                  //   rows: [1],
                  //   indicators: true,
                  //   skipColumnOnPaste: false,
                  //   skipRowOnPaste: true,
                  // },
                   // stretchH: 'all',
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

                var countSourceRows = _selfEmailManager.hot.countSourceRows() - 1;

                _selfEmailManager.hot.addHook('modifyRow', function(row) {
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
                _selfEmailManager.hot.render();

                $('.num-emails').show().css("display", "inline-block");
                $('#num_emails').html(_selfEmailManager.hotData.length-2) //-- exclude Header and the last spare row

                $('.email-manager-search').show().css("display", "inline-block");

                $('.send-verification-message').css('display', 'inline-block')

                $('.email-submit-container').show()
                $('.btn-submit-emails').prop('disabled', false)

                let searchFiled = document.getElementById('search_field')

                // let searchResults = []

                Handsontable.dom.addEvent(searchFiled,'keyup', function (event) {
                  var queryResult = _selfEmailManager.hot.search.query(this.value);

                  // console.log(queryResult); 
                  
                  $('.email-manager-search #num_results').html(queryResult.length)         

                  _selfEmailManager.hot.render();
                });

                  // let res = []
                  // if(searchResults && searchResults.length > 0) {
                  //   searchResults.forEach((r) => {
                  //     // res.push(r.)
                  //     // console.log(hot.getCellMeta(r.col, r.row))
                  //     let cellData = hot.getDataAtCell(0, r.row)

                  //     console.log(cellData)
                  //   })
                  // }  

                _selfEmailManager.allUsersEmails = []

                res.users.forEach((u) => {
                  if(u.emails[0].address) {
                    let 
                      email = u.emails[0].address.trim().toLowerCase(),
                      obj = {_id: u._id, e: email, v: u.emails[0].verified}

                    _selfEmailManager.allUsersEmails.push(email)

                    // if(!_selfEmailManager.userByEmails[email]) {
                    //   _selfEmailManager.userByEmails[email] = {v: u.emails[0].verified}                    
                    // } 
                    _selfEmailManager.userByEmails.push(obj)                 
                  }
                })
                $.unique(_selfEmailManager.allUsersEmails)

              } //-- if res
             else {
                Util.alert({mode: 'error'})
              }

            } //-- if else err
   
        });
    


      };
      reader.readAsBinaryString(file);    
    }

    Util.log(Meteor.user(), "changeemailsfile", "emailmgmt") 
  }
})


Template.EmailManager.onDestroyed(function emailManagerOnDestroyed() {
  _resetEmailManager()
})

function _resetEmailManager() {
  // _selfEmailManager.hot.updateSettings({
  //   data : []
  // });

  if(_selfEmailManager.hot) { 
    _selfEmailManager.hot.destroy()
  }

  $('#num_emails').empty()
  $('.num-emails').hide()

  $('.email-manager-search #search_field').val('')
  $('.email-manager-search #num_results').html(0)  
  $('.email-manager-search').hide()

  $('#emails_preview_file').val('')

  $(".email-submit-container").hide()
  $('.send-verification-message').hide()
 
}

function ___validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function ___validityCheckRenderer(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.TextRenderer.apply(this, arguments);

    // console.log(row, col, value)
    // if(row > 0) {
      if(value !== null && value !== '') {
        let email = value.trim().toLowerCase()

        if (___validateEmail(email)) {          
          td.textContent = email
          // console.log('###'+email)
// console.log(_selfEmailManager.allUsersEmails.indexOf(email))          
        } else {
          td.className = 'invalid-email-format'
        }
// console.log(email, _selfEmailManager.allUsersEmails.indexOf(email))
        if(_selfEmailManager.allUsersEmails.indexOf(email) !== -1) {
          if(col === 0) {
            td.className = 'email-exists-ok'
          } 
          else {
            td.className = 'email-exists-nok'
          }          
        } else {
          if(col === 0) {
            td.className = 'email-not-exist'
          }
        }
      }
    // }
}

