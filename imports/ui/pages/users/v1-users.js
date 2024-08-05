import Tabular from 'meteor/aldeed:tabular';

import { Util } from '/imports/lib/util.js'

import { V1Users } from '/imports/api/users/users.js'

import './v1-users.html'
import '/imports/ui/stylesheets/users/v1-users.less'

let 
  hstV1UsersCheckerContainer, 
  hstV1UsersForm, 
  hstV1UsersFormSettings

let _selfV1Users

Template.V1Users.onCreated(function v1UsersOnCreated() {
  
  _selfV1Users = this
  _selfV1Users.users = {
    firstnames: [],
    lastnames: [],
    emails: []
  }
  _selfV1Users.users.firstnames = []
  _selfV1Users.users.lastnames = []
  _selfV1Users.users.emails = []

  _selfV1Users.users.v1 = []
  _selfV1Users.users.v1.firstnames = []
  _selfV1Users.users.v1.lastnames = []
  _selfV1Users.users.v1.emails = []

  _selfV1Users.users.v2 = []
  _selfV1Users.users.v2.firstnames = []
  _selfV1Users.users.v2.lastnames = []
  _selfV1Users.users.v2.emails = []

  Tracker.autorun(() => {

    Meteor.call("V1Users.all.names", {}, (err, res1) => {    
      // console.log(err, res1)
      if(err) {
          Util.alert({mode: 'error'})
      } else {
        if(res1) {
          let 
            _v1Fnames = res1[0].firstnames,
            _v1Lnames = res1[0].lastnames,
            _v1Emails = res1[0].emails

          _selfV1Users.users.v1.firstnames = _v1Fnames
          _selfV1Users.users.v1.lastnames = _v1Lnames
          _selfV1Users.users.v1.emails = _v1Emails

          Meteor.call("Users.all.names", {}, (err, res2) => {
            // console.log(err, res2)
            if(res2) {
              let 
                _v2Fnames = res2[0].firstnames,
                _v2Lnames = res2[0].lastnames,
                _v2Emails = res2[0].emails

              // _selfV1Users.users.firstnames = _v1Fnames.concat(_v2Fnames)
              // _selfV1Users.users.lastnames = _v1Lnames.concat(_v2Lnames)
              // _selfV1Users.users.emails = _v1Emails.concat(_v2Emails)

              _selfV1Users.users.v2.firstnames = _v2Fnames
              _selfV1Users.users.v2.lastnames = _v2Lnames
              _selfV1Users.users.v2.emails = _v2Emails              

              // $.unique(_selfV1Users.users.firstnames)
              // $.unique(_selfV1Users.users.lastnames)
              // $.unique(_selfV1Users.users.emails)
// console.log(_selfV1Users.users.firstnames, _selfV1Users.users.lastnames, _selfV1Users.users.emails)
            } else {
              Util.alert({mode: 'error'})
            }
          })
        }
      }
    })

  })
})

Template.V1Users.onRendered(function v1UsersOnRendered() {
  $('.v1-users-grid table.dataTable').addClass('ui celled table')

  Template.V1Users.__helpers.get('V1UsersCheckerTable').call()

})

Template.V1Users.helpers({
  V1UsersCheckerTable() {
    hstV1UsersCheckerContainer = document.getElementById('v1_users_checker_table')

    let data = [[null,null,null]];    

    Handsontable.renderers.registerRenderer('dupCheckRenderer', dupCheckRenderer);

    hstV1UsersFormSettings = {
        data: data,
        // width: 1000,
        // height: (data.length*30) + 60,
        outsideClickDeselects: false,
        colHeaders: true,
        contextMenu: true,
        minSpareRows: 1,
        manualColumnResize: true,
        manualRowResize: true,
        colWidths: [150, 150, 200],
        // mergeCells: [{row: 1, col: 1, rowspan: 1, colspan: 4}],
        // colHeaders: ["Last Name", "First Name", "Email", "Username", "Initial"],
        colHeaders: ["Last Name", "First Name", "Email"],
        cells: function(row, col, prop) {
            var cellProperties = {};
            cellProperties.renderer = "dupCheckRenderer";

            return cellProperties;
        },
    };


    hstV1UsersForm = new Handsontable(hstV1UsersCheckerContainer, hstV1UsersFormSettings)
  }
})

function dupCheckRenderer(instance, td, row, col, prop, value, cellProperties) {
  Handsontable.renderers.TextRenderer.apply(this, arguments);

  if(col === 0 && value !== null) {
    value = value.trim().toLowerCase()
// console.log(value)
    if(_selfV1Users.users.v1.lastnames.includes(value) 
      &&_selfV1Users.users.v2.lastnames.includes(value)) {
        td.className = 'v12-user-duplicated';
    }
    else if(_selfV1Users.users.v1.lastnames.includes(value)) {
        console.log(value)
        td.className = 'v1-user-duplicated';
    }
    else if(_selfV1Users.users.v2.lastnames.includes(value)) {
        td.className = 'v2-user-duplicated';
    }    
  }

  if(col === 1 && value !== null) {
    value = value.trim().toLowerCase()
    // if(_selfV1Users.users.firstnames.includes(value)) {
    //     td.className = 'v1-user-duplicated';
    // }

    if(_selfV1Users.users.v1.firstnames.includes(value) 
      &&_selfV1Users.users.v2.firstnames.includes(value)) {
        td.className = 'v12-user-duplicated';
    }
    else if(_selfV1Users.users.v1.firstnames.includes(value)) {
        td.className = 'v1-user-duplicated';
    }
    else if(_selfV1Users.users.v2.firstnames.includes(value)) {
        td.className = 'v2-user-duplicated';
    } 

  }    

  if(col === 2 && value !== null) {
    // value = value.trim()
    value = value.trim().toLowerCase()
    // if(_selfV1Users.users.emails.includes(value.toLowerCase())) {
    //     td.className = 'v1-user-duplicated';
    // }
    // let lowerValue = value.toLowerCase()

    if(_selfV1Users.users.v1.emails.includes(value) 
      &&_selfV1Users.users.v2.emails.includes(value)) {
        td.className = 'v12-user-duplicated';
    }
    else if(_selfV1Users.users.v1.emails.includes(value)) {
        td.className = 'v1-user-duplicated';
    }
    else if(_selfV1Users.users.v2.emails.includes(value)) {
        td.className = 'v2-user-duplicated';
    } 

    // if((_selfV1Users.users.v1.emails.includes(value) 
    //   &&_selfV1Users.users.v2.emails.includes(value)) || 
    //   ((_selfV1Users.users.v1.emails.includes(lowerValue) 
    //   &&_selfV1Users.users.v2.emails.includes(lowerValue)))) {
    //     td.className = 'v12-user-duplicated';
    // }
    // else if(_selfV1Users.users.v1.emails.includes(value) || 
    //   _selfV1Users.users.v1.emails.includes(lowerValue)) {
    //     td.className = 'v1-user-duplicated';
    // }
    // else if(_selfV1Users.users.v2.emails.includes(value) || 
    //   _selfV1Users.users.v2.emails.includes(lowerValue)) {
    //     td.className = 'v2-user-duplicated';
    // } 


  }

}

