// Ground.Collection(Meteor.users);

import { Mongo } from 'meteor/mongo';

import Tabular from 'meteor/aldeed:tabular';

import { Util } from '/imports/lib/util.js'

export const V1Users = new Mongo.Collection('v1_users');

new Tabular.Table({
  name: "v1Users",
  collection: V1Users,  
  order: [[5, 'desc']],
  pageLength: 20,  
  lengthMenu: [[20, 50, 100], [20, 50, 100]],
  language: {
      zeroRecords: "No user data to process",      
      info: "Showing _START_ to _END_ of _TOTAL_ users",
      infoEmpty: "No user record to process",
      processing: "Processing ...",
      search: 'Search User: ',
  },  
  columns: [
    {data: "lname", title: "Lastname", width: 150},
    {data: "fname", title: "Firstname", width: 150},
    {data: "email", title: "Email"},
    {data: "username", title: "Username"},
    {data: "company_name", title: "Client"},
    {data: "created", title: "Created", render(v, t, d) {
      let _date = new Date(v) //-- this needed for v1 user date data
      return Util.dateHMS(_date);
    }}
  ]
});
