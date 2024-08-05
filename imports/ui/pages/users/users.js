import { Session } from 'meteor/session'

import Tabular from 'meteor/aldeed:tabular';

import { Util } from '/imports/lib/util.js'

// import '/imports/ui/pages/users/v1-users.js'

import './users.html'
import '/imports/ui/stylesheets/users/users.less'

let _selfUsers

Template.Users.onCreated(function usersOnCreated() {

  _selfUsers = this

  _selfUsers.tabs = {
    first: 'UserPermission', //-- name of the template to inject
    second: 'V1Users' //-- name of the template to inject
  }

  Session.set("Users.tabs", _selfUsers.tabs)
  $('.attached.tab.first').addClass('loading')  

  Util.loading(false)
})

Template.Users.onRendered(function usersOnRendered() {
  
  $('.users-column-container .users-menu .item').tab({
      onLoad: function(path, params, history) {
        if(Meteor.userId()) {

          let tabs = {
            first: null,
            second: null,
            third: null,
            fourth: null
          }
          tabs[path] = _selfUsers.tabs[path]

          Session.set("Users.tabs", tabs)  
          Session.set("Users.tabs.current", path)  
          
          let msg = ''
          if(path === 'first') {
            msg = 'user-permission'
          }
          else if(path === 'second') {
            msg = 'v1users'
          }

          Util.log(Meteor.user(), msg, "users")

        } else {
          Util.alert({mode: 'error'})

          FlowRouter.go('/'+___aR+'/signin')
        }
      },
  })
})

Template.Users.helpers({
  UserPermission() {    
    if(Session.get("Users.tabs").first) {
      import '/imports/ui/pages/users/user-permission.js'
        
      return Session.get("Users.tabs").first
    }
  },
  V1Users() {    
    if(Session.get("Users.tabs").second) {
      import '/imports/ui/pages/users/v1-users.js'
        
      return Session.get("Users.tabs").second
    }
  },  
})
