import { Session } from  'meteor/session'

import './home.html';
import '/imports/ui/stylesheets/home/home.less'

Template.Home.onCreated(function homeOnCreated() {
  Tracker.autorun(() => {
    // console.log(Meteor.user())
    if(Meteor.user()) {
      Meteor.subscribe('craa_admin_users')
    }
// console.log(Session.get("Findings.count"))
    if(!Session.get("Findings.count")) {
      Meteor.call("Findings.count", {}, (err, res) => {
        // console.log(err, res)
        if(res) {
          // console.log(res)
          if(res.data) {
            Session.set("Findings.count", res.data)
          }
        }
      })
    }

  })
})

Template.Home.onRendered(function homeOnRendered() {
  $('body').css({
    backgroundImage: 'none'
  })

  let 
    screenWidth = window.screen.availWidth || window.screen.width,
    screenHeight = window.screen.availHeight || window.screen.height

  if(Meteor.isDesktop) {
    Desktop.send('desktop', 'setWindowSize', {width: screenWidth-200, height: screenHeight-100})
    Desktop.send('desktop', 'showMenu')
  }
  
  $('.ui.modal').modal('hide all')

  document.title = "CRAA Admin Desktop v1 - " + Meteor.user().profile.fullname;
})

Template.Home.helpers({
  craaAdminUsers() {
    let users = Meteor.users.find({
      _id: {$ne: Meteor.userId()},
      'profile.role': {$ne: '1'}
    }).fetch()
    // console.log("users => ", users)
    if(users && users.length > 0) {
      Session.set("Users.craa.admins", users)
    }
  },
  // findings() {
  //   console.log('aaa')
  //   Meteor.call("Findings.count", {}, (err, res) => {
  //     if(res) {
  //       console.log(res)
  //     }
  //   })
  // }
})
