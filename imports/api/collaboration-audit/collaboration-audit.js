import { Mongo } from 'meteor/mongo';

import Tabular from 'meteor/aldeed:tabular';

import { Util } from '/imports/lib/util.js'

export const CollaborationAudit = new Mongo.Collection('collaboration_audit');

new Tabular.Table({
  name: "CollaborationAuditTable",
  collection: CollaborationAudit,
  // pub: "sus_4_collaboration_audit",
  // pub: "admin_all_sims_w_sim_settings", // slow
  // sub: new SubsManager(),
  // order: [[7, 'desc'], [10, 'desc']],
  // order: [[10, 'desc'], [9, 'desc']],
  // order: [[7, 'desc'], [10, 'desc']],
  // order: [[0, 'desc']],
  order: [[9, 'desc'], [10, 'desc']],
  pageLength: 20,
  // throttleRefresh: 3600000,
  lengthMenu: [[20, 50, 100], [20, 50, 100]],
  language: {      
      lengthMenu: "Showing _MENU_ cases per page",
      zeroRecords: "No Audit Data",
      info: "Showing _START_ to _END_ of _TOTAL_ cases",
      infoEmpty: "No Audit Record Available",
      infoFiltered: "(filtered from _MAX_ total cases)",
      processing: "Compiling data...please wait...",
      search: "Quick Search: "
  },
  columns: [

    // {data: "compDate", width: 100, title: "Computed<br>Date", className: 'comp-date', render(v, t, d) {     
    //   // return Meteor.libMethods.bDueDate(v, 5);
    //   // console.log(d.fullname, d.daysRemaining);
    //   // return Meteor.libMethods.bDueDate4Neg(new Date(), d.daysRemaining+1);
    //   return Util.dateFormatS(v) || Util.bDueDate(v, 3);
    // }},
    {title: "Revd.", className: 'reviewed-container',
      createdCell: Meteor.isClient && function (cell, cellData, rowData) {        
        return Blaze.renderWithData(Template.UBACollaborationAuditReviewed, {
          data: rowData
        }, cell);
      },
    },    
    {data: "percent", width: 100, title: "Val.", className: 'percent'},
    {data: "simName", width: 100, title: "Simulation", className: 'sim-name'},
    {data: "cName", width: 100, title: "Client", className: 'client-name'},
    {data: "buName", width: 100, title: "BU", className: 'bu-name'},
    // {width: 120, title: "User 1", render(v, t, d) {
    //   // return d.u1fname + " " + d.u1lname;
    //   return d.u1fname + " " + d.u1lname + ' <button class="ui mini icon button circular btn-exclude" data-d="1" data-tooltip="Exclude"><i class="icon x"></i></button>';
    // }},
    {data: "u1Name", width: 120, title: "User 1", className: 'u1-name',
      createdCell: Meteor.isClient && function (cell, cellData, rowData) {        
        return Blaze.renderWithData(Template.UBACollaborationAuditU1Name, {
          data: rowData
        }, cell);
      },
    },    
    // {width: 120, title: "User 2", render(v, t, d) {
    //   // return d.u2fname + " " + d.u2lname;
    //   return d.u2fname + " " + d.u2lname + ' <button class="ui mini icon button circular btn-exclude" data-d="2" data-tooltip="Exclude"><i class="icon x"></i></button>';
    // }},
    {data: "u2Name", width: 120, title: "User 2", className: 'u2-name',
      createdCell: Meteor.isClient && function (cell, cellData, rowData) {        
        return Blaze.renderWithData(Template.UBACollaborationAuditU2Name, {
          data: rowData
        }, cell);
      },
    },    
    {data: "u1Country", width: 150, title: "U1<br>Country"},
    {data: "u2Country", width: 150, title: "U2<br>Country"},    
    {data: "u1SubAt", width: 150, title: "U1SubmittedAt", render(v,t,d) {
      return Util.dateFormatS(v) || Util.bDueDate(v, 3);
    }},    
    {data: "u2SubAt", width: 150, title: "U2SubmittedAt", render(v,t,d) {
      return Util.dateFormatS(v) || Util.bDueDate(v, 3);
    }},    
    {title: "Comment", className: 'comment-container',
      createdCell: Meteor.isClient && function (cell, cellData, rowData) {        
        return Blaze.renderWithData(Template.UBACollaborationAuditComment, {
          data: rowData
        }, cell);
      },
    },
    {title: "Collabtd", className: 'collaborated-container',
      createdCell: Meteor.isClient && function (cell, cellData, rowData) {        
        return Blaze.renderWithData(Template.UBACollaborationAuditCollaborated, {
          data: rowData
        }, cell);
      },
    },    
    {data: "cid", visible: false},
    {data: "buid", visible: false},
    {data: "sid", visible: false},
    {data: "u1Id", visible: false},
    {data: "u2Id", visible: false},
    {data: "u1fname", visible: false},
    {data: "u2fname", visible: false},
    {data: "u1lname", visible: false},
    {data: "u2lname", visible: false},        
    {data: "reviewed", visible: false},        
    {data: "comment", visible: false},        
    {data: "collaborated", visible: false}, 
    {data: "cAt", visible: false},
    {data: "key", visible: false},
    {data: "excluded", visible: false}
  ] 
});
